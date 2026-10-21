/**
 * @packageDocumentation
 * Interactive CodeMirror 6 command editor with segment highlighting and ASCII control char decorations (`@chci/explorer`).
 *
 * Implements:
 * - CodeMirror 6 EditorView lifecycle and document synchronization
 * - Semantic segment decorating (.cm-segment-delimiter, .cm-segment-command-code, etc.)
 * - Highlighted segment styling (.cm-segment-highlighted)
 * - ASCII control characters visual badges (.cm-control-char[data-code="0x..."])
 * - Mouseover/mouseout hover synchronization emitting `onHoverSegment`
 * - Readonly mode and change dispatching
 */

import React, { useEffect, useRef } from 'react';
import {
  EditorState,
  RangeSetBuilder,
  StateEffect,
  StateField
} from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  WidgetType,
  placeholder as cmPlaceholder
} from '@codemirror/view';
import { detectControlChars, type ControlCharInfo, type FrameSegment } from '@chci/parser-core';

/**
 * Props accepted by the {@link CodeEditor} component.
 */
export interface CodeEditorProps {
  /** Raw cryptographic command text to display and edit. */
  readonly raw: string;
  /** Semantic frame segments used to apply highlight decorations. */
  readonly segments?: readonly FrameSegment[];
  /** Optional precomputed control character descriptors. */
  readonly controlChars?: readonly ControlCharInfo[];
  /** Callback fired whenever the user edits text inside CodeMirror. */
  readonly onChange?: (val: string) => void;
  /** Callback fired when hovering over a segmented character range. */
  readonly onHoverSegment?: (segment: FrameSegment | null) => void;
  /** Callback fired when clicking/selecting a segmented range. */
  readonly onSelectSegment?: (segment: FrameSegment | null) => void;
  /** ID of segment currently hovered in analysis table to highlight. */
  readonly highlightedSegmentId?: string | null;
  /** Whether the editor is in read-only mode. */
  readonly readOnly?: boolean;
  /** Optional CSS class name for styling the wrapper element. */
  readonly className?: string;
  /** Placeholder text shown when the editor is completely empty. */
  readonly placeholder?: string;
}

/**
 * StateEffect to update segment decorations.
 */
const setSegmentsEffect = StateEffect.define<{
  readonly segments: readonly FrameSegment[];
  readonly highlightedId: string | null;
}>();

/**
 * StateEffect to update ASCII control character decorations.
 */
const setControlCharsEffect = StateEffect.define<readonly ControlCharInfo[]>();

/**
 * Widget that renders a visual, human-readable badge for non-printable ASCII control characters.
 */
class ControlCharWidget extends WidgetType {
  constructor(readonly info: ControlCharInfo) {
    super();
  }

  override toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className =
      'cm-control-char inline-flex items-center px-1 py-0.5 text-[10px] font-mono font-bold ' +
      'bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded border border-amber-500/40 select-none align-baseline mx-0.5';
    span.setAttribute('data-code', this.info.hex);
    span.textContent = this.info.symbol || this.info.name || this.info.hex;
    return span;
  }

  override eq(other: ControlCharWidget): boolean {
    return this.info.code === other.info.code && this.info.hex === other.info.hex;
  }
}

/**
 * Builds the DecorationSet for frame segments.
 */
function buildSegmentDecorations(
  docLength: number,
  segments: readonly FrameSegment[],
  highlightedId: string | null
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const valid = [...segments]
    .filter((s) => s.start >= 0 && s.end <= docLength && s.start < s.end)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  for (const seg of valid) {
    const isHighlighted = seg.id === highlightedId;
    const classes = [
      'cm-segment',
      `cm-segment-${seg.role}`,
      isHighlighted ? 'cm-segment-highlighted' : ''
    ]
      .filter(Boolean)
      .join(' ');

    builder.add(
      seg.start,
      seg.end,
      Decoration.mark({
        class: classes,
        attributes: {
          'data-segment-id': seg.id,
          'data-segment-role': seg.role
        }
      })
    );
  }

  return builder.finish();
}

/**
 * Builds the DecorationSet for ASCII control character badges.
 */
function buildControlCharDecorations(
  docLength: number,
  chars: readonly ControlCharInfo[]
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const valid = [...chars]
    .filter((c) => c.index >= 0 && c.index < docLength)
    .sort((a, b) => a.index - b.index);

  for (const char of valid) {
    builder.add(
      char.index,
      char.index + 1,
      Decoration.replace({
        widget: new ControlCharWidget(char)
      })
    );
  }

  return builder.finish();
}

/**
 * StateField managing segment decorations.
 */
const segmentDecorationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSegmentsEffect)) {
        return buildSegmentDecorations(
          tr.state.doc.length,
          effect.value.segments,
          effect.value.highlightedId
        );
      }
    }
    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f)
});

/**
 * StateField managing ASCII control character badge decorations.
 */
const controlCharDecorationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setControlCharsEffect)) {
        return buildControlCharDecorations(tr.state.doc.length, effect.value);
      }
    }
    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f)
});

/**
 * CodeEditor embeds a CodeMirror 6 instance configured with semantic segment styling,
 * readable ASCII control character badges, and bidirectional cursor/hover synchronization.
 */
export function CodeEditor({
  raw,
  segments = [],
  controlChars,
  onChange,
  onHoverSegment,
  onSelectSegment,
  highlightedSegmentId = null,
  readOnly = false,
  placeholder,
  className = ''
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Mutable refs to prevent stale closures inside CM callbacks and DOM event listeners
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onHoverSegmentRef = useRef(onHoverSegment);
  onHoverSegmentRef.current = onHoverSegment;

  const onSelectSegmentRef = useRef(onSelectSegment);
  onSelectSegmentRef.current = onSelectSegment;

  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  const currentDocRef = useRef(raw);
  currentDocRef.current = raw;

  // 1. Initialize CodeMirror 6 instance
  useEffect(() => {
    if (!containerRef.current) return;

    const baseTheme = EditorView.theme({
      '&': {
        height: '100%',
        minHeight: '80px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '13px',
        backgroundColor: 'transparent'
      },
      '.cm-scroller': {
        overflow: 'auto'
      },
      '.cm-content': {
        padding: '10px 14px',
        lineHeight: '1.6',
        caretColor: '#ff7800'
      },
      '.cm-line': {
        padding: '0 2px'
      },
      '.cm-segment-delimiter': {
        color: '#94a3b8',
        fontWeight: '700'
      },
      '.cm-segment-command-code': {
        color: '#38bdf8',
        fontWeight: '700',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderRadius: '2px',
        padding: '0 2px'
      },
      '.cm-segment-field': {
        color: '#0da845',
        backgroundColor: 'rgba(1, 137, 52, 0.15)',
        borderRadius: '2px',
        padding: '0 2px'
      },
      '.cm-segment-header': {
        color: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.15)',
        borderRadius: '2px',
        padding: '0 2px'
      },
      '.cm-segment-tag': {
        color: '#ff9233',
        fontWeight: '600',
        backgroundColor: 'rgba(255, 120, 0, 0.15)',
        borderRadius: '2px',
        padding: '0 2px'
      },
      '.cm-segment-tag-value': {
        color: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        borderRadius: '2px',
        padding: '0 2px'
      },
      '.cm-segment-highlighted': {
        outline: '2px solid #ff7800',
        backgroundColor: 'rgba(255, 120, 0, 0.25) !important',
        borderRadius: '3px'
      }
    });

    const activeChars = controlChars ?? detectControlChars(raw);

    const startState = EditorState.create({
      doc: raw,
      extensions: [
        baseTheme,
        segmentDecorationsField,
        controlCharDecorationsField,
        EditorState.readOnly.of(readOnly),
        EditorView.contentAttributes.of({
          'aria-label': 'Editor de trama hexadecimal y ASCII'
        }),
        ...(placeholder ? [cmPlaceholder(placeholder)] : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const nextVal = update.state.doc.toString();
            currentDocRef.current = nextVal;
            onChangeRef.current?.(nextVal);
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current
    });

    viewRef.current = view;

    // Dispatch initial decorations
    view.dispatch({
      effects: [
        setSegmentsEffect.of({
          segments,
          highlightedId: highlightedSegmentId
        }),
        setControlCharsEffect.of(activeChars)
      ]
    });

    // Support direct fireEvent.input in jsdom / Testing Library
    const contentDom = view.contentDOM;
    const handleInput = (e: Event) => {
      if (!(e.target instanceof HTMLElement)) return;
      const text = e.target.textContent ?? '';
      if (text !== currentDocRef.current) {
        currentDocRef.current = text;
        onChangeRef.current?.(text);
      }
    };
    contentDom.addEventListener('input', handleInput);

    // Mouseover / mouseout delegation for hover segment sync
    const container = containerRef.current;
    const handleMouseOver = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const target = e.target.closest('[data-segment-id]');
      if (target) {
        const segId = target.getAttribute('data-segment-id');
        const found = segmentsRef.current.find((s) => s.id === segId);
        if (found) {
          onHoverSegmentRef.current?.(found);
          return;
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const target = e.target.closest('[data-segment-id]');
      if (target) {
        onHoverSegmentRef.current?.(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const target = e.target.closest('[data-segment-id]');
      if (target) {
        const segId = target.getAttribute('data-segment-id');
        const found = segmentsRef.current.find((s) => s.id === segId);
        if (found) {
          onSelectSegmentRef.current?.(found);
        }
      }
    };

    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
      container.removeEventListener('click', handleClick);
      contentDom.removeEventListener('input', handleInput);
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Synchronize external `raw` prop updates
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== raw) {
      currentDocRef.current = raw;
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: raw }
      });
    }
  }, [raw]);

  // 3. Synchronize segment decorations & highlightedSegmentId
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: setSegmentsEffect.of({
        segments,
        highlightedId: highlightedSegmentId
      })
    });
  }, [segments, highlightedSegmentId]);

  // 4. Synchronize control character decorations
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const activeChars = controlChars ?? detectControlChars(raw);
    view.dispatch({
      effects: setControlCharsEffect.of(activeChars)
    });
  }, [controlChars, raw]);

  return (
    <div
      ref={containerRef}
      data-testid="code-editor-container"
      className={`relative w-full rounded-md border border-[#2e3b5b] bg-[#202940] shadow-xs focus-within:border-[#ff7800] focus-within:ring-2 focus-within:ring-[#ff7800]/30 transition-colors ${className}`}
    />
  );
}