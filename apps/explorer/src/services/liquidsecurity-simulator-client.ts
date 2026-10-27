/**
 * @packageDocumentation
 * Service client for the native Marvell LiquidSecurity HSM Simulator.
 * Provides typed methods to inspect, start and stop the local simulator.
 */

export interface LiquidSecuritySimulatorStatus {
  running: boolean;
  port: number;
  tcpReachable: boolean;
  firmwareVersion: string;
  activePartitions: number;
  processedCommands: number;
  uptimeSeconds: number;
  errorMessage?: string | null;
}

const DEFAULT_PORT = 2225;

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
 * Retrieves the status of the native Marvell LiquidSecurity simulator.
 */
export async function getLiquidSecuritySimulatorStatus(): Promise<LiquidSecuritySimulatorStatus> {
  if (!isTauriEnvironment()) {
    return {
      running: false,
      port: DEFAULT_PORT,
      tcpReachable: false,
      firmwareVersion: '3.4.0',
      activePartitions: 2,
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: 'El simulador nativo requiere ejecutar la aplicación de escritorio CHCI.',
    };
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke(
    'get_liquidsecurity_simulator_status'
  )) as LiquidSecuritySimulatorStatus;
}

/**
 * Starts the native Marvell LiquidSecurity simulator on the specified port.
 */
export async function startLiquidSecuritySimulator(port: number = DEFAULT_PORT): Promise<LiquidSecuritySimulatorStatus> {
  if (!isTauriEnvironment()) {
    throw new Error('El simulador nativo requiere ejecutar la aplicación de escritorio CHCI.');
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke('start_liquidsecurity_simulator', {
    port,
  })) as LiquidSecuritySimulatorStatus;
}

/**
 * Stops the native Marvell LiquidSecurity simulator.
 */
export async function stopLiquidSecuritySimulator(): Promise<LiquidSecuritySimulatorStatus> {
  if (!isTauriEnvironment()) {
    return {
      running: false,
      port: DEFAULT_PORT,
      tcpReachable: false,
      firmwareVersion: '3.4.0',
      activePartitions: 2,
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: null,
    };
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke(
    'stop_liquidsecurity_simulator'
  )) as LiquidSecuritySimulatorStatus;
}
