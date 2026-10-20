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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from './ui/resizable';
import { Cpu, Sparkles, Layers } from 'lucide-react';

export function Shell() {
  const { state, dispatch } = useWorkspace();

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
            defaultSize={22}
            minSize={15}
            maxSize={35}
            aria-label="Panel de catálogo"
            data-testid="sidebar-panel"
          >
            <CatalogSidebar />
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
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Cpu className="size-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold tracking-tight">
                          {activeDeviceSpec.name}
                        </h2>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{activeDeviceSpec.vendor}</span>
                          <span>•</span>
                          <span className="font-mono">Firmware v{activeTab.version}</span>
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
                  </div>

                  {/* Sortable Command List */}
                  <CommandList tab={activeTab} />

                  {/* CodeMirror 6 Editor for Active Command */}
                  {activeCommand && (
                    <div className="flex flex-col space-y-2 pt-2" data-testid="code-editor-section">
                      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {activeCommand.direction === 'request'
                              ? 'Trama de Solicitud (Request)'
                              : 'Trama de Respuesta (Response)'}
                          </span>
                          {parseResult?.commandCode && (
                            <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[11px] font-semibold border border-primary/20">
                              Cmd: {parseResult.commandCode}
                            </span>
                          )}
                        </div>
                        {parseResult && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                              parseResult.valid
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {parseResult.valid
                              ? 'Trama Válida'
                              : `${parseResult.diagnostics.length} Diagnóstico(s)`}
                          </span>
                        )}
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