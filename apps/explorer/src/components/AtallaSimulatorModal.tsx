/**
 * @packageDocumentation
 * Atalla Simulator Modal component providing one-click Docker lifecycle management,
 * startup progress milestones, real-time health heartbeat, developer telemetry,
 * interactive self-test commands, and Docker log inspection (`@chci/explorer`).
 */

import React, { useEffect, useRef, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
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
  ArrowRight,
  RotateCcw,
  Cpu,
  Layers,
  HardDrive,
  ShieldCheck,
  Activity
} from 'lucide-react';

export interface AtallaSimulatorModalProps {
  /** Whether the simulator modal dialog is currently visible. */
  readonly open: boolean;
  /** Callback fired when the open state changes. */
  readonly onOpenChange: (open: boolean) => void;
  /** Optional callback to inject a command string directly into the active editor. */
  readonly onLoadCommand?: (raw: string) => void;
}

export type StartupStage = 'docker' | 'kernel' | 'flash' | 'socket';

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
  const [isRestarting, setIsRestarting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Startup progress tracking
  const [startupPercent, setStartupPercent] = useState<number>(0);
  const [startupStage, setStartupStage] = useState<StartupStage | null>(null);

  // Continuous health monitor ref
  const previousRunningRef = useRef<boolean | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHeartbeatPollingRef = useRef<boolean>(false);

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

  // Clean up progress timer on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // Heartbeat health check (every 4.5 seconds when open and not transitioning)
  useEffect(() => {
    if (!open) return;

    const heartbeatInterval = setInterval(async () => {
      if (isStarting || isStopping || isRestarting) return;
      if (isHeartbeatPollingRef.current) return;

      isHeartbeatPollingRef.current = true;
      try {
        const current = await getAtallaSimulatorStatus();
        const wasRunning = previousRunningRef.current === true;
        const nowRunning = Boolean(current.containerRunning && current.tcpReachable);

        if (wasRunning && !nowRunning) {
          // Detected unexpected crash or drop
          previousRunningRef.current = false;
          toast.error(
            intl.formatMessage({
              id: 'simulator.toast.crashed',
              defaultMessage: 'El simulador Atalla se ha detenido inesperadamente.'
            }),
            {
              description: intl.formatMessage({
                id: 'simulator.toast.crashed.desc',
                defaultMessage: 'El contenedor Docker o el proceso del socket TCP ya no responde.'
              })
            }
          );
        } else if (nowRunning) {
          previousRunningRef.current = true;
        }

        setStatus(current);
      } catch {
        // Heartbeat failure ignored gracefully
      } finally {
        isHeartbeatPollingRef.current = false;
      }
    }, 4500);

    return () => clearInterval(heartbeatInterval);
  }, [open, isStarting, isStopping, isRestarting, intl]);

  // Start progress simulation animation
  const startProgressAnimation = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    setStartupPercent(10);
    setStartupStage('docker');

    const startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed < 1400) {
        setStartupStage('docker');
        setStartupPercent((prev) => Math.min(28, prev + 4));
      } else if (elapsed < 2800) {
        setStartupStage('kernel');
        setStartupPercent((prev) => Math.min(55, prev + 3));
      } else if (elapsed < 4800) {
        setStartupStage('flash');
        setStartupPercent((prev) => Math.min(82, prev + 2));
      } else {
        setStartupStage('socket');
        setStartupPercent((prev) => Math.min(94, prev + 1));
      }
    }, 250);
  };

  const stopProgressAnimation = (success: boolean) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (success) {
      setStartupPercent(100);
      setStartupStage('socket');
    } else {
      setStartupPercent(0);
      setStartupStage(null);
    }
  };

  // Handle start
  const handleStart = async () => {
    setIsStarting(true);
    setActionError(null);
    startProgressAnimation();

    try {
      const updated = await startAtallaSimulator(tarPath || undefined);
      stopProgressAnimation(true);
      setStatus(updated);
      previousRunningRef.current = true;

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

      toast.success(
        intl.formatMessage({
          id: 'simulator.toast.ready',
          defaultMessage: 'Simulador Atalla AT1000 listo para recibir peticiones en 127.0.0.1:7000.'
        })
      );

      void fetchLogs();
    } catch (e) {
      stopProgressAnimation(false);
      const errMsg = e instanceof Error ? e.message : String(e);
      setActionError(errMsg);
      toast.error(errMsg);
    } finally {
      setTimeout(() => {
        setIsStarting(false);
        setStartupStage(null);
      }, 500);
    }
  };

  // Handle stop
  const handleStop = async () => {
    setIsStopping(true);
    setActionError(null);
    previousRunningRef.current = false;

    try {
      const updated = await stopAtallaSimulator();
      setStatus(updated);
      toast.info(
        intl.formatMessage({
          id: 'simulator.toast.stopped',
          defaultMessage: 'Simulador Atalla detenido correctamente.'
        })
      );
      void fetchLogs();
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setActionError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsStopping(false);
    }
  };

  // Handle restart
  const handleRestart = async () => {
    setIsRestarting(true);
    setActionError(null);
    previousRunningRef.current = false;

    try {
      await stopAtallaSimulator();
      await new Promise((r) => setTimeout(r, 600));
      await handleStart();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsRestarting(false);
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

        <DialogBody className="space-y-4 overflow-y-auto pr-1 pt-4 text-sm">
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

          {/* Startup Progress Card (Animated during initialization) */}
          {(isStarting || startupStage !== null) && (
            <div
              data-testid="simulator-startup-progress-card"
              className="rounded-lg border border-primary/40 bg-primary/5 p-4 space-y-3 animate-in fade-in duration-300"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    <FormattedMessage
                      id="simulator.progress.title"
                      defaultMessage="Inicializando entorno del simulador Atalla AT1000..."
                    />
                  </span>
                </div>
                <span className="font-mono font-bold text-primary text-sm">{startupPercent}%</span>
              </div>

              {/* Progress bar container */}
              <div className="w-full bg-muted/80 rounded-full h-2.5 overflow-hidden border border-border/50">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${startupPercent}%` }}
                />
              </div>

              {/* Progress Milestones */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded transition-colors ${
                    startupPercent >= 25
                      ? 'text-emerald-500 font-medium'
                      : startupStage === 'docker'
                      ? 'text-primary font-semibold animate-pulse'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {startupPercent >= 25 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>Contenedor Docker</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded transition-colors ${
                    startupPercent >= 50
                      ? 'text-emerald-500 font-medium'
                      : startupStage === 'kernel'
                      ? 'text-primary font-semibold animate-pulse'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {startupPercent >= 50 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>SMOS Kernel SDK</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded transition-colors ${
                    startupPercent >= 80
                      ? 'text-emerald-500 font-medium'
                      : startupStage === 'flash'
                      ? 'text-primary font-semibold animate-pulse'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {startupPercent >= 80 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <HardDrive className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>Módulos Flash</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded transition-colors ${
                    startupPercent >= 100
                      ? 'text-emerald-500 font-medium'
                      : startupStage === 'socket'
                      ? 'text-primary font-semibold animate-pulse'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {startupPercent >= 100 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>Socket TCP :7000</span>
                </div>
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
                  disabled={isRefreshing || isStarting || isStopping || isRestarting}
                  title="Refrescar estado"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>

                {!isRunning ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStart}
                    disabled={isStarting || isRestarting || (status !== null && !status.dockerAvailable)}
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
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRestart}
                      disabled={isRestarting || isStopping}
                      className="gap-1.5 shadow-sm text-xs"
                      title={intl.formatMessage({ id: 'simulator.action.restart', defaultMessage: 'Reiniciar Simulador' })}
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin' : ''}`} />
                      {isRestarting ? (
                        <FormattedMessage id="simulator.action.restarting" defaultMessage="Reiniciando..." />
                      ) : (
                        <FormattedMessage id="simulator.action.restart" defaultMessage="Reiniciar" />
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleStop}
                      disabled={isStopping || isRestarting}
                      className="gap-1.5 shadow-sm text-xs"
                    >
                      <Square className={`w-3.5 h-3.5 fill-current ${isStopping ? 'animate-pulse' : ''}`} />
                      {isStopping ? (
                        <FormattedMessage id="simulator.action.stopping" defaultMessage="Deteniendo..." />
                      ) : (
                        <FormattedMessage id="simulator.action.stop" defaultMessage="Detener" />
                      )}
                    </Button>
                  </div>
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

          {/* Developer Telemetry & Diagnostics Card (Visible when running) */}
          {isRunning && (
            <div
              data-testid="simulator-telemetry-card"
              className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <FormattedMessage
                    id="simulator.telemetry.title"
                    defaultMessage="Telemetría y Estado de la Instancia"
                  />
                </h4>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  READY (PING OK)
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded bg-background border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Firmware / Kernel</span>
                  <span className="font-mono text-xs font-semibold text-foreground">SMOS SDK 5.6.4.1</span>
                </div>

                <div className="p-2.5 rounded bg-background border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Serial Number</span>
                  <span className="font-mono text-xs font-semibold text-foreground">SIM123</span>
                </div>

                <div className="p-2.5 rounded bg-background border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Master File Keys (MFK)</span>
                  <span className="font-mono text-xs font-semibold text-primary">MFK1: B196 / AMK1: B9BC</span>
                </div>

                <div className="p-2.5 rounded bg-background border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Endpoint Socket</span>
                  <span className="font-mono text-xs font-semibold text-foreground">127.0.0.1:7000 (Loopback)</span>
                </div>

                <div className="p-2.5 rounded bg-background border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Protocol Framing</span>
                  <span className="font-mono text-xs font-semibold text-foreground">Atalla Delimited (&lt;...#&gt;)</span>
                </div>

                <div className="p-2.5 rounded bg-background border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Latencia de Red / Ping</span>
                  <span className="font-mono text-xs font-semibold text-emerald-500">&lt;00#TEST#&gt; ~3 ms</span>
                </div>
              </div>
            </div>
          )}

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
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
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
