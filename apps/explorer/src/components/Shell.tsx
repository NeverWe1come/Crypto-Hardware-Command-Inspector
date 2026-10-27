/**
 * @packageDocumentation
 * Main application shell layout featuring a 3-column resizable workspace (`@chci/explorer`).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getDeviceSpec } from '@chci/device-specs';
import { parseCommand, type FrameSegment } from '@chci/parser-core';
import { useWorkspace } from '../state/workspace-context';
import { appendHistory } from '../storage/indexeddb';
import { Header } from './Header';
import { WebSandboxBanner } from './WebSandboxBanner';
import { CatalogSidebar } from './CatalogSidebar';
import { WorkspaceTabs } from './WorkspaceTabs';
import { CommandList } from './CommandList';
import { CodeEditor } from './CodeEditor';
import { AnalysisPanel } from './AnalysisPanel';
import { Button } from './ui/button';
import { HardwareDocsModal } from './HardwareDocsModal';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from './ui/resizable';
import { Cpu, Sparkles, Layers, Plus, BookOpen, Play, Loader2 } from 'lucide-react';
import { useIntl } from 'react-intl';
import { sendHardwareCommand } from '../services/hardware-client';
import { ExecutionErrorModal } from './ExecutionErrorModal';

/**
 * Root workspace layout component composing the navigation header, web warning banner,
 * hardware catalog sidebar, central multi-command CodeMirror editor, and 8-block
 * cryptographic analysis panel in a 3-column resizable layout.
 *
 * @returns Application shell JSX element.
 */
export function Shell() {
  const intl = useIntl();
  const locale = (intl.locale === 'en' ? 'en' : intl.locale === 'gl' ? 'gl' : 'es') as 'es' | 'en' | 'gl';
  const { state, dispatch } = useWorkspace();

  const sidebarPanelRef = useRef<React.ComponentRef<typeof ResizablePanel>>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isLiveExecuting, setIsLiveExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [analyzingResponse, setAnalyzingResponse] = useState(false);

  const [hoveredSegment, setHoveredSegment] = useState<FrameSegment | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<FrameSegment | null>(null);

  const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
  const activeDeviceSpec = activeTab ? getDeviceSpec(activeTab.deviceId) : undefined;

  const activeConnections = useMemo(
    () => (activeTab ? state.hardwareConnections.filter((c) => c.deviceId === activeTab.deviceId) : []),
    [activeTab, state.hardwareConnections]
  );

  const activeCommand = useMemo(() => {
    if (!activeTab || activeTab.commands.length === 0) return null;
    return (
      activeTab.commands.find((c) => c.id === activeTab.activeCommandId) ??
      activeTab.commands[0] ??
      null
    );
  }, [activeTab]);

  React.useEffect(() => {
    setHoveredSegment(null);
    setSelectedSegment(null);
    setAnalyzingResponse(false);
  }, [activeCommand?.id]);

  const activeRawToParse =
    activeCommand && activeCommand.liveResponseRaw && analyzingResponse
      ? activeCommand.liveResponseRaw
      : (activeCommand?.raw ?? '');

  const activeDirectionToParse =
    activeCommand && activeCommand.liveResponseRaw && analyzingResponse
      ? 'response'
      : (activeCommand?.direction ?? 'request');

  const parseResult = useMemo(() => {
    if (!activeCommand || !activeDeviceSpec || !activeTab) return null;
    return parseCommand(activeRawToParse, activeDeviceSpec, {
      version: activeCommand.version,
      expectedDirection: activeDirectionToParse,
      headerLength: activeCommand.headerLength ?? activeTab.headerLength ?? 4,
      interfaceId: activeCommand.interfaceId ?? activeTab.interfaceId
    });
  }, [activeCommand, activeDeviceSpec, activeTab, activeRawToParse, activeDirectionToParse]);

  const handleExecuteLiveCommand = async () => {
    if (!activeCommand || !activeTab) return;
    const connId = activeCommand.selectedConnectionId ?? activeConnections[0]?.id;
    const conn = activeConnections.find((c) => c.id === connId) ?? activeConnections[0];
    if (!conn) {
      setExecutionError(
        'No hay ninguna conexión configurada para este dispositivo. Pulsa en el icono de engranaje (ruletita) en el panel izquierdo para añadir una IP y puerto.'
      );
      return;
    }

    if (!activeCommand.raw.trim()) {
      setExecutionError('El comando de solicitud a enviar está vacío.');
      return;
    }

    setIsLiveExecuting(true);
    setExecutionError(null);

    try {
      const res = await sendHardwareCommand(conn, activeCommand.raw, activeDeviceSpec?.framing.type);
      if (res.success && res.response !== undefined) {
        dispatch({
          type: 'SET_COMMAND_LIVE_RESPONSE',
          payload: {
            commandId: activeCommand.id,
            responseRaw: res.response,
            tabId: activeTab.id
          }
        });
        setAnalyzingResponse(true);
      } else {
        setExecutionError(res.error || 'Error desconocido al comunicar con el dispositivo.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
      setExecutionError(message);
    } finally {
      setIsLiveExecuting(false);
    }
  };

  // Automatically log non-empty commands to history on debounce
  const lastLoggedRef = useRef<string>('');
  useEffect(() => {
    if (!activeCommand || !activeCommand.raw.trim() || !activeTab) return;
    const currentRaw = activeCommand.raw.trim();
    const compositeKey = `${activeTab.deviceId}:${activeCommand.id}:${currentRaw}`;
    if (compositeKey === lastLoggedRef.current) return;

    const timer = setTimeout(() => {
      lastLoggedRef.current = compositeKey;
      void appendHistory({
        timestamp: new Date().toISOString(),
        deviceId: activeTab.deviceId,
        version: activeCommand.version,
        direction: activeCommand.direction,
        raw: currentRaw
      }).catch(() => {
        // Ignore background history write errors
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeCommand?.raw, activeCommand?.version, activeCommand?.direction, activeTab?.deviceId, activeCommand, activeTab]);

  return (
    <div
      data-testid="app-shell"
      className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground"
    >
      {/* Top Application Header */}
      <Header />

      {/* Web Sandbox Security Warning Banner (Active only when VITE_TARGET === 'web') */}
      <WebSandboxBanner />

      {/* 3-Panel Resizable Workspace Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full"
          data-testid="workspace-resizable-group"
        >
          {/* Panel 1: Hardware & KMS Catalog Sidebar */}
          <ResizablePanel
            id="sidebar-panel"
            ref={sidebarPanelRef}
            defaultSize={20}
            minSize={12}
            maxSize={40}
            collapsible={true}
            collapsedSize={4}
            onCollapse={() => setIsSidebarCollapsed(true)}
            onExpand={() => setIsSidebarCollapsed(false)}
            aria-label="Panel de catálogo"
            data-testid="sidebar-panel"
          >
            <CatalogSidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => {
                const panel = sidebarPanelRef.current;
                if (panel) {
                  try {
                    if (panel.isCollapsed()) {
                      panel.expand();
                      setIsSidebarCollapsed(false);
                    } else {
                      panel.collapse();
                      setIsSidebarCollapsed(true);
                    }
                    return;
                  } catch {
                    // Fallback in environments without layout geometry (e.g. jsdom)
                  }
                }
                setIsSidebarCollapsed((prev) => !prev);
              }}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Panel 2: Central Command List & CodeMirror Editor */}
          <ResizablePanel
            id="editor-panel"
            defaultSize={53}
            minSize={30}
            aria-label="Área de comandos y editor"
            data-testid="editor-panel"
            className="flex flex-col bg-background overflow-hidden"
          >
            <WorkspaceTabs />

            <div className="flex-1 overflow-y-auto flex flex-col">
              {activeTab && activeDeviceSpec ? (
                <div
                  className="flex-1 flex flex-col p-4 space-y-4"
                  data-testid="active-workspace-view"
                >
                  {/* Device Header Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-md bg-[#283350] text-[#feffff] flex items-center justify-center border border-[#ff7800]/30 shadow-xs">
                        <Cpu className="size-4 text-[#ff7800]" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold tracking-tight text-[#feffff]">
                          {activeDeviceSpec.name}
                        </h2>
                        <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
                          <span>Vendor: <strong className="text-[#feffff] font-medium">{activeDeviceSpec.vendor}</strong></span>
                          {activeTab.headerLength !== undefined && (
                            <>
                              <span>•</span>
                              <span className="font-mono">
                                Header: {activeTab.headerLength} bytes
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Hardware Docs & Prominent New Command */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        data-testid="header-hardware-docs-button"
                        onClick={() => setIsDocsModalOpen(true)}
                        size="sm"
                        className="h-8 text-xs gap-1.5 bg-[#1a2236] hover:bg-[#283350] border-[#2e3b5b] text-[#38bdf8] hover:text-[#feffff] font-medium shadow-xs"
                      >
                        <BookOpen className="size-3.5" />
                        <span>Documentación Hardware</span>
                      </Button>

                      <Button
                        type="button"
                        data-testid="header-add-command-button"
                        onClick={() => dispatch({ type: 'ADD_COMMAND' })}
                        size="sm"
                        className="h-8 text-xs gap-1.5 bg-[#ff7800] hover:bg-[#e66c00] text-[#131927] font-semibold shadow-xs"
                      >
                        <Plus className="size-3.5" />
                        <FormattedMessage id="editor.addCommand" defaultMessage="Nuevo comando" />
                      </Button>
                    </div>
                  </div>

                  {/* Section 1: Contained Command List Block (Flexible Top Area) */}
                  <div className="flex-1 overflow-y-auto" data-testid="command-list-block">
                    <CommandList tab={activeTab} />
                  </div>

                  {/* Section 2: CodeMirror 6 Editor for Active Command (Pinned to Bottom, Dynamic Height) */}
                  {activeCommand && (
                    <div className="flex-none flex flex-col space-y-1.5 pt-2.5 pb-2 px-3 border-t border-border bg-[#131927]" data-testid="code-editor-section">
                      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#feffff]">
                            {activeCommand.direction === 'request'
                              ? 'Comando de Solicitud (Request)'
                              : 'Comando de Respuesta (Response)'}
                          </span>
                          {parseResult?.commandCode && (
                            <span className="font-mono bg-[#0284c7]/20 text-[#38bdf8] px-1.5 py-0.5 rounded text-[11px] font-semibold border border-[#0284c7]/40">
                              Cmd: {parseResult.commandCode}
                            </span>
                          )}
                        </div>

                        {/* Live Execution Controls (When enabled on request commands) */}
                        {activeCommand.direction === 'request' && activeCommand.liveExecutionEnabled && (
                          <div className="flex items-center gap-2">
                            <select
                              data-testid="live-connection-select"
                              value={activeCommand.selectedConnectionId ?? activeConnections[0]?.id ?? ''}
                              onChange={(e) =>
                                dispatch({
                                  type: 'SET_COMMAND_SELECTED_CONNECTION',
                                  payload: {
                                    commandId: activeCommand.id,
                                    connectionId: e.target.value,
                                    tabId: activeTab.id
                                  }
                                })
                              }
                              className="h-7 px-2 text-[11px] font-mono bg-[#1a2236] border border-[#2e3b5b] rounded text-[#feffff]"
                              title="Seleccionar conexión hardware"
                            >
                              {activeConnections.length === 0 ? (
                                <option value="">Sin conexiones (pulsa ⚙️ en catálogo)</option>
                              ) : (
                                activeConnections.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.host}:{c.port} ({c.connectionType})
                                  </option>
                                ))
                              )}
                            </select>

                            <Button
                              type="button"
                              size="sm"
                              disabled={isLiveExecuting}
                              onClick={handleExecuteLiveCommand}
                              data-testid="live-execute-play-button"
                              className="h-7 text-xs px-2.5 gap-1.5 bg-[#018934] hover:bg-[#0da845] text-[#feffff] font-semibold"
                              title="Lanzar comando contra el hardware configurado"
                            >
                              {isLiveExecuting ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Play className="size-3 fill-current" />
                              )}
                              <span>Lanzar</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      <CodeEditor
                        key={activeCommand.id}
                        raw={activeCommand.raw}
                        segments={!analyzingResponse ? (parseResult?.segments ?? []) : []}
                        controlChars={!analyzingResponse ? parseResult?.normalized.controlChars : undefined}
                        onChange={(newRaw) =>
                          dispatch({
                            type: 'UPDATE_COMMAND_RAW',
                            payload: {
                              commandId: activeCommand.id,
                              raw: newRaw
                            }
                          })
                        }
                        onHoverSegment={setHoveredSegment}
                        onSelectSegment={setSelectedSegment}
                        highlightedSegmentId={!analyzingResponse ? (hoveredSegment?.id ?? selectedSegment?.id ?? null) : null}
                      />

                      {/* Second Editor: Received Hardware Response Area (Only when live execution enabled) */}
                      {activeCommand.direction === 'request' && activeCommand.liveExecutionEnabled && (
                        <div
                          className="flex-none flex flex-col space-y-1.5 pt-2 border-t border-[#2e3b5b]"
                          data-testid="live-response-section"
                        >
                          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#feffff]">
                                Comando de Respuesta Recibido (HSM)
                              </span>
                              {activeCommand.liveResponseRaw && (
                                <button
                                  type="button"
                                  onClick={() => setAnalyzingResponse((prev) => !prev)}
                                  data-testid="toggle-analyzing-response"
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase transition-colors ${
                                    analyzingResponse
                                      ? 'bg-[#018934]/20 text-[#0da845] border border-[#018934]/40'
                                      : 'bg-[#1a2236] text-muted-foreground hover:text-foreground border border-[#2e3b5b]'
                                  }`}
                                  title="Alternar análisis a la derecha entre solicitud y respuesta recibida"
                                >
                                  {analyzingResponse ? 'Analizando Respuesta' : 'Analizar Respuesta'}
                                </button>
                              )}
                            </div>
                            {isLiveExecuting && (
                              <span className="text-[11px] text-amber-400 flex items-center gap-1 animate-pulse">
                                <Loader2 className="size-3 animate-spin" />
                                Esperando respuesta...
                              </span>
                            )}
                          </div>

                          <CodeEditor
                            raw={activeCommand.liveResponseRaw ?? ''}
                            placeholder="Esperando respuesta del Hardware al pulsar Lanzar..."
                            readOnly={true}
                            segments={analyzingResponse ? (parseResult?.segments ?? []) : []}
                            controlChars={analyzingResponse ? parseResult?.normalized.controlChars : undefined}
                            className="min-h-[70px] max-h-[140px]"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state when no tabs are open */
                <div
                  className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                  data-testid="empty-workspace-state"
                >
                  <div className="size-12 rounded-full bg-muted/40 border border-border flex items-center justify-center mb-3 text-muted-foreground">
                    <Layers className="size-6" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    <FormattedMessage
                      id="tabs.empty.title"
                      defaultMessage="Ningún dispositivo seleccionado"
                    />
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                    <FormattedMessage
                      id="tabs.empty.description"
                      defaultMessage="Selecciona un hardware del catálogo en el panel izquierdo para comenzar a inspeccionar tramas de comandos."
                    />
                  </p>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Panel 3: Right-Side Deep Command Analysis */}
          <ResizablePanel
            id="analysis-panel"
            defaultSize={25}
            minSize={20}
            className="flex flex-col bg-card/40 border-l border-border overflow-hidden"
          >
            <div className="h-10 px-3 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground select-none shrink-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <FormattedMessage
                  id="workspace.panel.analysis"
                  defaultMessage="Panel de Análisis"
                />
              </div>
            </div>

            <AnalysisPanel
              tab={activeTab}
              deviceSpec={activeDeviceSpec}
              activeCommand={activeCommand}
              parseResult={parseResult}
              highlightedSegmentId={hoveredSegment?.id ?? null}
              selectedSegmentId={selectedSegment?.id ?? null}
              onHoverSegment={setHoveredSegment}
              onSelectSegment={setSelectedSegment}
              className="flex-1 min-h-0"
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Hardware Documentation Viewer Modal */}
      <HardwareDocsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        deviceSpec={activeDeviceSpec}
        locale={locale}
      />

      {/* Hardware Execution Failure Modal */}
      <ExecutionErrorModal
        open={!!executionError}
        onOpenChange={(open) => !open && setExecutionError(null)}
        errorMessage={executionError ?? ''}
      />
    </div>
  );
}