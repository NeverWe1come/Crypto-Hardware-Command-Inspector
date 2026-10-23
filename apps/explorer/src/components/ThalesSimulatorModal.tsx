/**
 * @packageDocumentation
 * Thales payShield 10K Native Simulator Modal component providing one-click
 * lifecycle management, real-time health heartbeat, developer telemetry,
 * interactive self-test commands, and workspace auto-connection (`@chci/explorer`).
 */

import React, { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
import { useWorkspace } from '../state/workspace-context';
import {
  getThalesSimulatorStatus,
  startThalesSimulator,
  stopThalesSimulator,
  type ThalesSimulatorStatus,
} from '../services/thales-simulator-client';
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

export interface ThalesSimulatorModalProps {
  /** Whether the simulator modal dialog is currently visible. */
  readonly open: boolean;
  /** Callback fired when the open state changes. */
  readonly onOpenChange: (open: boolean) => void;
  /** Optional callback to inject a command string directly into the active editor. */
  readonly onLoadCommand?: (raw: string) => void;
}

export const ThalesSimulatorModal: React.FC<ThalesSimulatorModalProps> = ({
  open,
  onOpenChange,
  onLoadCommand,
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

  const [loading, setLoading] = useState<boolean>(false);
  const [portInput, setPortInput] = useState<string>('1500');

  // Poll status on modal open
  useEffect(() => {
    if (!open) return;

    let mounted = true;
    const fetchStatus = async () => {
      try {
        const s = await getThalesSimulatorStatus();
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
      const portNum = parseInt(portInput, 10) || 1500;
      const res = await startThalesSimulator(portNum);
      setStatus(res);
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
      toast.error(e instanceof Error ? e.message : 'Error iniciando simulador Thales');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
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
          id: 'thales-simulator-local',
          deviceId: 'thales-payshield-10k',
          host: '127.0.0.1',
          port: status.port || 1500,
          connectionType: 'TCP',
        },
      },
    });

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
          id: 'simulator.thales.connectedSuccess',
          defaultMessage: 'CHCI conectado al Simulador Thales en 127.0.0.1:{port}',
        },
        { port: status.port || 1500 }
      )
    );
    onOpenChange(false);
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
      <DialogContent className="max-w-3xl bg-neutral-900 border-neutral-800 text-neutral-100 shadow-2xl">
        <DialogHeader className="border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
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
                        : 'bg-neutral-800 text-neutral-400'
                    }
                  >
                    {status.running ? 'ONLINE :1500' : 'OFFLINE'}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-400 mt-0.5">
                  <FormattedMessage
                    id="simulator.thales.desc"
                    defaultMessage="Emulador nativo en Rust de alto rendimiento con soporte de encuadre 2-byte BE y esquema Variant/KeyBlock."
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
                <Activity className="w-3.5 h-3.5 text-blue-400" />
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
                <span>LMK de Prueba Activa</span>
              </div>
              <div className="text-sm font-semibold text-neutral-200">
                LMK Pair 00 (2TDES)
              </div>
              <div className="text-xs text-neutral-400">
                KCV: <span className="font-mono text-emerald-400">{status.activeLmkKcv}</span>
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
                    className="bg-blue-600 hover:bg-blue-500 text-white h-8 text-xs gap-1.5 px-3"
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
