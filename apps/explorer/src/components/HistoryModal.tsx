/**
 * @packageDocumentation
 * History Modal component providing real-time full-text search, preview, insertion into active command,
 * addition as new command, export to `.chci_history`, and clear operations (`@chci/explorer`).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useWorkspace } from '../state/workspace-context';
import type { HistoryEntry } from '../storage/types';
import { clearHistory, getHistory } from '../storage/indexeddb';
import { formatHistoryFile } from '../storage/history-format';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  History,
  Download,
  Trash2,
  Search,
  ArrowRightCircle,
  PlusCircle,
  Terminal
} from 'lucide-react';

/**
 * Props accepted by the {@link HistoryModal} component.
 */
export interface HistoryModalProps {
  /** Whether the history modal dialog is currently visible. */
  readonly open: boolean;
  /** Callback fired when the open state changes. */
  readonly onOpenChange: (open: boolean) => void;
}

/**
 * Command history modal rendering entries recorded in `.chci_history` format,
 * supporting real-time full-text search, direct injection into active command or new commands,
 * plain-text `.chci_history` export/download, and log clearing.
 *
 * @param props - Component open state and visibility toggle handler.
 * @returns Dialog modal JSX element.
 */
export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const intl = useIntl();
  const { state: workspaceState, dispatch } = useWorkspace();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistoryEntries = async () => {
    try {
      setIsLoading(true);
      const list = await getHistory(200);
      setEntries(list);
    } catch (err) {
      console.warn('[CHCI History] Failed to fetch history entries:', err);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      void fetchHistoryEntries();
    }
  }, [open]);

  // Filtered history list based on search query
  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return entries;
    }
    return entries.filter((entry) => {
      const matchDevice = entry.deviceId.toLowerCase().includes(query);
      const matchVersion = entry.version.toLowerCase().includes(query);
      const matchDirection = entry.direction.toLowerCase().includes(query);
      const matchRaw = entry.raw.toLowerCase().includes(query);
      return matchDevice || matchVersion || matchDirection || matchRaw;
    });
  }, [entries, searchQuery]);

  // Active tab & active command resolution for inserting
  const activeTab = useMemo(
    () => workspaceState.tabs.find((t) => t.id === workspaceState.activeTabId),
    [workspaceState.tabs, workspaceState.activeTabId]
  );
  const hasActiveTab = Boolean(activeTab);

  const handleInsertActive = (entry: HistoryEntry) => {
    dispatch({
      type: 'LOAD_FROM_HISTORY',
      payload: {
        entry,
        mode: 'replace-active'
      }
    });
    onOpenChange(false);
  };

  const handleAddNewCommand = (entry: HistoryEntry) => {
    dispatch({
      type: 'LOAD_FROM_HISTORY',
      payload: {
        entry,
        mode: 'add-new'
      }
    });
    onOpenChange(false);
  };

  const handleExportHistory = () => {
    if (entries.length === 0) return;
    const fileContent = formatHistoryFile(entries);
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.chci_history';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setEntries([]);
    } catch (err) {
      console.warn('[CHCI History] Failed to clear history:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="history-modal"
        className="max-w-3xl max-h-[85vh] flex flex-col p-6 gap-4"
        showCloseButton
      >
        <DialogHeader className="mb-0">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <History className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                <FormattedMessage
                  id="history.modal.title"
                  defaultMessage="Historial de Comandos (.chci_history)"
                />
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                <FormattedMessage
                  id="history.modal.description"
                  defaultMessage="Registro cronológico de todos los comandos inspeccionados en la aplicación."
                />
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 overflow-y-auto pr-1">
          {/* Search bar & Action Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                data-testid="history-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={intl.formatMessage({
                  id: 'history.search.placeholder',
                  defaultMessage: 'Buscar en historial'
                })}
                placeholder={intl.formatMessage({
                  id: 'history.search.placeholder',
                  defaultMessage: 'Buscar en historial (dispositivo, versión, comando)...'
                })}
                className="pl-8 text-xs h-8.5"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportHistory}
                disabled={entries.length === 0}
                data-testid="history-export-button"
                className="h-8.5 text-xs gap-1.5"
              >
                <Download className="size-3.5" />
                <FormattedMessage id="history.action.export" defaultMessage="Descargar .chci_history" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                disabled={entries.length === 0}
                data-testid="history-clear-button"
                className="h-8.5 text-xs gap-1.5 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                <FormattedMessage id="history.action.clear" defaultMessage="Limpiar historial" />
              </Button>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-2" data-testid="history-list">
            {!isLoading && entries.length === 0 && (
              <div
                data-testid="history-empty-state"
                className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground"
              >
                <Terminal className="size-8 mx-auto mb-2 opacity-40" />
                <h3 className="text-sm font-medium text-foreground">
                  <FormattedMessage id="history.empty.title" defaultMessage="Historial vacío" />
                </h3>
                <p className="text-xs mt-1">
                  <FormattedMessage
                    id="history.empty.description"
                    defaultMessage="Los comandos inspeccionados se registrarán automáticamente aquí."
                  />
                </p>
              </div>
            )}

            {!isLoading && entries.length > 0 && filteredEntries.length === 0 && (
              <div
                data-testid="history-no-match-state"
                className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground"
              >
                <p className="text-xs">
                  <FormattedMessage
                    id="history.empty.noMatch"
                    defaultMessage="No se encontraron comandos que coincidan con la búsqueda."
                  />
                </p>
              </div>
            )}

            {filteredEntries.map((entry, idx) => (
              <div
                key={entry.id ?? `${entry.timestamp}-${entry.deviceId}-${entry.raw}`}
                data-testid={`history-item-${idx}`}
                className="p-3 border border-border rounded-lg bg-card/60 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                      {entry.deviceId}
                    </Badge>
                    <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                      v{entry.version}
                    </Badge>
                    <Badge
                      variant={entry.direction === 'request' ? 'primary' : 'info'}
                      size="sm"
                      className="font-mono text-[10px] uppercase"
                    >
                      {entry.direction}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="font-mono text-xs bg-muted/60 p-2 rounded border border-border/50 text-foreground break-all select-all">
                    {entry.raw || <span className="text-muted-foreground italic">(vacío)</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertActive(entry)}
                    disabled={!hasActiveTab}
                    data-testid={`history-insert-active-${idx}`}
                    aria-label={intl.formatMessage({
                      id: 'history.action.loadIntoActive',
                      defaultMessage: 'Cargar en comando actual'
                    })}
                    title={intl.formatMessage({
                      id: 'history.action.loadIntoActive',
                      defaultMessage: 'Cargar en comando actual'
                    })}
                    className="h-7 text-xs px-2 gap-1"
                  >
                    <ArrowRightCircle className="size-3.5" />
                    <span className="hidden md:inline">
                      <FormattedMessage
                        id="history.action.loadIntoActive"
                        defaultMessage="Cargar en actual"
                      />
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddNewCommand(entry)}
                    disabled={!hasActiveTab}
                    data-testid={`history-add-new-${idx}`}
                    aria-label={intl.formatMessage({
                      id: 'history.action.addToWorkspace',
                      defaultMessage: 'Añadir como nuevo comando'
                    })}
                    title={intl.formatMessage({
                      id: 'history.action.addToWorkspace',
                      defaultMessage: 'Añadir como nuevo comando'
                    })}
                    className="h-7 text-xs px-2 gap-1"
                  >
                    <PlusCircle className="size-3.5" />
                    <span className="hidden md:inline">
                      <FormattedMessage
                        id="history.action.addToWorkspace"
                        defaultMessage="Nuevo comando"
                      />
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
