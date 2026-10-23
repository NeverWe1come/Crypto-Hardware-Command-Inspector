/**
 * @packageDocumentation
 * Unified HSM Simulators Dropdown Control Hub (`@chci/explorer`).
 * Groups all 4 hardware simulators (Atalla, Thales, Futurex, LiquidSecurity),
 * provides live multi-port status, batch "Start All / Stop All" actions,
 * direct console access, and runtime installation triggers.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
import {
  type SimulatorInventoryItem,
  getSimulatorsInventory,
  startAllInstalledSimulators,
  stopAllSimulators,
} from '../services/simulators-hub-client';
import { startAtallaSimulator, stopAtallaSimulator } from '../services/simulator-client';
import { startThalesSimulator, stopThalesSimulator } from '../services/thales-simulator-client';
import { startFuturexSimulator, stopFuturexSimulator } from '../services/futurex-simulator-client';
import { startLiquidSecuritySimulator, stopLiquidSecuritySimulator } from '../services/liquidsecurity-simulator-client';
import { SimulatorInstallModal } from './SimulatorInstallModal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Server,
  Play,
  Square,
  Terminal,
  DownloadCloud,
  ChevronDown,
  Cpu,
  Layers,
  Shield,
  Loader2,
} from 'lucide-react';

export interface SimulatorsDropdownProps {
  readonly onOpenAtallaConsole: (autoStart?: boolean) => void;
  readonly onOpenThalesConsole: (autoStart?: boolean) => void;
  readonly onOpenFuturexConsole: (autoStart?: boolean) => void;
  readonly onOpenLiquidConsole: (autoStart?: boolean) => void;
}

export const SimulatorsDropdown: React.FC<SimulatorsDropdownProps> = ({
  onOpenAtallaConsole,
  onOpenThalesConsole,
  onOpenFuturexConsole,
  onOpenLiquidConsole,
}) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inventory, setInventory] = useState<SimulatorInventoryItem[]>([]);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [installTarget, setInstallTarget] = useState<SimulatorInventoryItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchInventory = async () => {
    try {
      const items = await getSimulatorsInventory();
      setInventory(items);
    } catch {
      // Keep previous inventory on failure
    }
  };

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 3500);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const runningCount = inventory.filter((s) => s.running).length;
  const installedCount = inventory.filter((s) => s.installed).length;
  const anyRunning = runningCount > 0;

  const handleStartAll = async () => {
    setLoadingAction(true);
    try {
      const updated = await startAllInstalledSimulators();
      setInventory(updated);
      toast.success(
        intl.formatMessage(
          {
            id: 'simulators.hub.startAllSuccess',
            defaultMessage: 'Todos los simuladores instalados han sido iniciados.',
          }
        )
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Error iniciando los simuladores'
      );
    } finally {
      setLoadingAction(false);
      fetchInventory();
    }
  };

  const handleStopAll = async () => {
    setLoadingAction(true);
    try {
      const updated = await stopAllSimulators();
      setInventory(updated);
      toast.info(
        intl.formatMessage({
          id: 'simulators.hub.stopAllSuccess',
          defaultMessage: 'Todos los simuladores han sido detenidos.',
        })
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Error deteniendo los simuladores'
      );
    } finally {
      setLoadingAction(false);
      fetchInventory();
    }
  };

  const handleToggleSingle = async (sim: SimulatorInventoryItem) => {
    try {
      if (sim.running) {
        if (sim.id === 'atalla-at1000') await stopAtallaSimulator();
        else if (sim.id === 'thales-payshield') await stopThalesSimulator();
        else if (sim.id === 'futurex-excrypt') await stopFuturexSimulator();
        else if (sim.id === 'marvell-liquidsecurity') await stopLiquidSecuritySimulator();
      } else {
        if (sim.id === 'atalla-at1000') await startAtallaSimulator(undefined, sim.defaultPort);
        else if (sim.id === 'thales-payshield') await startThalesSimulator(sim.defaultPort);
        else if (sim.id === 'futurex-excrypt') await startFuturexSimulator(sim.defaultPort);
        else if (sim.id === 'marvell-liquidsecurity') await startLiquidSecuritySimulator(sim.defaultPort);
      }
      fetchInventory();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Error al cambiar estado del simulador'
      );
    }
  };

  const handleOpenConsole = (simId: string, autoStart: boolean = false) => {
    setIsOpen(false);
    if (simId === 'atalla-at1000') onOpenAtallaConsole(autoStart);
    else if (simId === 'thales-payshield') onOpenThalesConsole(autoStart);
    else if (simId === 'futurex-excrypt') onOpenFuturexConsole(autoStart);
    else if (simId === 'marvell-liquidsecurity') onOpenLiquidConsole(autoStart);
  };

  const getSimIcon = (id: string) => {
    switch (id) {
      case 'atalla-at1000':
        return <Server className="size-4 text-sky-400" />;
      case 'thales-payshield':
        return <Shield className="size-4 text-blue-400" />;
      case 'futurex-excrypt':
        return <Layers className="size-4 text-emerald-400" />;
      case 'marvell-liquidsecurity':
        return <Cpu className="size-4 text-indigo-400" />;
      default:
        return <Server className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Main header trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border hover:bg-secondary font-medium"
        data-testid="simulators-hub-button"
        aria-expanded={isOpen}
      >
        <Server className="size-3.5 text-sky-400" />
        <span className="hidden md:inline">
          <FormattedMessage id="simulators.hub.title" defaultMessage="Simuladores HSM" />
        </span>
        <Badge
          variant="outline"
          className={`h-4.5 px-1.5 text-[10px] font-mono gap-1 border-border/80 ${
            anyRunning
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-muted text-muted-foreground'
          }`}
          data-testid="simulators-active-badge"
        >
          <span
            className={`size-1.5 rounded-full ${
              anyRunning ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground'
            }`}
          />
          {runningCount}/4
        </Badge>
        <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
      </Button>

      {/* Popover content */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-84 sm:w-96 rounded-xl bg-card border border-border shadow-2xl z-50 p-3 space-y-3"
          data-testid="simulators-hub-popover"
        >
          {/* Header of popover */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">
                <FormattedMessage
                  id="simulators.hub.header"
                  defaultMessage="Centro de Simuladores HSM"
                />
              </span>
              <span className="text-[10px] text-muted-foreground">
                <FormattedMessage
                  id="simulators.hub.installedCount"
                  defaultMessage="{active} activos de {installed} instalados"
                  values={{ active: runningCount, installed: installedCount }}
                />
              </span>
            </div>

            {/* Master Start All / Stop All Action */}
            <div className="flex items-center gap-1.5">
              {anyRunning ? (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={loadingAction}
                  onClick={handleStopAll}
                  className="h-7 text-[11px] gap-1 px-2.5 font-medium"
                  data-testid="stop-all-simulators-btn"
                >
                  {loadingAction ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Square className="size-3 fill-current" />
                  )}
                  <FormattedMessage id="simulators.hub.stopAll" defaultMessage="Detener Todos" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  disabled={loadingAction || installedCount === 0}
                  onClick={handleStartAll}
                  className="h-7 text-[11px] gap-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  data-testid="start-all-simulators-btn"
                >
                  {loadingAction ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Play className="size-3 fill-current" />
                  )}
                  <FormattedMessage id="simulators.hub.startAll" defaultMessage="Activar Todos" />
                </Button>
              )}
            </div>
          </div>

          {/* List of 4 hardware simulators */}
          <div className="space-y-1.5">
            {inventory.map((sim) => (
              <div
                key={sim.id}
                className="p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/40 transition-colors flex items-center justify-between gap-2"
                data-testid={`sim-row-${sim.id}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-md bg-background/80 border border-border/50 shrink-0">
                    {getSimIcon(sim.id)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-foreground truncate">
                      {sim.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      TCP :{sim.defaultPort}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {sim.installed ? (
                    <>
                      {sim.running ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleSingle(sim)}
                          className="h-7 px-2 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1"
                          title="Detener este simulador"
                          data-testid={`toggle-sim-${sim.id}`}
                        >
                          <Square className="size-3 fill-current" />
                          <span className="hidden sm:inline">Detener</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenConsole(sim.id, true)}
                          className="h-7 px-2 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1"
                          title="Iniciar este simulador y ver despliegue"
                          data-testid={`toggle-sim-${sim.id}`}
                        >
                          <Play className="size-3 fill-current" />
                          <span className="hidden sm:inline">Iniciar</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenConsole(sim.id)}
                        className="h-7 px-2 text-[10px] border-border/60 hover:bg-secondary gap-1"
                        title="Abrir consola de diagnóstico"
                        data-testid={`console-sim-${sim.id}`}
                      >
                        <Terminal className="size-3 text-muted-foreground" />
                        <span className="hidden sm:inline">Consola</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        setInstallTarget(sim);
                      }}
                      className="h-7 px-2.5 text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 gap-1 font-medium"
                      data-testid={`install-sim-${sim.id}`}
                    >
                      <DownloadCloud className="size-3" />
                      <FormattedMessage id="simulators.hub.install" defaultMessage="Instalar" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Runtime Installer Modal */}
      {installTarget && (
        <SimulatorInstallModal
          open={!!installTarget}
          onOpenChange={(open) => {
            if (!open) setInstallTarget(null);
          }}
          simulator={installTarget}
          onInstalled={() => {
            fetchInventory();
          }}
          onStartSimulator={(simId) => {
            setInstallTarget(null);
            handleOpenConsole(simId, true);
          }}
        />
      )}
    </div>
  );
};
