/**
 * @packageDocumentation
 * Futurex Excrypt Plus Native Simulator Modal component providing one-click
 * lifecycle management, real-time health heartbeat, developer telemetry,
 * interactive self-test commands, and workspace auto-connection (`@chci/explorer`).
 */

import React, { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
import { useWorkspace } from '../state/workspace-context';
import {
  getFuturexSimulatorStatus,
  startFuturexSimulator,
  stopFuturexSimulator,
  type FuturexSimulatorStatus,
} from '../services/futurex-simulator-client';
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
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Activity,
  Layers,
} from 'lucide-react';

export interface FuturexSimulatorModalProps {
  /** Whether the simulator modal dialog is currently visible. */
  readonly open: boolean;
  /** Callback fired when the open state changes. */
  readonly onOpenChange: (open: boolean) => void;
  /** Optional callback to inject a command string directly into the active editor. */
  readonly onLoadCommand?: (raw: string) => void;
}

export const FuturexSimulatorModal: React.FC<FuturexSimulatorModalProps> = ({
  open,
  onOpenChange,
  onLoadCommand,
}) => {
  const intl = useIntl();
  const { state: workspaceState, dispatch } = useWorkspace();

  const [status, setStatus] = useState<FuturexSimulatorStatus>({
    running: false,
    port: 9000,
    tcpReachable: false,
    activeMfkKcv: '08D7B4',
    processedCommands: 0,
    uptimeSeconds: 0,
    errorMessage: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [portInput, setPortInput] = useState<string>('9000');

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    const fetchStatus = async () => {
      try {
        const s = await getFuturexSimulatorStatus();
        if (mounted) {
          setStatus(s);
          setPortInput(s.port.toString());
        }
      } catch (e) {
        if (mounted) {
          setStatus((prev) => ({
            ...prev,
            errorMessage: e instanceof Error ? e.message : String(e),
          }));
        }
      }
    };

    void fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [open]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const portNum = parseInt(portInput, 10) || 9000;
      const res = await startFuturexSimulator(portNum);
      setStatus(res);
      toast.success(
        intl.formatMessage(
          {
            id: 'simulator.futurex.startedSuccess',
            defaultMessage: 'Simulador Futurex activo en puerto TCP {port}',
          },
          { port: portNum }
        )
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error iniciando simulador Futurex');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await stopFuturexSimulator();
      setStatus(res);
      toast.info(
        intl.formatMessage({
          id: 'simulator.futurex.stoppedSuccess',
          defaultMessage: 'Simulador Futurex detenido correctamente',
        })
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error deteniendo simulador');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWorkspace = () => {
    dispatch({
      type: 'SAVE_HARDWARE_CONNECTION',
      payload: {
        connection: {
          id: 'futurex-simulator-local',
          deviceId: 'futurex-excrypt',
          host: '127.0.0.1',
          port: status.port || 9000,
          connectionType: 'TCP',
        },
      },
    });

    const activeTab = workspaceState.tabs.find((t) => t.id === workspaceState.activeTabId);
    if (activeTab?.deviceId === 'futurex-excrypt' && activeTab.activeCommandId) {
      dispatch({
        type: 'SET_COMMAND_SELECTED_CONNECTION',
        payload: {
          tabId: activeTab.id,
          commandId: activeTab.activeCommandId,
          connectionId: 'futurex-simulator-local',
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
          id: 'simulator.futurex.connectedSuccess',
          defaultMessage: 'CHCI conectado al Simulador Futurex en 127.0.0.1:{port}',
        },
        { port: status.port || 9000 }
      )
    );
    onOpenChange(false);
  };

  const sampleCommands = [
    {
      name: 'Echo / Conectividad (ECHO)',
      cmd: '[AOECHO;AGPingTest;]',
      desc: 'Comprueba el canal y devuelve eco intacto en AG',
    },
    {
      name: 'Versión del Firmware (VR)',
      cmd: '[AOVR;]',
      desc: 'Devuelve versión del sistema Excrypt Plus y firmware',
    },
    {
      name: 'Generación de Claves (KG)',
      cmd: '[AOKG;AGKeyGenTest;]',
      desc: 'Genera clave de trabajo bajo MFK con KCV de control',
    },
    {
      name: 'Traducción de PIN Block (BB)',
      cmd: '[AOBB;PB0412AC89ABCDF567;]',
      desc: 'Traduce un PIN Block ISO-0 entre claves de zona',
    },
    {
      name: 'Cifrado de Datos (DN)',
      cmd: '[AODN;MDE;DT4E6F772069732074;]',
      desc: 'Cifra datos simétricos en modo ECB bajo MFK',
    },
    {
      name: 'MAC Financiero (FM)',
      cmd: '[AOFM;DTTransactionData;]',
      desc: 'Calcula un MAC Retail sobre los datos de transacción',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-neutral-900 border-neutral-800 text-neutral-100 shadow-2xl">
        <DialogHeader className="border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                  <FormattedMessage
                    id="simulator.futurex.title"
                    defaultMessage="Simulador Futurex Excrypt Plus (v7.6.1)"
                  />
                  <Badge
                    data-testid="futurex-status-badge"
                    variant={status.running ? 'success' : 'secondary'}
                    className={
                      status.running
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-400'
                    }
                  >
                    {status.running ? 'ONLINE :9000' : 'OFFLINE'}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-400 mt-0.5">
                  <FormattedMessage
                    id="simulator.futurex.desc"
                    defaultMessage="Emulador nativo en Rust de alto rendimiento con sintaxis Tag-Valor [AO...;] y soporte MFK."
                  />
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-5 py-4">
          {/* Status and Action Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
              <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-orange-400" />
                <span>Estado del Listener</span>
              </div>
              <div className="text-sm font-semibold text-neutral-200">
                {status.running ? 'Escuchando en TCP' : 'Detenido'}
              </div>
              <div className="text-xs text-neutral-400">
                Puerto: {status.port}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
              <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>MFK de Prueba Activa</span>
              </div>
              <div className="text-sm font-semibold text-neutral-200">
                Major File Key (3DES)
              </div>
              <div className="text-xs text-neutral-400">
                KCV: <span className="font-mono text-emerald-400">{status.activeMfkKcv}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
              <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Comandos Procesados</span>
              </div>
              <div className="text-sm font-semibold text-neutral-200">
                {status.processedCommands} peticiones
              </div>
              <div className="text-xs text-neutral-400">
                Tiempo activo: {status.uptimeSeconds}s
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Puerto TCP:</span>
              <Input
                value={portInput}
                onChange={(e) => setPortInput(e.target.value)}
                disabled={status.running || loading}
                className="w-24 h-8 bg-neutral-900 border-neutral-700 text-xs font-mono text-center"
              />
            </div>

            <div className="flex items-center gap-2">
              {!status.running ? (
                <Button
                  onClick={handleStart}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs gap-1.5 px-3"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Iniciar Simulador
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleStop}
                    disabled={loading}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 text-xs gap-1.5 px-3"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Detener
                  </Button>
                  <Button
                    onClick={handleConnectWorkspace}
                    className="bg-orange-600 hover:bg-orange-500 text-white h-8 text-xs gap-1.5 px-3"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Conectar CHCI a este Simulador
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Quick Tests */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ejemplos Rápidos de Diagnóstico (Inyectar al Editor)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleCommands.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition flex items-center justify-between"
                >
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="text-xs font-medium text-neutral-200">{sc.name}</div>
                    <div className="text-[11px] text-neutral-400 truncate">{sc.desc}</div>
                    <div className="text-[10px] font-mono text-neutral-500 truncate">{sc.cmd}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (onLoadCommand) {
                        onLoadCommand(sc.cmd);
                        toast.success(`Comando ${sc.name} cargado en el editor`);
                      }
                    }}
                    className="h-7 w-7 p-0 text-neutral-400 hover:text-white"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
