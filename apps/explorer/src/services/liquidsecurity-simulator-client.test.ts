import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getLiquidSecuritySimulatorStatus,
  startLiquidSecuritySimulator,
  stopLiquidSecuritySimulator,
} from './liquidsecurity-simulator-client';

describe('LiquidSecurity Simulator Client Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  afterEach(() => {
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  it('returns fallback offline status when outside Tauri desktop environment', async () => {
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;

    const status = await getLiquidSecuritySimulatorStatus();
    expect(status.running).toBe(false);
    expect(status.port).toBe(2225);
    expect(status.firmwareVersion).toBe('3.4.0');
    expect(status.activePartitions).toBe(2);
    expect(status.errorMessage).toContain('CHCI');
  });

  it('throws helpful error on startLiquidSecuritySimulator when outside Tauri environment', async () => {
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;

    await expect(startLiquidSecuritySimulator()).rejects.toThrow('CHCI');
  });

  it('invokes Tauri command get_liquidsecurity_simulator_status when in desktop mode', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      running: true,
      port: 2225,
      tcpReachable: true,
      firmwareVersion: '3.4.0',
      activePartitions: 3,
      processedCommands: 15,
      uptimeSeconds: 120,
      errorMessage: null,
    });

    (window as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    const status = await getLiquidSecuritySimulatorStatus();
    expect(mockInvoke).toHaveBeenCalledWith('get_liquidsecurity_simulator_status');
    expect(status.running).toBe(true);
    expect(status.port).toBe(2225);
    expect(status.activePartitions).toBe(3);
  });

  it('invokes start_liquidsecurity_simulator with custom port in Tauri desktop mode', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      running: true,
      port: 2226,
      tcpReachable: true,
      firmwareVersion: '3.4.0',
      activePartitions: 2,
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: null,
    });

    (window as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    const status = await startLiquidSecuritySimulator(2226);
    expect(mockInvoke).toHaveBeenCalledWith('start_liquidsecurity_simulator', { port: 2226 });
    expect(status.port).toBe(2226);
    expect(status.running).toBe(true);
  });

  it('invokes stop_liquidsecurity_simulator in Tauri desktop mode', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      running: false,
      port: 2225,
      tcpReachable: false,
      firmwareVersion: '3.4.0',
      activePartitions: 2,
      processedCommands: 15,
      uptimeSeconds: 0,
      errorMessage: null,
    });

    (window as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    const status = await stopLiquidSecuritySimulator();
    expect(mockInvoke).toHaveBeenCalledWith('stop_liquidsecurity_simulator');
    expect(status.running).toBe(false);
  });
});
