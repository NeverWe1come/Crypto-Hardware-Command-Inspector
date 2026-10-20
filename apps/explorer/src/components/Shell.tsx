/**
 * @packageDocumentation
 * Main application shell layout featuring a 3-column resizable workspace (`@chci/explorer`).
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { getDeviceSpec } from '@chci/device-specs';
import { useWorkspace } from '../state/workspace-context';
import { Header } from './Header';
import { CatalogSidebar } from './CatalogSidebar';
import { WorkspaceTabs } from './WorkspaceTabs';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from './ui/resizable';
import { Cpu, Terminal, Sparkles, Layers } from 'lucide-react';

export function Shell() {
  const { state } = useWorkspace();

  const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
  const activeDeviceSpec = activeTab ? getDeviceSpec(activeTab.deviceId) : undefined;

  return (
    <div
      data-testid="app-shell"
      className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground"
    >
      {/* Top Application Header */}
      <Header />

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

                  {/* Active tab commands container (placeholder for Phase 4 editor) */}
                  <div
                    className="flex-1 rounded-md border border-dashed border-border p-6 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/5"
                    data-testid="command-editor-placeholder"
                  >
                    <Terminal className="size-8 mb-2 text-muted-foreground/60" />
                    <p className="text-xs font-medium text-foreground">
                      {activeTab.commands.length} comando(s) en la sesión activa
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
                      El editor interactivo CodeMirror 6 y la lista de comandos se integrarán aquí.
                    </p>
                  </div>
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
            aria-label="Panel de análisis"
            data-testid="analysis-panel"
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

            <div
              className="flex-1 p-4 overflow-y-auto flex flex-col items-center justify-center text-center text-muted-foreground"
              data-testid="analysis-panel-placeholder"
            >
              <p className="text-xs">
                <FormattedMessage
                  id="analysis.empty"
                  defaultMessage="No hay comandos en la pestaña activa"
                />
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1 max-w-[200px]">
                Los diagnósticos, desglose de campos y respuestas esperadas se detallarán aquí.
              </p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
