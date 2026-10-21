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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from './ui/resizable';
import { Cpu, Sparkles, Layers, Plus } from 'lucide-react';

/**
 * Root workspace layout component composing the navigation header, web warning banner,
 * hardware catalog sidebar, central multi-command CodeMirror editor, and 8-block
 * cryptographic analysis panel in a 3-column resizable layout.
 *
 * @returns Application shell JSX element.
 */
export function Shell() {
  const { state, dispatch } = useWorkspace();

  const sidebarPanelRef = useRef<React.ComponentRef<typeof ResizablePanel>>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [hoveredSegment, setHoveredSegment] = useState<FrameSegment | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<FrameSegment | null>(null);

  const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
  const activeDeviceSpec = activeTab ? getDeviceSpec(activeTab.deviceId) : undefined;

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
  }, [activeCommand?.id]);

  const parseResult = useMemo(() => {
    if (!activeCommand || !activeDeviceSpec || !activeTab) return null;
    return parseCommand(activeCommand.raw, activeDeviceSpec, {
      version: activeCommand.version,
      expectedDirection: activeCommand.direction,
      headerLength: activeTab.headerLength
    });
  }, [activeCommand, activeDeviceSpec, activeTab]);

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

                    {/* Prominent New Command Action Button */}
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
                              ? 'Trama de Solicitud (Request)'
                              : 'Trama de Respuesta (Response)'}
                          </span>
                          {parseResult?.commandCode && (
                            <span className="font-mono bg-[#0284c7]/20 text-[#38bdf8] px-1.5 py-0.5 rounded text-[11px] font-semibold border border-[#0284c7]/40">
                              Cmd: {parseResult.commandCode}
                            </span>
                          )}
                        </div>
                      </div>

                      <CodeEditor
                        key={activeCommand.id}
                        raw={activeCommand.raw}
                        segments={parseResult?.segments ?? []}
                        controlChars={parseResult?.normalized.controlChars}
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
                        highlightedSegmentId={hoveredSegment?.id ?? selectedSegment?.id ?? null}
                      />
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
    </div>
  );
}