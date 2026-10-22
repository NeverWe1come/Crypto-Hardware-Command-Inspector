/**
 * @packageDocumentation
 * Atalla Simulator Modal component providing one-click Docker lifecycle management,
 * live status monitoring, interactive self-test commands, and Docker log inspection (`@chci/explorer`).
 */

import React, { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useWorkspace } from '../state/workspace-context';
import {
  getAtallaSimulatorStatus,
  startAtallaSimulator,
  stopAtallaSimulator,
  getAtallaSimulatorLogs,
  type SimulatorStatus
} from '../services/simulator-client';
import { sendHardwareCommand } from '../services/hardware-client';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Server,
  Play,
  Square,
  RefreshCw,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';

export interface AtallaSimulatorModalProps {
  /** Whether the simulator modal dialog is currently visible. */
  readonly open: boolean;
  /** Callback fired when the open state changes. */
  readonly onOpenChange: (open: boolean) => void;
  /** Optional callback to inject a command string directly into the active editor. */
  readonly onLoadCommand?: (raw: string) => void;
}

export function AtallaSimulatorModal({
  open,
  onOpenChange,
  onLoadCommand
}: AtallaSimulatorModalProps) {
  const intl = useIntl();
  const { state: workspaceState, dispatch } = useWorkspace();

  const [status, setStatus] = useState<SimulatorStatus | null>(null);
  const [tarPath, setTarPath] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Self-test states
  const [testOutput, setTestOutput] = useState<{
    command: string;
    response?: string;
    error?: string;
    elapsedMs?: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Logs states
  const [logs, setLogs] = useState<string>('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  const fetchStatus = async () => {
    setIsRefreshing(true);
    setActionError(null);
    try {
      const s = await getAtallaSimulatorStatus();
      setStatus(s);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const l = await getAtallaSimulatorLogs(100);
      setLogs(l);
    } catch {
      setLogs('Error recuperando logs de Docker.');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Poll status when modal opens
  useEffect(() => {
    if (open) {
      void fetchStatus();
      void fetchLogs();
    }
  }, [open]);

  // Handle start
  const handleStart = async () => {
    setIsStarting(true);
    setActionError(null);
    try {
      const updated = await startAtallaSimulator(tarPath || undefined);
      setStatus(updated);

      // Auto-register hardware connection in workspace
      dispatch({
        type: 'SAVE_HARDWARE_CONNECTION',
        payload: {
          connection: {
            id: 'atalla-simulator-local',
            deviceId: 'utimaco-atalla-at1000',
            host: '127.0.0.1',
            port: updated.port || 7000,
            connectionType: 'TCP'
          }
        }
      });

      // If active tab is Atalla AT1000, enable live execution automatically
      const activeTab = workspaceState.tabs.find((t) => t.id === workspaceState.activeTabId);
      if (activeTab?.deviceId === 'utimaco-atalla-at1000' && activeTab.activeCommandId) {
        dispatch({
          type: 'SET_COMMAND_SELECTED_CONNECTION',
          payload: {
            tabId: activeTab.id,
            commandId: activeTab.activeCommandId,
            connectionId: 'atalla-simulator-local'
          }
        });
        dispatch({
          type: 'SET_COMMAND_LIVE_EXECUTION',
          payload: {
            tabId: activeTab.id,
            commandId: activeTab.activeCommandId,
            enabled: true
          }
        });
      }

      void fetchLogs();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsStarting(false);
    }
  };

  // Handle stop
  const handleStop = async () => {
    setIsStopping(true);
    setActionError(null);
    try {
      const updated = await stopAtallaSimulator();
      setStatus(updated);
      void fetchLogs();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsStopping(false);
    }
  };

  // Run quick self-test command
  const handleRunSelfTest = async (command: string) => {
    setIsTesting(true);
    setTestOutput(null);
    try {
      const result = await sendHardwareCommand(
        {
          id: 'atalla-simulator-local',
          deviceId: 'utimaco-atalla-at1000',
          host: '127.0.0.1',
          port: status?.port || 7000,
          connectionType: 'TCP'
        },
        command,
        'delimited-positional'
      );
      setTestOutput({
        command,
        response: result.response,
        error: result.error,
        elapsedMs: result.elapsedMs
      });
    } catch (e) {
      setTestOutput({
        command,
        error: e instanceof Error ? e.message : String(e)
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyLogs = async () => {
    if (!logs) return;
    try {
      await navigator.clipboard.writeText(logs);
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  // Derive status badge
  const renderStatusBadge = () => {
    if (!status) return null;

    if (!status.dockerAvailable) {
      return (
        <Badge
          variant="destructive"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
          data-testid="simulator-status-badge"
        >
          <XCircle className="w-3.5 h-3.5 text-white" />
          <FormattedMessage id="simulator.status.dockerOffline" defaultMessage="Docker Offline" />
        </Badge>
      );
    }

    if (status.containerRunning && status.tcpReachable) {
      return (
        <Badge
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 px-2.5 py-1 text-xs shadow-sm shadow-emerald-500/20"
          data-testid="simulator-status-badge"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <FormattedMessage
            id="simulator.status.running"
            defaultMessage="En Ejecución (Puerto 7000)"
          />
        </Badge>
      );
    }

    if (status.containerRunning && !status.tcpReachable) {
      return (
        <Badge
          className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 px-2.5 py-1 text-xs"
          data-testid="simulator-status-badge"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Iniciando Socket :7000...</span>
        </Badge>
      );
    }

    if (status.imageLoaded) {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
          data-testid="simulator-status-badge"
        >
          <Square className="w-3.5 h-3.5 text-muted-foreground" />
          <FormattedMessage id="simulator.status.stopped" defaultMessage="Detenido" />
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground"
        data-testid="simulator-status-badge"
      >
        <Server className="w-3.5 h-3.5" />
        <FormattedMessage id="simulator.status.unloaded" defaultMessage="Imagen no cargada" />
      </Badge>
    );
  };

  const isRunning = Boolean(status?.containerRunning && status?.tcpReachable);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  <FormattedMessage
                    id="simulator.atalla.title"
                    defaultMessage="Simulador Utimaco Atalla AT1000"
                  />
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  <FormattedMessage
                    id="simulator.atalla.description"
                    defaultMessage="Despliega y controla el contenedor oficial del simulador Atalla AT1000 de Utimaco en tu máquina local para pruebas de desarrollo."
                  />
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {renderStatusBadge()}
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-5 overflow-y-auto pr-1 pt-4 text-sm">
          {/* Action error banner */}
          {actionError && (
            <div
              className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-start gap-2"
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Error: </span>
                <span>{actionError}</span>
              </div>
            </div>
          )}

          {/* Docker offline info */}
          {status && !status.dockerAvailable && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-semibold">Docker Desktop no está en ejecución. </span>
                <span>
                  Para usar el simulador de hardware oficial, asegúrate de que Docker Desktop esté
                  iniciado en tu sistema.
                </span>
              </div>
            </div>
          )}

          {/* Control Panel Card */}
          <div className="rounded-lg border border-border/80 bg-card p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Control del Contenedor Docker
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Host: <code className="font-mono text-primary font-semibold">127.0.0.1:7000</code> (TCP RAW Socket ASCII)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchStatus}
                  disabled={isRefreshing || isStarting || isStopping}
                  title="Refrescar estado"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>

                {!isRunning ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStart}
                    disabled={isStarting || (status !== null && !status.dockerAvailable)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isStarting ? 'animate-pulse' : ''}`} />
                    {isStarting ? (
                      <FormattedMessage id="simulator.action.starting" defaultMessage="Iniciando..." />
                    ) : (
                      <FormattedMessage id="simulator.action.start" defaultMessage="Iniciar Simulador" />
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStop}
                    disabled={isStopping}
                    className="gap-1.5 shadow-sm"
                  >
                    <Square className={`w-3.5 h-3.5 fill-current ${isStopping ? 'animate-pulse' : ''}`} />
                    {isStopping ? (
                      <FormattedMessage id="simulator.action.stopping" defaultMessage="Deteniendo..." />
                    ) : (
                      <FormattedMessage id="simulator.action.stop" defaultMessage="Detener Simulador" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Path configuration if image is not loaded */}
            {status && !status.imageLoaded && (
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <label className="text-xs font-medium text-foreground">
                  <FormattedMessage
                    id="simulator.tar.label"
                    defaultMessage="Ruta del Archivo de Imagen Docker (.tar)"
                  />
                </label>
                <Input
                  type="text"
                  placeholder="docs/Utimaco_Atalla-AT1000/Simulator/Atalla-AT1000-Simulator/utimaco_atalla_simulator_8.56.tar"
                  value={tarPath}
                  onChange={(e) => setTarPath(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  <FormattedMessage
                    id="simulator.tar.hint"
                    defaultMessage="Si se deja vacío, la aplicación buscará automáticamente en la carpeta simulators/ o docs/."
                  />
                </p>
              </div>
            )}
          </div>

          {/* Quick Self-Test Diagnostics */}
          <div className="rounded-lg border border-border/80 bg-card p-4 space-y-3 shadow-xs">
            <div>
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                <FormattedMessage
                  id="simulator.selftest.title"
                  defaultMessage="Pruebas Rápidas de Diagnóstico (Self-Test)"
                />
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                <FormattedMessage
                  id="simulator.selftest.description"
                  defaultMessage="Envía comandos de diagnóstico directo al simulador y comprueba la respuesta en tiempo real:"
                />
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRunSelfTest('<00#TEST#1234#>')}
                disabled={!isRunning || isTesting}
                className="font-mono text-xs gap-1.5"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                &lt;00#TEST#1234#&gt; (Echo)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRunSelfTest('<9A#ID#>')}
                disabled={!isRunning || isTesting}
                className="font-mono text-xs gap-1.5"
              >
                <Server className="w-3 h-3 text-blue-500" />
                &lt;9A#ID#&gt; (HSM Info)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRunSelfTest('<9A#KEY#>')}
                disabled={!isRunning || isTesting}
                className="font-mono text-xs gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                &lt;9A#KEY#&gt; (MFK Status)
              </Button>
            </div>

            {/* Test result display */}
            {testOutput && (
              <div className="p-3 rounded-md bg-muted/60 border border-border/80 space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground">Petición:</span>
                    <span className="font-semibold text-foreground">{testOutput.command}</span>
                  </div>
                  {testOutput.elapsedMs !== undefined && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {testOutput.elapsedMs} ms
                    </span>
                  )}
                </div>

                {testOutput.response && (
                  <div
                    data-testid="selftest-response-container"
                    className="text-xs font-mono p-2 rounded bg-background border border-border/60 text-emerald-600 dark:text-emerald-400 break-all select-all flex items-center justify-between gap-2"
                  >
                    <span data-testid="selftest-response-value">{testOutput.response}</span>
                    {onLoadCommand && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLoadCommand(testOutput.response!)}
                        className="h-6 text-[11px] gap-1 px-2 text-primary hover:text-primary"
                        title="Cargar esta respuesta en el editor"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <FormattedMessage
                          id="simulator.selftest.loadInEditor"
                          defaultMessage="Cargar en el Editor"
                        />
                      </Button>
                    )}
                  </div>
                )}

                {testOutput.error && (
                  <div className="text-xs font-mono p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive break-all">
                    {testOutput.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Docker Logs Section */}
          <div className="rounded-lg border border-border/80 bg-card p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <FormattedMessage
                  id="simulator.logs.title"
                  defaultMessage="Registros del Contenedor (Docker Logs)"
                />
              </h4>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLogs}
                  disabled={!logs || isLoadingLogs}
                  className="h-7 text-xs gap-1 px-2"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <FormattedMessage id="simulator.logs.copy" defaultMessage="Copiar Logs" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchLogs}
                  disabled={isLoadingLogs}
                  className="h-7 text-xs gap-1 px-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  <FormattedMessage id="simulator.logs.refresh" defaultMessage="Actualizar" />
                </Button>
              </div>
            </div>

            <pre className="font-mono text-[11px] p-3 rounded-md bg-neutral-950 text-neutral-200 border border-neutral-800 h-36 overflow-y-auto select-all leading-relaxed">
              {logs || intl.formatMessage({ id: 'simulator.logs.empty', defaultMessage: 'No hay registros disponibles aún.' })}
            </pre>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
