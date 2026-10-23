/**
 * @packageDocumentation
 * Service client for the native Futurex Excrypt HSM Simulator.
 * Provides typed methods to inspect, start and stop the local simulator.
 */

export interface FuturexSimulatorStatus {
  running: boolean;
  port: number;
  tcpReachable: boolean;
  activeMfkKcv: string;
  processedCommands: number;
  uptimeSeconds: number;
  errorMessage?: string | null;
}

const DEFAULT_PORT = 9000;

interface TauriWindow extends Window {
  __TAURI_INTERNALS__?: {
    invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
  };
}

function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as TauriWindow;
  return typeof win.__TAURI_INTERNALS__?.invoke === 'function';
}

/**
 * Retrieves the status of the native Futurex Excrypt simulator.
 */
export async function getFuturexSimulatorStatus(): Promise<FuturexSimulatorStatus> {
  if (!isTauriEnvironment()) {
    return {
      running: false,
      port: DEFAULT_PORT,
      tcpReachable: false,
      activeMfkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: 'El simulador nativo requiere ejecutar la aplicación de escritorio CHCI.',
    };
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke(
    'get_futurex_simulator_status'
  )) as FuturexSimulatorStatus;
}

/**
 * Starts the native Futurex Excrypt simulator on the specified port.
 */
export async function startFuturexSimulator(port: number = DEFAULT_PORT): Promise<FuturexSimulatorStatus> {
  if (!isTauriEnvironment()) {
    throw new Error('El simulador nativo requiere ejecutar la aplicación de escritorio CHCI.');
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke('start_futurex_simulator', {
    port,
  })) as FuturexSimulatorStatus;
}

/**
 * Stops the native Futurex Excrypt simulator.
 */
export async function stopFuturexSimulator(): Promise<FuturexSimulatorStatus> {
  if (!isTauriEnvironment()) {
    return {
      running: false,
      port: DEFAULT_PORT,
      tcpReachable: false,
      activeMfkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: null,
    };
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke(
    'stop_futurex_simulator'
  )) as FuturexSimulatorStatus;
}
