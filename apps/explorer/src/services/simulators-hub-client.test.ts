import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSimulatorsInventory,
  startAllInstalledSimulators,
  stopAllSimulators,
  installSimulatorFromFile,
} from './simulators-hub-client';

describe('Simulators Hub Client Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  afterEach(() => {
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  it('returns default fallback inventory when outside Tauri desktop environment', async () => {
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;

    const inventory = await getSimulatorsInventory();
    expect(inventory.length).toBe(4);
    expect(inventory.map((s) => s.id)).toEqual([
      'atalla-at1000',
      'thales-payshield',
      'futurex-excrypt',
      'marvell-liquidsecurity',
    ]);
    expect(inventory.find((s) => s.id === 'atalla-at1000')?.defaultPort).toBe(7000);
    expect(inventory.find((s) => s.id === 'thales-payshield')?.defaultPort).toBe(1500);
    expect(inventory.find((s) => s.id === 'futurex-excrypt')?.defaultPort).toBe(9000);
    expect(inventory.find((s) => s.id === 'marvell-liquidsecurity')?.defaultPort).toBe(2225);
  });

  it('invokes get_simulators_inventory command in Tauri desktop environment', async () => {
    const mockInventory = [
      {
        id: 'atalla-at1000',
        name: 'Utimaco Atalla AT1000',
        vendor: 'Utimaco',
        defaultPort: 7000,
        installed: true,
        running: false,
        approxSizeMb: 848,
      },
    ];

    const mockInvoke = vi.fn().mockResolvedValue(mockInventory);
    (window as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    const result = await getSimulatorsInventory();
    expect(mockInvoke).toHaveBeenCalledWith('get_simulators_inventory');
    expect(result).toEqual(mockInventory);
  });

  it('invokes start_all_installed_simulators command in Tauri desktop environment', async () => {
    const mockInvoke = vi.fn().mockResolvedValue([]);
    (window as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    await startAllInstalledSimulators();
    expect(mockInvoke).toHaveBeenCalledWith('start_all_installed_simulators');
  });

  it('invokes stop_all_simulators command in Tauri desktop environment', async () => {
    const mockInvoke = vi.fn().mockResolvedValue([]);
    (window as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    await stopAllSimulators();
    expect(mockInvoke).toHaveBeenCalledWith('stop_all_simulators');
  });

  it('invokes install_simulator_from_file with arguments in Tauri desktop environment', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      success: true,
      message: 'Installed',
      installPath: '/opt/simulators/futurex',
    });
    (window as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    const res = await installSimulatorFromFile('futurex-excrypt', '/tmp/futurex.zip');
    expect(mockInvoke).toHaveBeenCalledWith('install_simulator_from_file', {
      simId: 'futurex-excrypt',
      filePath: '/tmp/futurex.zip',
    });
    expect(res.success).toBe(true);
  });

  it('handles fallback in installSimulatorFromFile when not in Tauri environment', async () => {
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;

    const res = await installSimulatorFromFile('atalla-at1000', '/tmp/test.tar');
    expect(res.success).toBe(true);
    expect(res.message).toContain('demostración');
  });
});
