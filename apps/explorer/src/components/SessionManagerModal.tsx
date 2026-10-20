/**
 * @packageDocumentation
 * Session Manager Modal component allowing users to save, load, duplicate, delete,
 * export, and import complete workspace sessions using local IndexedDB storage (`@chci/explorer`).
 */

import React, { useEffect, useRef, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useWorkspace } from '../state/workspace-context';
import type { SavedSession, SavedSessionMeta } from '../storage/types';
import {
  deleteSession,
  duplicateSession,
  listSessions,
  loadSession,
  saveSession
} from '../storage/indexeddb';
import {
  exportSessionToJson,
  validateAndParseSessionJson
} from '../storage/session-schema';
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
import { Alert, AlertTitle } from './ui/alert';
import {
  FolderKanban,
  Download,
  Upload,
  Copy,
  Trash2,
  FolderOpen,
  Plus,
  AlertCircle
} from 'lucide-react';

export interface SessionManagerModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SessionManagerModal({ open, onOpenChange }: SessionManagerModalProps) {
  const intl = useIntl();
  const { state: workspaceState, dispatch } = useWorkspace();
  const [sessions, setSessions] = useState<SavedSessionMeta[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const list = await listSessions();
      setSessions(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      void fetchSessions();
    }
  }, [open]);

  const handleSaveCurrentSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = sessionName.trim();
    if (!trimmed) return;

    try {
      const now = new Date().toISOString();
      const newSession: SavedSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: trimmed,
        createdAt: now,
        updatedAt: now,
        state: workspaceState
      };

      await saveSession(newSession);
      setSessionName('');
      await fetchSessions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    }
  };

  const handleLoadSession = async (id: string) => {
    try {
      const loaded = await loadSession(id);
      if (!loaded) {
        setErrorMessage(
          intl.formatMessage({
            id: 'sessions.load.notFound',
            defaultMessage: 'No se encontró la sesión solicitada'
          })
        );
        return;
      }
      dispatch({ type: 'LOAD_WORKSPACE', payload: loaded.state });
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    }
  };

  const handleDuplicateSession = async (id: string) => {
    try {
      await duplicateSession(id);
      await fetchSessions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      await fetchSessions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    }
  };

  const handleExportSession = async (id: string) => {
    try {
      const loaded = await loadSession(id);
      if (!loaded) return;

      const jsonStr = exportSessionToJson(loaded);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = loaded.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'session';
      a.download = `${safeName}.chci-session-v1.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('El archivo excede el tamaño máximo permitido de 10 MB');
      return;
    }

    try {
      const text =
        typeof file.text === 'function'
          ? await file.text()
          : await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  resolve(reader.result);
                } else {
                  reject(new Error('Contenido de archivo no legible como texto'));
                }
              };
              reader.onerror = () => reject(reader.error);
              reader.readAsText(file);
            });

      const result = validateAndParseSessionJson(text);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      await saveSession(result.data.session);
      setErrorMessage(null);
      await fetchSessions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="session-manager-modal"
        className="max-w-2xl max-h-[85vh] flex flex-col p-6 gap-4"
        showCloseButton
      >
        <DialogHeader className="mb-0">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <FolderKanban className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                <FormattedMessage id="sessions.modal.title" defaultMessage="Biblioteca de Sesiones" />
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                <FormattedMessage
                  id="sessions.modal.description"
                  defaultMessage="Gestiona, guarda, exporta e importa sesiones de trabajo completas en almacenamiento local IndexedDB."
                />
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 overflow-y-auto pr-1">
          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="destructive" appearance="light" size="sm" data-testid="session-error-alert">
              <AlertCircle className="size-4 shrink-0 text-destructive" />
              <AlertTitle className="text-xs font-medium">{errorMessage}</AlertTitle>
            </Alert>
          )}

          {/* Save current session input group */}
          <form onSubmit={handleSaveCurrentSession} className="flex gap-2">
            <Input
              data-testid="session-name-input"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              aria-label={intl.formatMessage({
                id: 'sessions.save.placeholder',
                defaultMessage: 'Nombre de la sesión'
              })}
              placeholder={intl.formatMessage({
                id: 'sessions.save.placeholder',
                defaultMessage: 'Nombre de la sesión...'
              })}
              className="text-xs h-9"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!sessionName.trim()}
              data-testid="save-session-button"
              className="h-9 gap-1.5 shrink-0 text-xs"
            >
              <Plus className="size-3.5" />
              <FormattedMessage id="sessions.save.button" defaultMessage="Guardar sesión actual" />
            </Button>
          </form>

          {/* Import JSON button & hidden file input */}
          <div className="flex justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
              data-testid="import-session-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="import-session-button"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Upload className="size-3.5" />
              <FormattedMessage id="sessions.action.import" defaultMessage="Importar JSON" />
            </Button>
          </div>

          {/* Saved Sessions List */}
          <div className="space-y-2" data-testid="session-list">
            {!isLoading && sessions.length === 0 && (
              <div
                data-testid="session-empty-state"
                className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground"
              >
                <FolderKanban className="size-8 mx-auto mb-2 opacity-40" />
                <h3 className="text-sm font-medium text-foreground">
                  <FormattedMessage id="sessions.empty.title" defaultMessage="No hay sesiones guardadas" />
                </h3>
                <p className="text-xs mt-1">
                  <FormattedMessage
                    id="sessions.empty.description"
                    defaultMessage="Guarda el espacio de trabajo actual con un nombre para restaurarlo en cualquier momento."
                  />
                </p>
              </div>
            )}

            {sessions.map((item) => (
              <div
                key={item.id}
                data-testid={`session-item-${item.id}`}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/50 hover:bg-muted/40 transition-colors gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-foreground truncate">{item.name}</span>
                    <Badge variant="secondary" size="sm" className="font-mono text-[10px] shrink-0">
                      {intl.formatMessage(
                        { id: 'sessions.meta.tabs', defaultMessage: '{count} pestaña(s)' },
                        { count: item.tabCount }
                      )}
                    </Badge>
                    <Badge variant="secondary" size="sm" className="font-mono text-[10px] shrink-0">
                      {intl.formatMessage(
                        { id: 'sessions.meta.commands', defaultMessage: '{count} comando(s)' },
                        { count: item.commandCount }
                      )}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                    {new Date(item.updatedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLoadSession(item.id)}
                    data-testid={`load-session-${item.id}`}
                    aria-label={`Load session ${item.name}`}
                    className="h-7 text-xs px-2 gap-1"
                  >
                    <FolderOpen className="size-3.5" />
                    <FormattedMessage id="sessions.action.load" defaultMessage="Cargar" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateSession(item.id)}
                    data-testid={`duplicate-session-${item.id}`}
                    aria-label={`Duplicate session ${item.name}`}
                    className="h-7 text-xs px-2 gap-1"
                  >
                    <Copy className="size-3.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportSession(item.id)}
                    data-testid={`export-session-${item.id}`}
                    aria-label={`Export session ${item.name}`}
                    className="h-7 text-xs px-2 gap-1"
                  >
                    <Download className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSession(item.id)}
                    data-testid={`delete-session-${item.id}`}
                    aria-label={`Delete session ${item.name}`}
                    className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
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
