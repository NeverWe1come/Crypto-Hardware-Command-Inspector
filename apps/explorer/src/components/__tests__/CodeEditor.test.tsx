/**
 * @packageDocumentation
 * Component test suite for the CodeMirror 6 CodeEditor component (`@chci/explorer`).
 *
 * Verifies:
 * - CodeMirror 6 editor mounting and initial raw text population
 * - Segment decoration styling (delimiter, header, command-code, field, tag, etc.)
 * - ASCII control character badges (<STX>, <ETX>, ␙, <CR>, <LF>)
 * - Document modification event dispatching (onChange)
 * - Hover and selection synchronization with external inspector panels
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IntlProvider } from 'react-intl';
import { CodeEditor } from '../CodeEditor';
import type { ControlCharInfo, FrameSegment } from '@chci/parser-core';
import { getMessages } from '../../i18n';

/**
 * Test wrapper providing react-intl context.
 */
function renderWithIntl(ui: React.ReactElement, locale: 'es' | 'en' = 'es') {
  return {
    user: userEvent.setup(),
    ...render(
      <IntlProvider locale={locale} messages={getMessages(locale)} defaultLocale="es">
        {ui}
      </IntlProvider>
    )
  };
}

describe('Phase 4: CodeEditor Component (CodeMirror 6)', () => {
  describe('Editor Mounting & Text Rendering', () => {
    it('mounts the CodeMirror 6 editor instance with raw command text', () => {
      const rawCommand = '<31#1#1#N#>';
      renderWithIntl(<CodeEditor raw={rawCommand} />);

      const container = screen.getByTestId('code-editor-container');
      expect(container).toBeInTheDocument();

      // CodeMirror editor root element
      const cmEditor = container.querySelector('.cm-editor');
      expect(cmEditor).toBeInTheDocument();

      // Contenteditable area containing document text
      const cmContent = container.querySelector('.cm-content');
      expect(cmContent).toBeInTheDocument();
      expect(cmContent).toHaveTextContent('<31#1#1#N#>');
    });

    it('safely handles empty raw input string without error', () => {
      renderWithIntl(<CodeEditor raw="" />);

      const cmContent = document.querySelector('.cm-content');
      expect(cmContent).toBeInTheDocument();
      expect(cmContent?.textContent).toBe('');
    });

    it('updates editor text when the raw prop changes externally', () => {
      const { rerender } = render(
        <IntlProvider locale="es" messages={getMessages('es')} defaultLocale="es">
          <CodeEditor raw="0000NC" />
        </IntlProvider>
      );

      let cmContent = document.querySelector('.cm-content');
      expect(cmContent).toHaveTextContent('0000NC');

      // Update prop to response frame
      rerender(
        <IntlProvider locale="es" messages={getMessages('es')} defaultLocale="es">
          <CodeEditor raw="0000ND00" />
        </IntlProvider>
      );

      cmContent = document.querySelector('.cm-content');
      expect(cmContent).toHaveTextContent('0000ND00');
    });
  });

  describe('Segment Coloring & Styling Decorations', () => {
    it('decorates delimiter, command-code, and field segments with distinct semantic CSS classes', () => {
      const raw = '<31#1#1#N#>';
      const segments: readonly FrameSegment[] = [
        {
          id: 'seg_delim_open',
          role: 'delimiter',
          label: { es: 'Delimitador inicio', en: 'Start delimiter' },
          rawValue: '<',
          start: 0,
          end: 1
        },
        {
          id: 'seg_cmd',
          role: 'command-code',
          label: { es: 'Código de comando', en: 'Command code' },
          rawValue: '31',
          start: 1,
          end: 3
        },
        {
          id: 'seg_delim_1',
          role: 'delimiter',
          label: { es: 'Separador', en: 'Field separator' },
          rawValue: '#',
          start: 3,
          end: 4
        },
        {
          id: 'seg_f1',
          role: 'field',
          label: { es: 'Subcomando', en: 'Subcommand' },
          rawValue: '1',
          start: 4,
          end: 5,
          fieldId: 'fld_subcmd'
        }
      ];

      renderWithIntl(<CodeEditor raw={raw} segments={segments} />);

      // Delimiter decoration
      const delims = document.querySelectorAll('.cm-segment-delimiter');
      expect(delims.length).toBeGreaterThanOrEqual(1);

      // Command-code decoration
      const cmdCodes = document.querySelectorAll('.cm-segment-command-code');
      expect(cmdCodes.length).toBeGreaterThanOrEqual(1);
      expect(cmdCodes[0]).toHaveTextContent('31');

      // Field decoration
      const fields = document.querySelectorAll('.cm-segment-field');
      expect(fields.length).toBeGreaterThanOrEqual(1);
      expect(fields[0]).toHaveTextContent('1');
    });

    it('decorates header segment in header-positional protocol (Thales payShield 10K)', () => {
      const raw = '0000NC';
      const segments: readonly FrameSegment[] = [
        {
          id: 'seg_header',
          role: 'header',
          label: { es: 'Cabecera de mensaje', en: 'Message header' },
          rawValue: '0000',
          start: 0,
          end: 4
        },
        {
          id: 'seg_cmd',
          role: 'command-code',
          label: { es: 'Código de comando', en: 'Command code' },
          rawValue: 'NC',
          start: 4,
          end: 6
        }
      ];

      renderWithIntl(<CodeEditor raw={raw} segments={segments} />);

      const headerSegment = document.querySelector('.cm-segment-header');
      expect(headerSegment).toBeInTheDocument();
      expect(headerSegment).toHaveTextContent('0000');
    });

    it('decorates tag and tag-value segments in tag-value protocol (Futurex Excrypt)', () => {
      const raw = '[AOECHO;]';
      const segments: readonly FrameSegment[] = [
        {
          id: 'seg_open',
          role: 'delimiter',
          label: { es: 'Delimitador', en: 'Delimiter' },
          rawValue: '[',
          start: 0,
          end: 1
        },
        {
          id: 'seg_tag',
          role: 'tag',
          label: { es: 'Etiqueta', en: 'Tag' },
          rawValue: 'AO',
          start: 1,
          end: 3,
          tag: 'AO'
        },
        {
          id: 'seg_val',
          role: 'tag-value',
          label: { es: 'Valor', en: 'Value' },
          rawValue: 'ECHO',
          start: 3,
          end: 7
        }
      ];

      renderWithIntl(<CodeEditor raw={raw} segments={segments} />);

      const tagElem = document.querySelector('.cm-segment-tag');
      expect(tagElem).toBeInTheDocument();
      expect(tagElem).toHaveTextContent('AO');

      const valElem = document.querySelector('.cm-segment-tag-value');
      expect(valElem).toBeInTheDocument();
      expect(valElem).toHaveTextContent('ECHO');
    });
  });

  describe('ASCII Control Characters Visual Badges', () => {
    it('replaces ASCII control character 0x19 (EM / ␙) with readable visual badge', () => {
      const raw = '0000NC\x19TRAILER';
      const controlChars: readonly ControlCharInfo[] = [
        {
          index: 6,
          code: 0x19,
          hex: '0x19',
          name: 'EM',
          symbol: '␙'
        }
      ];

      renderWithIntl(<CodeEditor raw={raw} controlChars={controlChars} />);

      // Badge representation for 0x19
      const badge = document.querySelector('.cm-control-char[data-code="0x19"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(/␙|EM|<EM>/i);
    });

    it('replaces STX (0x02) and ETX (0x03) framing bytes with readable badges', () => {
      const raw = '\x02<31#>\x03';
      const controlChars: readonly ControlCharInfo[] = [
        {
          index: 0,
          code: 0x02,
          hex: '0x02',
          name: 'STX',
          symbol: '<STX>'
        },
        {
          index: 6,
          code: 0x03,
          hex: '0x03',
          name: 'ETX',
          symbol: '<ETX>'
        }
      ];

      renderWithIntl(<CodeEditor raw={raw} controlChars={controlChars} />);

      const stxBadge = document.querySelector('.cm-control-char[data-code="0x02"]');
      expect(stxBadge).toBeInTheDocument();
      expect(stxBadge).toHaveTextContent(/<STX>|STX/i);

      const etxBadge = document.querySelector('.cm-control-char[data-code="0x03"]');
      expect(etxBadge).toBeInTheDocument();
      expect(etxBadge).toHaveTextContent(/<ETX>|ETX/i);
    });
  });

  describe('Input Editing & Change Notification', () => {
    it('invokes onChange when editor content changes', async () => {
      const onChange = vi.fn();
      renderWithIntl(<CodeEditor raw="<31#>" onChange={onChange} />);

      const cmContent = document.querySelector('.cm-content');
      expect(cmContent).toBeInTheDocument();

      // Input an extra character into the contenteditable editor
      fireEvent.input(cmContent!, {
        target: { textContent: '<31#1#>' }
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Hover & Cursor Segment Synchronization', () => {
    it('invokes onHoverSegment when mouse enters a segment decoration and clears on leave', () => {
      const raw = '<31#1#>';
      const segment: FrameSegment = {
        id: 'seg_target',
        role: 'command-code',
        label: { es: 'Código', en: 'Code' },
        rawValue: '31',
        start: 1,
        end: 3
      };

      const onHover = vi.fn();
      renderWithIntl(
        <CodeEditor
          raw={raw}
          segments={[segment]}
          onHoverSegment={onHover}
        />
      );

      const segmentElem = document.querySelector('.cm-segment-command-code');
      expect(segmentElem).toBeInTheDocument();

      // Mouse enter
      fireEvent.mouseOver(segmentElem!);
      expect(onHover).toHaveBeenCalledWith(expect.objectContaining({ id: 'seg_target' }));

      // Mouse leave
      fireEvent.mouseOut(segmentElem!);
      expect(onHover).toHaveBeenCalledWith(null);
    });

    it('highlights matching segment element when highlightedSegmentId prop is provided externally', () => {
      const raw = '<31#1#>';
      const segments: readonly FrameSegment[] = [
        {
          id: 'seg_f1',
          role: 'field',
          label: { es: 'Campo 1', en: 'Field 1' },
          rawValue: '1',
          start: 4,
          end: 5
        }
      ];

      renderWithIntl(
        <CodeEditor
          raw={raw}
          segments={segments}
          highlightedSegmentId="seg_f1"
        />
      );

      const highlightedElem = document.querySelector('.cm-segment-highlighted');
      expect(highlightedElem).toBeInTheDocument();
      expect(highlightedElem).toHaveTextContent('1');
    });
  });
});
