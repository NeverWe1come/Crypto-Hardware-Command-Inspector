/**
 * @packageDocumentation
 * Marvell LiquidSecurity HSM Native Simulator Modal component providing one-click
 * lifecycle management, real-time health heartbeat, developer telemetry,
 * interactive self-test commands, and workspace auto-connection (`@chci/explorer`).
 */

import React, { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
import {
  getLiquidSecuritySimulatorStatus,
  startLiquidSecuritySimulator,
  stopLiquidSecuritySimulator,
  type LiquidSecuritySimulatorStatus,
} from '../services/liquidsecurity-simulator-client';
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

export interface LiquidSecuritySimulatorModalProps {
  /** Whether the simulator modal dialog is currently visible. */
  readonly open: boolean;
  /** Callback fired when the open state changes. */
  readonly onOpenChange: (open: boolean) => void;
  /** Optional callback to inject a command string directly into the active editor. */
  readonly onLoadCommand?: (raw: string) => void;
}

export const LiquidSecuritySimulatorModal: React.FC<LiquidSecuritySimulatorModalProps> = ({
  open,
  onOpenChange,
  onLoadCommand,
}) => {
  const intl = useIntl();

  const [status, setStatus] = useState<LiquidSecuritySimulatorStatus>({
    running: false,
    port: 2225,
    tcpReachable: false,
    firmwareVersion: '3.4.0',
    activePartitions: 2,
    processedCommands: 0,
    uptimeSeconds: 0,
    errorMessage: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [portInput, setPortInput] = useState<string>('2225');

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    const fetchStatus = async () => {
      try {
        const s = await getLiquidSecuritySimulatorStatus();
        if (mounted) {
          setStatus(s);
          setPortInput(s.port.toString());
        }
      } catch {
        // Fallback silently if not available
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [open]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const port = parseInt(portInput, 10) || 2225;
      const res = await startLiquidSecuritySimulator(port);
      setStatus(res);
      toast.success(
        intl.formatMessage(
          {
            id: 'simulators.liquidsecurity.toastStarted',
            defaultMessage: 'Simulador Marvell LiquidSecurity iniciado en puerto TCP {port}',
          },
          { port }
        )
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : intl.formatMessage({
              id: 'simulators.liquidsecurity.startError',
              defaultMessage: 'Error iniciando el simulador Marvell LiquidSecurity',
            })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await stopLiquidSecuritySimulator();
      setStatus(res);
      toast.info(
        intl.formatMessage({
          id: 'simulators.liquidsecurity.toastStopped',
          defaultMessage: 'Simulador Marvell LiquidSecurity detenido.',
        })
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : intl.formatMessage({
              id: 'simulators.liquidsecurity.stopError',
              defaultMessage: 'Error deteniendo el simulador Marvell LiquidSecurity',
            })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInjectCommand = (cmd: string) => {
    if (onLoadCommand) {
      onLoadCommand(cmd);
      onOpenChange(false);
      toast.success(
        intl.formatMessage({
          id: 'simulators.common.commandInjected',
          defaultMessage: 'Comando cargado en el editor de CHCI.',
        })
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[700px] border-border bg-card text-foreground"
        data-testid="liquidsecurity-simulator-modal"
      >
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <Server className="size-5 text-indigo-400" />
              <DialogTitle className="text-lg font-semibold tracking-tight">
                <FormattedMessage
                  id="simulators.liquidsecurity.title"
                  defaultMessage="Simulador Marvell LiquidSecurity HSM (Nativo)"
                />
              </DialogTitle>
            </div>
            {status.running ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5"
                data-testid="liquid-status-badge"
              >
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <FormattedMessage id="simulators.common.online" defaultMessage="ONLINE" />
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-muted text-muted-foreground gap-1.5"
                data-testid="liquid-status-badge"
              >
                <span className="size-1.5 rounded-full bg-muted-foreground" />
                <FormattedMessage id="simulators.common.offline" defaultMessage="OFFLINE" />
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            <FormattedMessage
              id="simulators.liquidsecurity.description"
              defaultMessage="Emulador local en Rust para pruebas de particionado virtual Cavium NITROX, consola CLI y llamadas OASIS PKCS#11."
            />
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4 py-2">
          {/* Controls section */}
          <div className="p-4 rounded-lg bg-secondary/40 border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  <FormattedMessage id="simulators.common.portLabel" defaultMessage="Puerto TCP" />
                </span>
                <Input
                  type="number"
                  value={portInput}
                  disabled={status.running || loading}
                  onChange={(e) => setPortInput(e.target.value)}
                  className="w-24 h-8 text-xs font-mono"
                  data-testid="liquid-port-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {status.running ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleStop}
                  disabled={loading}
                  className="h-8 gap-1.5 text-xs"
                  data-testid="liquid-stop-btn"
                >
                  <Square className="size-3.5 fill-current" />
                  <FormattedMessage id="simulators.common.stop" defaultMessage="Detener" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStart}
                  disabled={loading}
                  className="h-8 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  data-testid="liquid-start-btn"
                >
                  <Play className="size-3.5 fill-current" />
                  <FormattedMessage id="simulators.common.start" defaultMessage="Iniciar" />
                </Button>
              )}
            </div>
          </div>

          {/* Telemetry card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-md bg-secondary/20 border border-border/40 flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Cpu className="size-3 text-indigo-400" />
                <FormattedMessage id="simulators.liquidsecurity.firmware" defaultMessage="Firmware" />
              </span>
              <span className="font-mono text-xs font-semibold text-foreground">
                {status.firmwareVersion}
              </span>
            </div>

            <div className="p-3 rounded-md bg-secondary/20 border border-border/40 flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Layers className="size-3 text-blue-400" />
                <FormattedMessage id="simulators.liquidsecurity.partitions" defaultMessage="Particiones" />
              </span>
              <span className="font-mono text-xs font-semibold text-foreground">
                {status.activePartitions}
              </span>
            </div>

            <div className="p-3 rounded-md bg-secondary/20 border border-border/40 flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Activity className="size-3 text-emerald-400" />
                <FormattedMessage id="simulators.common.processed" defaultMessage="Comandos" />
              </span>
              <span className="font-mono text-xs font-semibold text-foreground">
                {status.processedCommands}
              </span>
            </div>

            <div className="p-3 rounded-md bg-secondary/20 border border-border/40 flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="size-3 text-amber-400" />
                <FormattedMessage id="simulators.common.uptime" defaultMessage="Tiempo Activo" />
              </span>
              <span className="font-mono text-xs font-semibold text-foreground">
                {status.uptimeSeconds}s
              </span>
            </div>
          </div>

          {/* Quick diagnostic test commands */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-400" />
              <FormattedMessage
                id="simulators.common.quickTests"
                defaultMessage="Pruebas Rápidas de Diagnóstico"
              />
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-md bg-secondary/30 border border-border/50 flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate">
                    KRN_STATUS (CLI)
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Telemetría física de sensores NITROX y kernel
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInjectCommand('KRN_STATUS')}
                  className="h-7 text-xs gap-1 shrink-0"
                  data-testid="liquid-test-krn-btn"
                >
                  <ArrowRight className="size-3" />
                  <FormattedMessage id="simulators.common.load" defaultMessage="Cargar" />
                </Button>
              </div>

              <div className="p-2.5 rounded-md bg-secondary/30 border border-border/50 flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate">
                    PART_CREATE (CLI)
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Aprovisionamiento de partición virtual
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInjectCommand('PART_CREATE partition_id=3 key_quota=500')}
                  className="h-7 text-xs gap-1 shrink-0"
                  data-testid="liquid-test-part-btn"
                >
                  <ArrowRight className="size-3" />
                  <FormattedMessage id="simulators.common.load" defaultMessage="Cargar" />
                </Button>
              </div>

              <div className="p-2.5 rounded-md bg-secondary/30 border border-border/50 flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate">
                    C_GenerateKey (PKCS#11)
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Generación de clave AES con KCV
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInjectCommand('C_GenerateKey(hSession=0x01, mechanism=CKM_AES_KEY_GEN);')}
                  className="h-7 text-xs gap-1 shrink-0"
                  data-testid="liquid-test-genkey-btn"
                >
                  <ArrowRight className="size-3" />
                  <FormattedMessage id="simulators.common.load" defaultMessage="Cargar" />
                </Button>
              </div>

              <div className="p-2.5 rounded-md bg-secondary/30 border border-border/50 flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate">
                    C_Encrypt (PKCS#11)
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Cifrado de datos en bloque
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInjectCommand('C_Encrypt(hSession=0x01, pData="00112233445566778899AABBCCDDEEFF");')}
                  className="h-7 text-xs gap-1 shrink-0"
                  data-testid="liquid-test-encrypt-btn"
                >
                  <ArrowRight className="size-3" />
                  <FormattedMessage id="simulators.common.load" defaultMessage="Cargar" />
                </Button>
              </div>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
