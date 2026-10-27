/**
 * @packageDocumentation
 * Service client for managing the Utimaco Atalla AT1000 local Docker simulator.
 * Communicates with the Tauri Rust backend to inspect, start, stop, and query the container.
 */

export interface SimulatorStatus {
  readonly dockerAvailable: boolean;
  readonly dockerVersion?: string;
  readonly imageLoaded: boolean;
  readonly containerRunning: boolean;
  readonly containerId?: string;
  readonly port: number;
  readonly tcpReachable: boolean;
  readonly errorMessage?: string;
}

interface TauriInternals {
  invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
}

function getTauriInvoke(): (<T>(cmd: string, args?: Record<string, unknown>) => Promise<T>) | null {
  if (typeof window !== 'undefined') {
    const tauriWindow = window as unknown as { __TAURI_INTERNALS__?: TauriInternals };
    if (tauriWindow.__TAURI_INTERNALS__?.invoke) {
      return tauriWindow.__TAURI_INTERNALS__.invoke;
    }
  }
  return null;
}

/**
 * Retrieves the current status of the local Atalla AT1000 simulator.
 */
export async function getAtallaSimulatorStatus(): Promise<SimulatorStatus> {
  const invoke = getTauriInvoke();
  if (invoke) {
    try {
      return await invoke<SimulatorStatus>('get_atalla_simulator_status');
    } catch (e) {
      return {
        dockerAvailable: false,
        imageLoaded: false,
        containerRunning: false,
        port: 7000,
        tcpReachable: false,
        errorMessage: e instanceof Error ? e.message : String(e)
      };
    }
  }

  // Fallback for web sandbox / dev mode without Tauri
  return {
    dockerAvailable: false,
    imageLoaded: false,
    containerRunning: false,
    port: 7000,
    tcpReachable: false,
    errorMessage: 'Modo web: El simulador Docker de Atalla requiere ejecutar la aplicación de escritorio nativa.'
  };
}

/**
 * Starts the Atalla AT1000 simulator container, loading the image if needed and waiting for TCP port 7000.
 *
 * @param tarPath - Optional path to the `utimaco_atalla_simulator_8.56.tar` file.
 * @param port - Optional port number (defaults to 7000).
 */
export async function startAtallaSimulator(
  tarPath?: string,
  port?: number
): Promise<SimulatorStatus> {
  const invoke = getTauriInvoke();
  if (invoke) {
    return await invoke<SimulatorStatus>('start_atalla_simulator', {
      tarPath: tarPath || null,
      port: port || null
    });
  }

  throw new Error('El simulador requiere ejecutar la aplicación de escritorio nativa.');
}

/**
 * Stops and removes the local Atalla simulator container.
 */
export async function stopAtallaSimulator(): Promise<SimulatorStatus> {
  const invoke = getTauriInvoke();
  if (invoke) {
    return await invoke<SimulatorStatus>('stop_atalla_simulator');
  }

  throw new Error('El simulador requiere ejecutar la aplicación de escritorio nativa.');
}

/**
 * Retrieves recent logs from the Atalla simulator container.
 *
 * @param tail - Number of recent log lines to retrieve (default: 100).
 */
export async function getAtallaSimulatorLogs(tail?: number): Promise<string> {
  const invoke = getTauriInvoke();
  if (invoke) {
    return await invoke<string>('get_atalla_simulator_logs', {
      tail: tail || 100
    });
  }

  return 'Modo web: Sin acceso a logs de Docker.';
}
