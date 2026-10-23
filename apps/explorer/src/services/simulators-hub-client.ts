/**
 * @packageDocumentation
 * Unified HSM Simulators Hub Service Client (`@chci/explorer`).
 * Manages inventory detection, batch start/stop orchestration, and runtime installation.
 */

export interface SimulatorInventoryItem {
  id: string;
  name: string;
  vendor: string;
  defaultPort: number;
  installed: boolean;
  running: boolean;
  installPath?: string | null;
  defaultDownloadUrl?: string | null;
  approxSizeMb: number;
}

export interface InstallResult {
  success: boolean;
  message: string;
  installPath?: string | null;
}

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

const DEFAULT_INVENTORY_FALLBACK: SimulatorInventoryItem[] = [
  {
    id: 'atalla-at1000',
    name: 'Utimaco Atalla AT1000',
    vendor: 'Utimaco',
    defaultPort: 7000,
    installed: false,
    running: false,
    approxSizeMb: 848,
    defaultDownloadUrl: 'https://github.com/ramp1953/CryptoCommandExplorer/releases/download/v1.0.0/atalla-at1000.tar',
  },
  {
    id: 'thales-payshield',
    name: 'Thales payShield 10K',
    vendor: 'Thales',
    defaultPort: 1500,
    installed: true,
    running: false,
    approxSizeMb: 5,
    defaultDownloadUrl: 'https://github.com/ramp1953/CryptoCommandExplorer/releases/download/v1.0.0/thales-payshield.zip',
  },
  {
    id: 'futurex-excrypt',
    name: 'Futurex Excrypt Plus',
    vendor: 'Futurex',
    defaultPort: 9000,
    installed: true,
    running: false,
    approxSizeMb: 5,
    defaultDownloadUrl: 'https://github.com/ramp1953/CryptoCommandExplorer/releases/download/v1.0.0/futurex-excrypt.zip',
  },
  {
    id: 'marvell-liquidsecurity',
    name: 'Marvell LiquidSecurity HSM',
    vendor: 'Marvell',
    defaultPort: 2225,
    installed: true,
    running: false,
    approxSizeMb: 5,
    defaultDownloadUrl: 'https://github.com/ramp1953/CryptoCommandExplorer/releases/download/v1.0.0/marvell-liquidsecurity.zip',
  },
];

/**
 * Retrieves the complete inventory of hardware simulators and their installation status.
 */
export async function getSimulatorsInventory(): Promise<SimulatorInventoryItem[]> {
  if (!isTauriEnvironment()) {
    return DEFAULT_INVENTORY_FALLBACK;
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke('get_simulators_inventory')) as SimulatorInventoryItem[];
}

/**
 * Starts all installed hardware simulators concurrently.
 */
export async function startAllInstalledSimulators(): Promise<SimulatorInventoryItem[]> {
  if (!isTauriEnvironment()) {
    return DEFAULT_INVENTORY_FALLBACK.map((s) => (s.installed ? { ...s, running: true } : s));
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke('start_all_installed_simulators')) as SimulatorInventoryItem[];
}

/**
 * Stops all currently running simulators concurrently.
 */
export async function stopAllSimulators(): Promise<SimulatorInventoryItem[]> {
  if (!isTauriEnvironment()) {
    return DEFAULT_INVENTORY_FALLBACK.map((s) => ({ ...s, running: false }));
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke('stop_all_simulators')) as SimulatorInventoryItem[];
}

/**
 * Installs a simulator from a local archive (.zip, .tar, .tar.gz, .exe)
 */
export async function installSimulatorFromFile(simId: string, filePath: string): Promise<InstallResult> {
  if (!isTauriEnvironment()) {
    return {
      success: true,
      message: `Simulador '${simId}' instalado en modo demostración.`,
      installPath: `/simulators/${simId}`,
    };
  }

  const win = window as TauriWindow;
  return (await win.__TAURI_INTERNALS__!.invoke('install_simulator_from_file', {
    simId,
    filePath,
  })) as InstallResult;
}
