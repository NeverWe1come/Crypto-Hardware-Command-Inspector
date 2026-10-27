/**
 * @packageDocumentation
 * Service client for the native Thales payShield 10K HSM Simulator.
 * Provides typed methods to inspect, start and stop the local simulator.
 */

export interface ThalesSimulatorStatus {
  running: boolean;
  port: number;
  tcpReachable: boolean;
  activeLmkKcv: string;
  processedCommands: number;
  uptimeSeconds: number;
  errorMessage?: string | null;
}

const DEFAULT_PORT = 1500;

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
 * Retrieves the status of the native Thales payShield 10K simulator.
 */
export async function getThalesSimulatorStatus(): Promise<ThalesSimulatorStatus> {
  if (!isTauriEnvironment()) {
    return {
      running: false,
      port: DEFAULT_PORT,
      tcpReachable: false,
      activeLmkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: 'El simulador nativo requiere ejecutar la aplicación de escritorio CHCI.',
    };
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke(
    'get_thales_simulator_status'
  )) as ThalesSimulatorStatus;
}

/**
 * Starts the native Thales payShield 10K simulator on the specified port.
 */
export async function startThalesSimulator(port: number = DEFAULT_PORT): Promise<ThalesSimulatorStatus> {
  if (!isTauriEnvironment()) {
    throw new Error('El simulador nativo requiere ejecutar la aplicación de escritorio CHCI.');
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke('start_thales_simulator', {
    port,
  })) as ThalesSimulatorStatus;
}

/**
 * Stops the native Thales payShield 10K simulator.
 */
export async function stopThalesSimulator(): Promise<ThalesSimulatorStatus> {
  if (!isTauriEnvironment()) {
    return {
      running: false,
      port: DEFAULT_PORT,
      tcpReachable: false,
      activeLmkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: null,
    };
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke(
    'stop_thales_simulator'
  )) as ThalesSimulatorStatus;
}
