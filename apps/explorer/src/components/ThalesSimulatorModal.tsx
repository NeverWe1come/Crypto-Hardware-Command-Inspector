/**
 * @packageDocumentation
 * Thales payShield 10K Native Simulator Modal component providing one-click
 * lifecycle management, animated startup milestones, real-time health heartbeat,
 * developer telemetry, interactive self-test commands, and workspace auto-connection (`@chci/explorer`).
 */

import React, { useEffect, useRef, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
import { useWorkspace } from '../state/workspace-context';
import {
  getThalesSimulatorStatus,
  startThalesSimulator,
  stopThalesSimulator,
  type ThalesSimulatorStatus,
} from '../services/thales-simulator-client';
import { sendHardwareCommand } from '../services/hardware-client';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Server,
  Play,
  Square,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Send,
} from 'lucide-react';

export interface ThalesSimulatorModalProps {
  /** Whether the simulator modal dialog is currently visible. */
  readonly open: boolean;
  /** Callback fired when the open state changes. */
  readonly onOpenChange: (open: boolean) => void;
  /** Optional callback to inject a command string directly into the active editor. */
  readonly onLoadCommand?: (raw: string) => void;
  /** Whether to automatically initiate the startup sequence when opening the modal. */
  readonly autoStart?: boolean;
}

export type ThalesStartupStage = 'core' | 'lmk' | 'crypto' | 'socket';

export const ThalesSimulatorModal: React.FC<ThalesSimulatorModalProps> = ({
  open,
  onOpenChange,
  onLoadCommand,
  autoStart,
}) => {
  const intl = useIntl();
  const { state: workspaceState, dispatch } = useWorkspace();

  const [status, setStatus] = useState<ThalesSimulatorStatus>({
    running: false,
    port: 1500,
    tcpReachable: false,
    activeLmkKcv: '08D7B4',
    processedCommands: 0,
    uptimeSeconds: 0,
    errorMessage: null,
  });

  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const [portInput, setPortInput] = useState<string>('1500');
  const [actionError, setActionError] = useState<string | null>(null);

  // Startup progress tracking
  const [startupPercent, setStartupPercent] = useState<number>(0);
  const [startupStage, setStartupStage] = useState<ThalesStartupStage | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Self-test states
  const [testOutput, setTestOutput] = useState<{
    command: string;
    response?: string;
    error?: string;
    elapsedMs?: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchStatus = async (): Promise<ThalesSimulatorStatus | null> => {
    try {
      const s = await getThalesSimulatorStatus();
      setStatus(s);
      setPortInput(s.port.toString());
      return s;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setStatus((prev) => ({
        ...prev,
        errorMessage: errMsg,
      }));
      return null;
    }
  };

  // Poll status on modal open and trigger autoStart if requested
  useEffect(() => {
    if (!open) return;

    let mounted = true;
    void fetchStatus().then((s) => {
      if (mounted && autoStart && s && !s.running && !isStarting) {
        void handleStart();
      }
    });

    const interval = setInterval(() => {
      if (mounted && !isStarting && !isStopping) {
        void fetchStatus();
      }
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoStart]);

  const startProgressAnimation = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setStartupPercent(10);
    setStartupStage('core');
    setElapsedSeconds(0);

    const startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const secs = Math.floor(elapsed / 1000);
      setElapsedSeconds(secs);

      if (elapsed < 600) {
        setStartupStage('core');
        setStartupPercent((prev) => Math.min(30, prev + 5));
      } else if (elapsed < 1200) {
        setStartupStage('lmk');
        setStartupPercent((prev) => Math.min(60, prev + 5));
      } else if (elapsed < 1800) {
        setStartupStage('crypto');
        setStartupPercent((prev) => Math.min(85, prev + 5));
      } else {
        setStartupStage('socket');
        setStartupPercent((prev) => Math.min(95, prev + 2));
      }
    }, 100);
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

  const handleStart = async () => {
    setIsStarting(true);
    setActionError(null);
    startProgressAnimation();

    try {
      const portNum = parseInt(portInput, 10) || 1500;
      const res = await startThalesSimulator(portNum);
      stopProgressAnimation(true);
      setStatus(res);

      // Auto-register hardware connection in workspace
      dispatch({
        type: 'SAVE_HARDWARE_CONNECTION',
        payload: {
          connection: {
            id: 'thales-simulator-local',
            deviceId: 'thales-payshield-10k',
            host: '127.0.0.1',
            port: res.port || 1500,
            connectionType: 'TCP',
          },
        },
      });

      // Auto-activate on any open tab matching Thales
      const activeTab = workspaceState.tabs.find((t) => t.id === workspaceState.activeTabId);
      if (activeTab?.deviceId === 'thales-payshield-10k' && activeTab.activeCommandId) {
        dispatch({
          type: 'SET_COMMAND_SELECTED_CONNECTION',
          payload: {
            tabId: activeTab.id,
            commandId: activeTab.activeCommandId,
            connectionId: 'thales-simulator-local',
          },
        });
        dispatch({
          type: 'SET_COMMAND_LIVE_EXECUTION',
          payload: {
            tabId: activeTab.id,
            commandId: activeTab.activeCommandId,
            enabled: true,
          },
        });
      }

      toast.success(
        intl.formatMessage(
          {
            id: 'simulator.thales.startedSuccess',
            defaultMessage: 'Simulador Thales activo en puerto TCP {port}',
          },
          { port: portNum }
        )
      );
    } catch (e) {
      stopProgressAnimation(false);
      const errMsg = e instanceof Error ? e.message : 'Error iniciando simulador Thales';
      setActionError(errMsg);
      toast.error(errMsg);
    } finally {
      setTimeout(() => {
        setIsStarting(false);
        setStartupStage(null);
      }, 400);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    setActionError(null);
    try {
      const res = await stopThalesSimulator();
      setStatus(res);
      toast.info(
        intl.formatMessage({
          id: 'simulator.thales.stoppedSuccess',
          defaultMessage: 'Simulador Thales detenido correctamente',
        })
      );
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Error deteniendo simulador';
      setActionError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsStopping(false);
    }
  };

  const handleRunTest = async (command: string) => {
    setIsTesting(true);
    setTestOutput(null);
    try {
      const result = await sendHardwareCommand(
        {
          id: 'thales-simulator-local',
          deviceId: 'thales-payshield-10k',
          host: '127.0.0.1',
          port: status.port || 1500,
          connectionType: 'TCP',
        },
        command,
        'header-positional'
      );
      setTestOutput({
        command,
        response: result.response,
        error: result.error,
        elapsedMs: result.elapsedMs,
      });
    } catch (e) {
      setTestOutput({
        command,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const sampleCommands = [
    {
      name: 'Echo / Diagnóstico (NC)',
      cmd: '0001NC',
      desc: 'Comprueba estado del HSM y devuelve KCVs de LMK',
    },
    {
      name: 'Generar Clave ZPK (A0)',
      cmd: '0001A00001U',
      desc: 'Genera una Zone PIN Key bajo esquema Variant LMK',
    },
    {
      name: 'Calcular CVV (CW)',
      cmd: '0001CW0123456789ABCDEFFEDCBA98765432104012888888881881;8701101',
      desc: 'Genera un CVV/CVC de 3 dígitos según algoritmo estándar Visa',
    },
    {
      name: 'Verificar PIN Block (FA)',
      cmd: '0001FA0123456789ABCDEFFEDCBA98765432100123456789ABCDEFFEDCBA9876543210120412AC89ABCDF56740128888888818814012888888881881',
      desc: 'Verifica y traduce un bloque de PIN ISO-0',
    },
    {
      name: 'Generar MAC Retail (M0)',
      cmd: '0001M000010123456789ABCDEFFEDCBA98765432100004TEST',
      desc: 'Calcula un MAC Retail ISO 9797-1 Algoritmo 3',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="thales-simulator-modal"
        className="max-w-3xl max-h-[90vh] flex flex-col p-6 overflow-hidden bg-card border-border text-foreground shadow-2xl"
      >
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FormattedMessage
                    id="simulator.thales.title"
                    defaultMessage="Simulador Thales payShield 10K (v2.3 / v1.9)"
                  />
                  <Badge
                    data-testid="simulator-status-badge"
                    variant={status.running ? 'success' : 'secondary'}
                    className={
                      status.running
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-muted text-muted-foreground'
                    }
                  >
                    {status.running ? `ONLINE :${status.port}` : 'OFFLINE'}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  <FormattedMessage
                    id="simulator.thales.desc"
                    defaultMessage="Emulador nativo en Rust de alto rendimiento con soporte de encuadre 2-byte BE y esquema Variant/KeyBlock."
                  />
                </DialogDescription>
              </div>
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
                    Inicializando entorno del simulador Thales payShield 10K...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground text-[11px]">
                    ({elapsedSeconds}s)
                  </span>
                  <span className="font-mono font-bold text-primary text-sm">{startupPercent}%</span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="w-full bg-muted/80 rounded-full h-2.5 overflow-hidden border border-border/50">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${startupPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground leading-normal">
                Inicializando motor criptográfico en Rust, derivando tablas de claves LMK 00 y enlazando listener TCP loopback con prefijo Big-Endian de 2 bytes.
              </p>

              {/* Progress Milestones */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded transition-colors ${
                    startupPercent >= 25
                      ? 'text-emerald-500 font-medium'
                      : startupStage === 'core'
                      ? 'text-primary font-semibold animate-pulse'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {startupPercent >= 25 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>Firmware v2.3</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded transition-colors ${
                    startupPercent >= 50
                      ? 'text-emerald-500 font-medium'
                      : startupStage === 'lmk'
                      ? 'text-primary font-semibold animate-pulse'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {startupPercent >= 50 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>LMK Pair 00</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded transition-colors ${
                    startupPercent >= 75
                      ? 'text-emerald-500 font-medium'
                      : startupStage === 'crypto'
                      ? 'text-primary font-semibold animate-pulse'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {startupPercent >= 75 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>3DES / AES Core</span>
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
                    <Server className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>TCP :1500 Listo</span>
                </div>
              </div>
            </div>
          )}

          {/* Status and Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Estado del Listener</span>
              </div>
              <div className="text-sm font-semibold text-foreground">
                {status.running ? 'Escuchando en TCP' : 'Detenido'}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                127.0.0.1:{status.port}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>LMK de Prueba Activa</span>
              </div>
              <div className="text-sm font-semibold text-foreground">
                LMK Pair 00 (2TDES)
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                KCV: <span className="text-emerald-400 font-bold">{status.activeLmkKcv}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Telemetría</span>
              </div>
              <div className="text-sm font-semibold text-foreground">
                {status.processedCommands} comandos
              </div>
              <div className="text-xs text-muted-foreground">
                Tiempo activo: {status.uptimeSeconds}s
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Puerto TCP:</span>
              <Input
                value={portInput}
                onChange={(e) => setPortInput(e.target.value)}
                disabled={status.running || isStarting || isStopping}
                className="w-24 h-8 text-xs font-mono text-center"
              />
            </div>

            <div className="flex items-center gap-2">
              {!status.running ? (
                <Button
                  onClick={handleStart}
                  disabled={isStarting || isStopping}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-1.5 px-3 font-medium"
                >
                  {isStarting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  Iniciar Simulador
                </Button>
              ) : (
                <Button
                  onClick={handleStop}
                  disabled={isStarting || isStopping}
                  variant="destructive"
                  className="h-8 text-xs gap-1.5 px-3 font-medium"
                >
                  {isStopping ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Square className="w-3.5 h-3.5 fill-current" />
                  )}
                  Detener Simulador
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Self-Test Panel */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-semibold text-foreground flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>Pruebas Rápidas de Diagnóstico y Autocomprobación</span>
              </div>
              {status.running && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 font-normal">
                  <CheckCircle2 className="w-3 h-3" />
                  Socket :1500 activo
                </span>
              )}
            </div>

            {/* Test output display card */}
            {testOutput && (
              <div className="rounded-lg border border-border bg-background p-3 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/50 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Send className="w-3 h-3 text-primary" />
                    <span>Enviado: {testOutput.command}</span>
                  </div>
                  {testOutput.elapsedMs !== undefined && (
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                      {testOutput.elapsedMs} ms
                    </span>
                  )}
                </div>
                {testOutput.response && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">Respuesta HSM:</span>
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded overflow-x-auto text-xs break-all">
                      {testOutput.response}
                    </div>
                  </div>
                )}
                {testOutput.error && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-destructive uppercase font-semibold">Error:</span>
                    <div className="p-2 bg-destructive/10 border border-destructive/20 text-destructive rounded overflow-x-auto text-xs">
                      {testOutput.error}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Diagnostic Command Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleCommands.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-medium text-foreground">{sc.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{sc.desc}</div>
                    <div className="text-[10px] font-mono text-primary truncate">{sc.cmd}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!status.running || isTesting}
                      onClick={() => handleRunTest(sc.cmd)}
                      title="Ejecutar prueba contra el simulador"
                      className="h-7 px-2 text-[10px] border-border hover:bg-secondary gap-1"
                    >
                      <Zap className="w-3 h-3 text-sky-400" />
                      <span>Probar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (onLoadCommand) {
                          onLoadCommand(sc.cmd);
                          toast.success(`Comando ${sc.name} cargado en el editor`);
                        }
                      }}
                      title="Inyectar comando en el editor activo"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
