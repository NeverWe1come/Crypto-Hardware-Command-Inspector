/**
 * @packageDocumentation
 * Detailed command inspection and cryptographic analysis panel (`@chci/explorer`).
 *
 * Implements the 8-block accordion inspector:
 * 1. General Information (device, version, command code, direction mismatch warning, manual citation)
 * 2. Parameter Breakdown (interactive table, sensitive data masking/unmasking, synchronized hover/selection)
 * 3. Frame View (syntax-colored segment pills with role metadata)
 * 4. Response & Error Code (vendor title, description, troubleshooting)
 * 5. Diagnostics (severity badges, localized parser messages)
 * 6. Expected Response Template (paired code, expected fields)
 * 7. Request ↔ Response Correlation (verification checklist)
 * 8. Manufacturer Notes (hardware caveats, firmware release notes)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  parseCommand,
  resolveDeviceVersion,
  type DeviceSpec,
  type FrameSegment,
  type LocalizedString,
  type ParseResult
} from '@chci/parser-core';
import { getDeviceSpec } from '@chci/device-specs';
import type { CommandEntry, WorkspaceTab } from '../state/types';
import { useOptionalWorkspace } from '../state/workspace-context';
import { Button } from './ui/button';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Layers,
  Info
} from 'lucide-react';
import { CommandInfoModal } from './CommandInfoModal';

export interface AnalysisPanelProps {
  /** Target cryptographic hardware device specification */
  readonly deviceSpec?: DeviceSpec | null;
  /** Active workspace tab containing the commands list */
  readonly tab?: WorkspaceTab | null;
  /** Currently active command entry (defaults to tab.commands matching tab.activeCommandId) */
  readonly activeCommand?: CommandEntry | null;
  /** Precomputed parse result for activeCommand */
  readonly parseResult?: ParseResult | null;
  /** Currently highlighted / hovered segment ID */
  readonly highlightedSegmentId?: string | null;
  /** Currently selected segment ID */
  readonly selectedSegmentId?: string | null;
  /** Callback fired when hovering over a field row or frame segment */
  readonly onHoverSegment?: (segment: FrameSegment | null) => void;
  /** Callback fired when selecting/clicking a field row or frame segment */
  readonly onSelectSegment?: (segment: FrameSegment | null) => void;
  /** Callback fired when navigating commands via pagination */
  readonly onNavigateCommand?: (commandId: string) => void;
  /** Optional class name for the root container */
  readonly className?: string;
}

/**
 * Detailed cryptographic analysis panel displaying deep breakdown of active command frame
 * into 8 collapsible accordion blocks: general info, parameter breakdown with masking,
 * color-coded frame view, response/error codes, diagnostic alerts, expected response template,
 * request-response cross correlation, and official vendor firmware notes.
 *
 * @param props - Component properties and event handlers.
 * @returns Cryptographic analysis panel JSX element.
 */
export function AnalysisPanel(props: AnalysisPanelProps) {
  const intl = useIntl();
  const locale = (intl.locale === 'en' ? 'en' : 'es') as 'es' | 'en';
  const workspace = useOptionalWorkspace();

  // 1. Resolve State & Props
  const activeTab = useMemo(() => {
    if (props.tab !== undefined) return props.tab;
    return (
      workspace?.state.tabs.find((t) => t.id === workspace.state.activeTabId) ?? null
    );
  }, [props.tab, workspace?.state.tabs, workspace?.state.activeTabId]);

  const deviceSpec = useMemo(() => {
    if (props.deviceSpec !== undefined) return props.deviceSpec;
    if (activeTab?.deviceId) return getDeviceSpec(activeTab.deviceId) ?? null;
    return null;
  }, [props.deviceSpec, activeTab?.deviceId]);

  const activeCommand = useMemo(() => {
    if (props.activeCommand !== undefined) return props.activeCommand;
    if (!activeTab || activeTab.commands.length === 0) return null;
    return (
      activeTab.commands.find((c) => c.id === activeTab.activeCommandId) ??
      activeTab.commands[0] ??
      null
    );
  }, [props.activeCommand, activeTab]);

  // 2. Resolve Parse Results & Linked Commands
  const parseResult = useMemo(() => {
    if (props.parseResult !== undefined) return props.parseResult;
    if (!activeCommand || !deviceSpec) return null;
    return parseCommand(activeCommand.raw, deviceSpec, {
      version: activeCommand.version,
      expectedDirection: activeCommand.direction,
      headerLength: activeTab?.headerLength,
      interfaceId: activeCommand.interfaceId
    });
  }, [props.parseResult, activeCommand, deviceSpec, activeTab?.headerLength]);

  // 3. UI State: Accordion sections, Sensitive fields masking
  // Sections: 'frame-view', 'fields', 'unified-diagnostics', 'notes'. ('general-info' starts collapsed by default)
  const [openSections, setOpenSections] = useState<Set<string>>(
    () =>
      new Set([
        'frame-view',
        'fields',
        'unified-diagnostics',
        'notes'
      ])
  );

  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());
  const [revealAll, setRevealAll] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [expandedFieldDetails, setExpandedFieldDetails] = useState<Set<string>>(new Set());

  // Reset sensitive field unmasking and expanded field details whenever active command switches
  useEffect(() => {
    setRevealedFields(new Set());
    setRevealAll(false);
    setExpandedFieldDetails(new Set());
  }, [activeCommand?.id]);

  const toggleFieldDetails = (fieldId: string) => {
    setExpandedFieldDetails((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const toggleSensitiveField = (fieldId: string) => {
    setRevealedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  const toggleRevealAll = () => {
    setRevealAll((prev) => !prev);
  };

  const handleNavigateCommand = (targetId: string) => {
    if (props.onNavigateCommand) {
      props.onNavigateCommand(targetId);
    } else if (workspace?.dispatch) {
      workspace.dispatch({
        type: 'SELECT_COMMAND',
        payload: { commandId: targetId }
      });
    }
  };

  const resolveText = useCallback(
    (ls?: LocalizedString | null): string => {
      if (!ls) return '';
      return ls[locale] ?? ls.es ?? ls.en ?? '';
    },
    [locale]
  );

  const versionSpec = useMemo(() => {
    if (!deviceSpec || !activeCommand) return null;
    return resolveDeviceVersion(deviceSpec, activeCommand.version);
  }, [deviceSpec, activeCommand]);

  const notesList = useMemo(() => {
    const list: string[] = [];
    const vNotes = resolveText(versionSpec?.releaseNotes);
    if (vNotes) {
      const chunks = vNotes.split(/(?=\[(?:CAUTION|IMPORTANT|TIP|NOTE)\]|\b(?:CAUTION|IMPORTANT|TIP|NOTE):)/i);
      for (const c of chunks) {
        if (c.trim()) list.push(c.trim());
      }
    }
    if (parseResult?.matchedCommand?.notes) {
      for (const n of parseResult.matchedCommand.notes) {
        const text = resolveText(n);
        if (text) {
          const chunks = text.split(/(?=\[(?:CAUTION|IMPORTANT|TIP|NOTE)\]|\b(?:CAUTION|IMPORTANT|TIP|NOTE):)/i);
          for (const c of chunks) {
            if (c.trim()) list.push(c.trim());
          }
        }
      }
    }
    return list;
  }, [resolveText, versionSpec?.releaseNotes, parseResult?.matchedCommand?.notes]);

  // 4. Empty State Handling
  // Empty state is rendered ONLY when:
  // - props.tab is explicitly provided as null or with 0 commands AND no activeCommand is passed
  // - OR activeCommand is null/undefined
  const isExplicitEmptyTab =
    props.tab !== undefined &&
    (props.tab === null || props.tab.commands.length === 0) &&
    !props.activeCommand;
  const hasNoCommand = !activeCommand;

  if (isExplicitEmptyTab || hasNoCommand) {
    return (
      <div
        data-testid="analysis-panel"
        className={`flex flex-col h-full bg-background overflow-hidden ${props.className ?? ''}`}
        aria-label="Panel de análisis"
      >
        <div
          data-testid="analysis-panel-empty"
          className="flex-1 p-6 flex flex-col items-center justify-center text-center text-muted-foreground space-y-2 select-none"
        >
          <div data-testid="analysis-panel-placeholder" className="flex flex-col items-center justify-center space-y-2">
            <div className="size-10 rounded-full bg-muted/40 border border-border flex items-center justify-center text-muted-foreground">
              <Layers className="size-5" />
            </div>
            <p className="text-xs font-medium text-foreground">
              <FormattedMessage
                id="analysis.empty"
                defaultMessage="No hay comandos en la pestaña activa"
              />
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              <FormattedMessage
                id="analysis.empty.description"
                defaultMessage="Selecciona un comando en la lista para ver su desglose criptográfico detallado."
              />
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 5. Effective tab for pagination and command links
  const effectiveTab: WorkspaceTab = activeTab ?? {
    id: 'tab_virtual',
    deviceId: deviceSpec?.id ?? 'generic',
    version: activeCommand.version,
    commands: [activeCommand],
    activeCommandId: activeCommand.id
  };

  const currentIndex = effectiveTab.commands.findIndex((c) => c.id === activeCommand.id);
  const totalCommands = effectiveTab.commands.length;

  const hasDirectionMismatch =
    parseResult &&
    parseResult.detectedDirection !== 'unknown' &&
    activeCommand.direction &&
    parseResult.detectedDirection !== activeCommand.direction;

  const isResponse = activeCommand.direction === 'response';

  const activeInterfaceId =
    activeCommand.interfaceId ??
    parseResult?.detectedInterfaceId ??
    deviceSpec?.defaultInterface;
  const activeInterface = deviceSpec?.interfaces?.find((i) => i.id === activeInterfaceId);

  return (
    <div
      data-testid="analysis-panel"
      className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${
        props.className ?? ''
      }`}
      aria-label="Panel de análisis"
    >
      {/* Top Command Pagination Header */}
      <div
        data-testid="command-pagination"
        className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20 shrink-0 text-xs select-none"
      >
        <span
          data-testid="command-pagination-indicator"
          className="font-mono text-muted-foreground text-[11px]"
        >
          {locale === 'en'
            ? `Command ${currentIndex >= 0 ? currentIndex + 1 : 1} of ${totalCommands}`
            : `Comando ${currentIndex >= 0 ? currentIndex + 1 : 1} de ${totalCommands}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="btn-prev-command"
            disabled={currentIndex <= 0}
            onClick={() => {
              const prev = effectiveTab.commands[currentIndex - 1];
              if (prev) handleNavigateCommand(prev.id);
            }}
            aria-label={intl.formatMessage({
              id: 'analysis.pagination.prev',
              defaultMessage: 'Comando anterior'
            })}
            className="size-6 p-0 text-muted-foreground hover:text-foreground rounded-xs"
          >
            <ArrowLeft className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="btn-next-command"
            disabled={currentIndex >= totalCommands - 1 || currentIndex === -1}
            onClick={() => {
              const next = effectiveTab.commands[currentIndex + 1];
              if (next) handleNavigateCommand(next.id);
            }}
            aria-label={intl.formatMessage({
              id: 'analysis.pagination.next',
              defaultMessage: 'Comando siguiente'
            })}
            className="size-6 p-0 text-muted-foreground hover:text-foreground rounded-xs"
          >
            <ArrowRight className="size-3" />
          </Button>
        </div>
      </div>

      {/* Accordion Container with 8 Collapsible Blocks */}
      <div
        data-testid="analysis-accordion"
        className="flex-1 overflow-y-auto divide-y divide-border/60"
      >
        {/* ================================================================= */}
        {/* Block 1: General Information                                      */}
        {/* ================================================================= */}
        <div data-testid="accordion-item-general-info" className="flex flex-col">
          <button
            type="button"
            id="accordion-trigger-general-info"
            data-testid="accordion-trigger-general-info"
            aria-expanded={openSections.has('general-info')}
            aria-controls="accordion-content-general-info"
            onClick={() => toggleSection('general-info')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors select-none text-left"
          >
            <span>
              <FormattedMessage
                id="analysis.generalInfo"
                defaultMessage="Información General"
              />
            </span>
            {openSections.has('general-info') ? (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
          </button>

          {openSections.has('general-info') && (
            <div
              id="accordion-content-general-info"
              data-testid="accordion-content-general-info"
              className="px-3 py-2.5 text-xs bg-card/20 space-y-3"
            >
              {/* Direction mismatch warning banner */}
              {hasDirectionMismatch && (
                <div
                  data-testid="direction-mismatch-warning"
                  className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium"
                >
                  <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                  <span>
                    La dirección detectada ({parseResult.detectedDirection}) no coincide con la
                    configurada ({activeCommand.direction}).
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Dispositivo / Fabricante
                  </span>
                  <span data-testid="general-info-device" className="font-semibold text-foreground">
                    {deviceSpec ? `${deviceSpec.name} (${deviceSpec.vendor})` : '-'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Versión de Firmware
                  </span>
                  <span
                    data-testid="general-info-version"
                    className="font-mono text-foreground font-semibold"
                  >
                    v{activeCommand.version}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Código de Comando
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsInfoModalOpen(true)}
                      title="Ver información completa del comando"
                      aria-label="Ver información completa del comando"
                      className="p-1 rounded bg-[#0284c7]/20 text-[#38bdf8] hover:bg-[#0284c7]/40 hover:text-[#feffff] transition-colors"
                      data-testid="command-info-button"
                    >
                      <Info className="size-3.5" />
                    </button>
                    <span
                      data-testid="general-info-command-code"
                      className="font-mono font-bold text-primary"
                    >
                      {parseResult?.commandCode ?? '-'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Dirección
                  </span>
                  <span
                    data-testid="general-info-direction"
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-muted text-foreground border border-border"
                  >
                    {activeCommand.direction === 'request' ? 'Petición' : 'Respuesta'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Interfaz
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      data-testid="general-info-interface"
                      className="font-semibold text-foreground text-xs"
                    >
                      {activeInterface ? (locale === 'en' ? activeInterface.name.en : activeInterface.name.es) : (parseResult?.detectedInterfaceId ?? '-')}
                    </span>
                    {activeInterface && (
                      <span
                        data-testid="general-info-interface-badge"
                        className={`px-1 py-0.2 rounded-xs text-[9px] font-bold uppercase tracking-wider ${
                          activeInterface.kind === 'standard'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {activeInterface.kind === 'standard' ? 'STD' : 'PROP'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Formato de Trama
                  </span>
                  <span
                    data-testid="general-info-wire-format"
                    className="font-mono text-xs font-semibold text-foreground"
                  >
                    {activeInterface?.wireFormat.toUpperCase() ?? deviceSpec?.framing.type.toUpperCase() ?? '-'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium mb-1">
                  Descripción
                </span>
                <p
                  data-testid="general-info-description"
                  className="text-xs text-foreground leading-relaxed"
                >
                  {resolveText(parseResult?.matchedCommand?.description) ||
                    resolveText(parseResult?.matchedCommand?.summary) ||
                    'Comando sin descripción específica.'}
                </p>
              </div>

              {/* Official Source Citation */}
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">
                  Fuente Documental
                </span>
                <p
                  data-testid="general-info-source"
                  className="text-[11px] text-muted-foreground font-mono leading-relaxed"
                >
                  {parseResult?.matchedCommand?.source ||
                    deviceSpec?.name ||
                    'Especificación estándar de hardware'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* Block 2: Frame View & Semantic Role Pills (Above Parameters)      */}
        {/* ================================================================= */}
        <div data-testid="accordion-item-frame-view" className="flex flex-col">
          <button
            type="button"
            id="accordion-trigger-frame-view"
            data-testid="accordion-trigger-frame-view"
            aria-expanded={openSections.has('frame-view')}
            aria-controls="accordion-content-frame-view"
            onClick={() => toggleSection('frame-view')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors select-none text-left"
          >
            <span>
              <FormattedMessage id="analysis.frameView" defaultMessage="Vista de Trama" />
            </span>
            {openSections.has('frame-view') ? (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
          </button>

          {openSections.has('frame-view') && (
            <div
              id="accordion-content-frame-view"
              data-testid="accordion-content-frame-view"
              className="p-3 text-xs bg-card/20 space-y-2"
            >
              <div
                data-testid="frame-view-container"
                className="flex flex-wrap gap-1 p-2 rounded-md bg-muted/20 border border-border"
              >
                {parseResult && parseResult.segments.length > 0 ? (
                  parseResult.segments.map((seg, sIdx) => {
                    const isHighlighted =
                      (props.highlightedSegmentId !== undefined &&
                        props.highlightedSegmentId !== null &&
                        props.highlightedSegmentId === seg.id) ||
                      (props.selectedSegmentId !== undefined &&
                        props.selectedSegmentId !== null &&
                        props.selectedSegmentId === seg.id);

                    const matchingField = seg.fieldId
                      ? parseResult.fields.find((f) => f.id === seg.fieldId)
                      : undefined;
                    const isSensitive = matchingField?.sensitive === true;
                    const isVisible =
                      !isSensitive ||
                      revealAll ||
                      (matchingField ? revealedFields.has(matchingField.id) : false);
                    const displaySegValue = isVisible ? seg.rawValue : '••••••••';

                    const roleClassMap: Record<string, string> = {
                      delimiter:
                        'bg-[#1a2236] text-[#94a3b8] border-[#2e3b5b] font-bold',
                      header:
                        'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold',
                      'command-code':
                        'bg-[#0284c7]/20 text-[#38bdf8] border-[#0284c7]/40 font-bold',
                      field:
                        'bg-[#018934]/20 text-[#0da845] border-[#018934]/40',
                      tag:
                        'bg-[#ff7800]/20 text-[#ff9233] border-[#ff7800]/40 font-semibold',
                      'tag-value':
                        'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    };

                    const badgeClass =
                      roleClassMap[seg.role] ??
                      'bg-muted text-muted-foreground border-border';

                    return (
                      <button
                        type="button"
                        key={`${seg.id}-${sIdx}`}
                        data-testid={`frame-segment-${seg.id}`}
                        data-role={seg.role}
                        data-highlighted={isHighlighted ? 'true' : 'false'}
                        aria-label={`Segmento ${seg.role}: ${displaySegValue}`}
                        onMouseEnter={() => props.onHoverSegment?.(seg)}
                        onMouseLeave={() => props.onHoverSegment?.(null)}
                        onClick={() => props.onSelectSegment?.(seg)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            props.onSelectSegment?.(seg);
                          }
                        }}
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono border cursor-pointer transition-all select-none ${badgeClass} ${
                          isHighlighted ? 'ring-2 ring-[#ff7800] ring-offset-1 ring-offset-[#202940] font-bold shadow-xs' : ''
                        }`}
                      >
                        {displaySegValue}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground italic text-xs">
                    Sin segmentos generados.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* Block 3: Parameter Breakdown & Sensitive Masking                  */}
        {/* ================================================================= */}
        <div data-testid="accordion-item-fields" className="flex flex-col">
          <button
            type="button"
            id="accordion-trigger-fields"
            data-testid="accordion-trigger-fields"
            aria-expanded={openSections.has('fields')}
            aria-controls="accordion-content-fields"
            onClick={() => toggleSection('fields')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors select-none text-left"
          >
            <span>
              <FormattedMessage
                id="analysis.fields"
                defaultMessage="Desglose de Parámetros"
              />
            </span>
            {openSections.has('fields') ? (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
          </button>

          {openSections.has('fields') && (
            <div
              id="accordion-content-fields"
              data-testid="accordion-content-fields"
              className="p-3 text-xs bg-card/20 space-y-3"
            >
              {parseResult && parseResult.fields.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {parseResult.fields.length} parámetro(s) decodificado(s)
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid="btn-toggle-all-sensitive"
                      onClick={toggleRevealAll}
                      className="h-6 px-2 text-[11px] gap-1 rounded-xs"
                    >
                      {revealAll ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                      <span>
                        <FormattedMessage
                          id={revealAll ? 'analysis.sensitive.hide' : 'analysis.sensitive.show'}
                          defaultMessage={
                            revealAll
                              ? 'Ocultar valores sensibles'
                              : 'Mostrar valores sensibles'
                          }
                        />
                      </span>
                    </Button>
                  </div>

                  <div className="w-full rounded border border-border/60 overflow-hidden">
                    <table
                      data-testid="fields-breakdown-table"
                      className="w-full table-fixed text-left text-xs border-collapse"
                    >
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-[11px] text-muted-foreground font-semibold">
                          <th className="py-1.5 px-2 w-[28%]">Nombre</th>
                          <th className="py-1.5 px-2 w-[12%]">
                            <FormattedMessage
                              id="analysis.fields.length"
                              defaultMessage="Longitud"
                            />
                          </th>
                          <th className="py-1.5 px-2 w-[14%]">Formato</th>
                          <th className="py-1.5 px-2 w-[40%] text-right">Valor</th>
                          <th className="py-1.5 px-2 w-[6%] text-center" aria-label="Información"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {parseResult.fields.map((field, fIdx) => {
                          const matchingSeg = parseResult.segments.find(
                            (s) => s.fieldId === field.id
                          );
                          const isHighlighted =
                            (props.highlightedSegmentId !== undefined &&
                              props.highlightedSegmentId !== null &&
                              matchingSeg?.id === props.highlightedSegmentId) ||
                            (props.selectedSegmentId !== undefined &&
                              props.selectedSegmentId !== null &&
                              matchingSeg?.id === props.selectedSegmentId);

                          const isSensitive = field.sensitive === true;
                          const isVisible =
                            !isSensitive || revealAll || revealedFields.has(field.id);
                          const displayValue = isVisible ? field.rawValue : '••••••••';

                          return (
                            <React.Fragment key={`${field.id}-${fIdx}`}>
                              <tr
                                data-testid={`field-row-${field.id}`}
                                data-highlighted={isHighlighted ? 'true' : 'false'}
                                tabIndex={0}
                                role="row"
                                aria-selected={isHighlighted}
                                onMouseEnter={() => matchingSeg && props.onHoverSegment?.(matchingSeg)}
                                onMouseLeave={() => props.onHoverSegment?.(null)}
                                onClick={() => matchingSeg && props.onSelectSegment?.(matchingSeg)}
                                onKeyDown={(e) => {
                                  if ((e.key === 'Enter' || e.key === ' ') && matchingSeg) {
                                    e.preventDefault();
                                    props.onSelectSegment?.(matchingSeg);
                                  }
                                }}
                                className={`align-top hover:bg-muted/40 cursor-pointer transition-colors focus:outline-hidden focus:ring-1 focus:ring-primary ${
                                  isHighlighted ? 'bg-primary/15 font-medium' : ''
                                }`}
                              >
                                <td className="py-1.5 px-2 font-medium align-top">
                                  <div className="flex items-center gap-1.5 flex-wrap break-words">
                                    <span>{resolveText(field.name) || field.id}</span>
                                    {field.detectedMode === 'akb' && (
                                      <span
                                        data-testid={`badge-akb-${field.id}`}
                                        className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FBD5CD]/20 text-[#f472b6] border border-[#f472b6]/40"
                                      >
                                        AKB
                                      </span>
                                    )}
                                    {field.detectedMode === 'variant' && (
                                      <span
                                        data-testid={`badge-variant-${field.id}`}
                                        className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#B5B1D2]/20 text-purple-300 border border-purple-500/40"
                                      >
                                        Variant
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-1.5 px-2 font-mono text-[11px] text-muted-foreground align-top">
                                  {field.rawValue.length}
                                </td>
                                <td className="py-1.5 px-2 font-mono text-[11px] text-muted-foreground align-top">
                                  {field.encoding ?? 'ascii'}
                                </td>
                                <td className="py-1.5 px-2 text-right align-top">
                                  <div className="flex items-start justify-end gap-1.5 w-full">
                                    <span
                                      data-testid={`field-value-${field.id}`}
                                      className="font-mono text-xs break-all leading-relaxed text-right select-all"
                                    >
                                      {displayValue}
                                    </span>
                                    {isSensitive && (
                                      <button
                                        type="button"
                                        data-testid={`btn-toggle-sensitive-${field.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSensitiveField(field.id);
                                        }}
                                        className="p-1 text-muted-foreground hover:text-foreground rounded-xs shrink-0"
                                        aria-label={
                                          isVisible
                                            ? intl.formatMessage({
                                                id: 'analysis.fields.hideSensitive',
                                                defaultMessage: 'Ocultar valor sensible'
                                              })
                                            : intl.formatMessage({
                                                id: 'analysis.fields.revealSensitive',
                                                defaultMessage: 'Revelar valor sensible'
                                              })
                                        }
                                      >
                                        {isVisible ? (
                                          <EyeOff className="size-3" />
                                        ) : (
                                          <Eye className="size-3" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="py-1.5 px-2 text-center align-top" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    data-testid={`btn-field-info-${field.id}`}
                                    onClick={() => toggleFieldDetails(field.id)}
                                    className={`p-1 rounded-xs transition-colors ${
                                      expandedFieldDetails.has(field.id)
                                        ? 'text-[#38bdf8] bg-muted/60'
                                        : 'text-muted-foreground hover:text-[#38bdf8] hover:bg-muted/40'
                                    }`}
                                    aria-label={`Información de ${resolveText(field.name)}`}
                                    title={`Ver descripción completa de ${resolveText(field.name)}`}
                                  >
                                    <Info className="size-3.5" />
                                  </button>
                                </td>
                              </tr>

                              {expandedFieldDetails.has(field.id) && (
                                <tr
                                  data-testid={`field-details-row-${field.id}`}
                                  className="bg-muted/15 border-b border-border/60"
                                >
                                  <td colSpan={5} className="p-3">
                                    <div className="space-y-2.5 text-xs">
                                      {field.variants && field.variants.length > 0 ? (
                                        <div className="space-y-2">
                                          {field.variants
                                            .filter((v) => {
                                              if (field.detectedMode && field.detectedMode !== 'both') {
                                                return v.mode === field.detectedMode;
                                              }
                                              return true;
                                            })
                                            .map((v, vIdx) => {
                                            if (v.mode === 'akb') {
                                              return (
                                                <div
                                                  key={vIdx}
                                                  data-testid={`field-variant-akb-${field.id}`}
                                                  className="p-3 rounded-md bg-[#FBD5CD]/10 border-l-4 border-l-[#f472b6] border border-[#f472b6]/30 text-xs text-[#feffff]"
                                                >
                                                  <div className="flex items-center justify-between mb-1.5">
                                                    <strong className="text-[#f472b6] font-bold text-[11px] tracking-wider uppercase flex items-center gap-1.5">
                                                      <span>🟧 AKB (Atalla Key Block)</span>
                                                    </strong>
                                                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#FBD5CD]/20 text-[#f472b6] border border-[#f472b6]/40">
                                                      Longitud: {v.lengthText}
                                                    </span>
                                                  </div>
                                                  <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                                                    {resolveText(v.description)}
                                                  </p>
                                                </div>
                                              );
                                            }
                                            if (v.mode === 'variant') {
                                              return (
                                                <div
                                                  key={vIdx}
                                                  data-testid={`field-variant-variant-${field.id}`}
                                                  className="p-3 rounded-md bg-[#B5B1D2]/10 border-l-4 border-l-purple-500 border border-purple-500/30 text-xs text-[#feffff]"
                                                >
                                                  <div className="flex items-center justify-between mb-1.5">
                                                    <strong className="text-purple-300 font-bold text-[11px] tracking-wider uppercase flex items-center gap-1.5">
                                                      <span>🟪 Variant (Variante MFK)</span>
                                                    </strong>
                                                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#B5B1D2]/20 text-purple-300 border border-purple-500/40">
                                                      Longitud: {v.lengthText}
                                                    </span>
                                                  </div>
                                                  <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                                                    {resolveText(v.description)}
                                                  </p>
                                                </div>
                                              );
                                            }
                                            return (
                                              <div
                                                key={vIdx}
                                                data-testid={`field-variant-both-${field.id}`}
                                                className="p-3 rounded-md bg-muted/20 border border-border text-xs text-[#feffff]"
                                              >
                                                <div className="flex items-center justify-between mb-1.5">
                                                  <strong className="text-[#38bdf8] font-bold text-[11px] tracking-wider uppercase">
                                                    AKB & Variant (Ambos)
                                                  </strong>
                                                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                                    Longitud: {v.lengthText}
                                                  </span>
                                                </div>
                                                <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                                                  {resolveText(v.description)}
                                                </p>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className="p-3 rounded-md bg-muted/20 border border-border text-xs text-[#feffff]">
                                          <strong className="text-[#38bdf8] block text-[11px] font-semibold mb-1">
                                            Descripción Oficial
                                          </strong>
                                          <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                                            {resolveText(field.description)}
                                          </p>
                                        </div>
                                      )}

                                      {field.notes && (
                                        <div className="p-2.5 rounded bg-[#0284c7]/10 border border-[#0284c7]/30 text-xs text-[#38bdf8]">
                                          <strong className="font-semibold block mb-0.5 text-[11px]">Notas de Parámetro:</strong>
                                          <p className="text-muted-foreground text-xs leading-relaxed">
                                            {resolveText(field.notes)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground italic text-xs">
                  <FormattedMessage
                    id="analysis.fields.empty"
                    defaultMessage="No se han extraído campos para esta trama."
                  />
                </p>
              )}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* Block 4: Unified Response Status & Diagnostics                    */}
        {/* ================================================================= */}
        <div data-testid="accordion-item-unified-diagnostics" className="flex flex-col">
          <button
            type="button"
            id="accordion-trigger-unified-diagnostics"
            data-testid="accordion-trigger-unified-diagnostics"
            aria-expanded={openSections.has('unified-diagnostics')}
            aria-controls="accordion-content-unified-diagnostics"
            onClick={() => toggleSection('unified-diagnostics')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors select-none text-left"
          >
            <span>
              Estado de Respuesta y Diagnósticos
            </span>
            {openSections.has('unified-diagnostics') ? (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
          </button>

          {openSections.has('unified-diagnostics') && (
            <div
              id="accordion-content-unified-diagnostics"
              data-testid="accordion-content-unified-diagnostics"
              className="p-3 text-xs bg-card/20 space-y-3"
            >
              {/* Part 1: Response Status (Only shown if direction is response) */}
              {isResponse && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Resultado de la Operación
                  </span>
                  {parseResult?.isErrorResponse ||
                  (parseResult?.errorCode && parseResult.errorCode !== '00') ? (
                    <div
                      data-testid="error-code-container"
                      className="space-y-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          data-testid="error-code-badge"
                          className="font-mono font-bold px-2 py-0.5 rounded bg-destructive text-destructive-foreground text-xs"
                        >
                          {parseResult.errorCode}
                        </span>
                        <h4
                          data-testid="error-code-title"
                          className="font-semibold text-xs text-foreground"
                        >
                          {resolveText(parseResult.errorSpec?.title) || 'Error de Hardware'}
                        </h4>
                      </div>
                      <p
                        data-testid="error-code-description"
                        className="text-xs text-muted-foreground leading-relaxed"
                      >
                        {resolveText(parseResult.errorSpec?.description)}
                      </p>
                      {parseResult.errorSpec?.troubleshooting && (
                        <div className="pt-1 border-t border-border/40">
                          <span className="text-[11px] font-semibold text-foreground">
                            Solución / Causa sugerida:{' '}
                          </span>
                          <p
                            data-testid="error-code-troubleshooting"
                            className="text-xs text-muted-foreground leading-relaxed mt-0.5"
                          >
                            {resolveText(parseResult.errorSpec.troubleshooting)}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      data-testid="response-success-container"
                      className="flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle2 className="size-4 shrink-0" />
                      <div>
                        <span className="font-mono font-bold text-xs mr-2">00</span>
                        <span className="text-xs font-semibold">Operación Exitosa</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Part 2: Frame Diagnostics (Validation Checks) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Diagnósticos de Trama
                </span>
                {parseResult && parseResult.diagnostics.length > 0 ? (
                  <div data-testid="diagnostics-list" className="space-y-1.5">
                    {parseResult.diagnostics.map((diag, idx) => (
                      <div
                        key={`${diag.code}-${idx}`}
                        data-testid={`diagnostic-item-${diag.code}`}
                        className="flex items-start gap-2 p-2 rounded-md bg-muted/40 border border-border text-xs"
                      >
                        <span
                          data-testid={`diagnostic-severity-${diag.code}`}
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                            diag.severity === 'error'
                              ? 'bg-destructive/15 text-destructive'
                              : diag.severity === 'warning'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {diag.severity}
                        </span>
                        <span className="text-foreground leading-relaxed">
                          {resolveText(diag.message) || diag.code}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    data-testid="diagnostics-empty"
                    className="flex items-center gap-2 p-2.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs"
                  >
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Trama válida sin anomalías</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* Block 5: Manufacturer Notes with Official Colors                  */}
        {/* ================================================================= */}
        <div data-testid="accordion-item-notes" className="flex flex-col">
          <button
            type="button"
            id="accordion-trigger-notes"
            data-testid="accordion-trigger-notes"
            aria-expanded={openSections.has('notes')}
            aria-controls="accordion-content-notes"
            onClick={() => toggleSection('notes')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors select-none text-left"
          >
            <span>
              <FormattedMessage
                id="analysis.notes"
                defaultMessage="Notas del Fabricante"
              />
            </span>
            {openSections.has('notes') ? (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
          </button>

          {openSections.has('notes') && (
            <div
              id="accordion-content-notes"
              data-testid="accordion-content-notes"
              className="p-3 text-xs bg-card/20 space-y-2.5"
            >
              {notesList.length === 0 ? (
                <p className="text-muted-foreground italic text-xs">
                  <FormattedMessage
                    id="analysis.notes.empty"
                    defaultMessage="Sin notas específicas del fabricante para este comando"
                  />
                </p>
              ) : (
                <div
                  data-testid="manufacturer-notes-container"
                  className="space-y-2.5 text-xs leading-relaxed"
                >
                  {notesList.map((noteBlock, nIdx) => {
                    const isCaution = /\[CAUTION\]|^CAUTION:/i.test(noteBlock);
                    const isImportant = /\[IMPORTANT\]|^IMPORTANT:/i.test(noteBlock);
                    const isTip = /\[TIP\]|^TIP:/i.test(noteBlock);
                    const isNote = /\[NOTE\]|^NOTE:/i.test(noteBlock);

                    const cleanText = noteBlock
                      .replace(/^\[(CAUTION|IMPORTANT|TIP|NOTE)\]\s*/i, '')
                      .replace(/^(CAUTION|IMPORTANT|TIP|NOTE):\s*/i, '')
                      .trim();

                    if (isCaution) {
                      return (
                        <div
                          key={nIdx}
                          data-testid={`manufacturer-note-caution-${nIdx}`}
                          className="p-3 rounded-md bg-[#ff7800]/10 border-l-4 border-l-[#ff7800] border border-[#ff7800]/30 text-xs text-[#feffff]"
                        >
                          <strong className="text-[#ff7800] block mb-1 uppercase font-bold text-[11px] tracking-wider">
                            CAUTION
                          </strong>
                          <span>{cleanText}</span>
                        </div>
                      );
                    }
                    if (isImportant) {
                      return (
                        <div
                          key={nIdx}
                          data-testid={`manufacturer-note-important-${nIdx}`}
                          className="p-3 rounded-md bg-[#ef4444]/10 border-l-4 border-l-[#ef4444] border border-[#ef4444]/30 text-xs text-[#feffff]"
                        >
                          <strong className="text-[#ef4444] block mb-1 uppercase font-bold text-[11px] tracking-wider">
                            IMPORTANT
                          </strong>
                          <span>{cleanText}</span>
                        </div>
                      );
                    }
                    if (isTip) {
                      return (
                        <div
                          key={nIdx}
                          data-testid={`manufacturer-note-tip-${nIdx}`}
                          className="p-3 rounded-md bg-[#018934]/10 border-l-4 border-l-[#018934] border border-[#018934]/30 text-xs text-[#feffff]"
                        >
                          <strong className="text-[#0da845] block mb-1 uppercase font-bold text-[11px] tracking-wider">
                            TIP
                          </strong>
                          <span>{cleanText}</span>
                        </div>
                      );
                    }
                    if (isNote) {
                      return (
                        <div
                          key={nIdx}
                          data-testid={`manufacturer-note-note-${nIdx}`}
                          className="p-3 rounded-md bg-[#0284c7]/10 border-l-4 border-l-[#0284c7] border border-[#0284c7]/30 text-xs text-[#feffff]"
                        >
                          <strong className="text-[#38bdf8] block mb-1 uppercase font-bold text-[11px] tracking-wider">
                            NOTE
                          </strong>
                          <span>{cleanText}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={nIdx}
                        data-testid={`manufacturer-note-general-${nIdx}`}
                        className="p-3 bg-muted/20 border border-border rounded-md text-xs leading-relaxed whitespace-pre-line text-muted-foreground"
                      >
                        {cleanText}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Command Complete Info Modal */}
      <CommandInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        commandSpec={parseResult?.matchedCommand}
        deviceSpec={deviceSpec}
        locale={locale}
      />
    </div>
  );
}