import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getThalesSimulatorStatus,
  startThalesSimulator,
  stopThalesSimulator,
} from '../thales-simulator-client';

describe('thales-simulator-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // @ts-expect-error test cleanup
    delete window.__TAURI_INTERNALS__;
  });

  describe('Non-Tauri environment (Web Sandbox)', () => {
    it('returns offline mock status in browser mode', async () => {
      const status = await getThalesSimulatorStatus();
      expect(status.running).toBe(false);
      expect(status.port).toBe(1500);
      expect(status.tcpReachable).toBe(false);
      expect(status.errorMessage).toContain('El simulador nativo requiere ejecutar la aplicación de escritorio CHCI');
    });

    it('rejects startThalesSimulator with helpful error in browser mode', async () => {
      await expect(startThalesSimulator()).rejects.toThrow(
        'El simulador nativo requiere ejecutar la aplicación de escritorio CHCI'
      );
    });

    it('handles stopThalesSimulator safely as a no-op in browser mode', async () => {
      const status = await stopThalesSimulator();
      expect(status.running).toBe(false);
    });
  });

  describe('Tauri environment', () => {
    it('invokes get_thales_simulator_status properly', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        running: true,
        port: 1500,
        tcpReachable: true,
        activeLmkKcv: '08D7B4',
        processedCommands: 12,
        uptimeSeconds: 45,
        errorMessage: null,
      });

      // @ts-expect-error mock tauri
      window.__TAURI_INTERNALS__ = { invoke: mockInvoke };

      const status = await getThalesSimulatorStatus();
      expect(mockInvoke).toHaveBeenCalledWith('get_thales_simulator_status');
      expect(status.running).toBe(true);
      expect(status.processedCommands).toBe(12);
    });

    it('invokes start_thales_simulator with custom port', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        running: true,
        port: 1501,
        tcpReachable: true,
        activeLmkKcv: '08D7B4',
        processedCommands: 0,
        uptimeSeconds: 0,
        errorMessage: null,
      });

      // @ts-expect-error mock tauri
      window.__TAURI_INTERNALS__ = { invoke: mockInvoke };

      const status = await startThalesSimulator(1501);
      expect(mockInvoke).toHaveBeenCalledWith('start_thales_simulator', { port: 1501 });
      expect(status.running).toBe(true);
      expect(status.port).toBe(1501);
    });

    it('invokes stop_thales_simulator properly', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        running: false,
        port: 1500,
        tcpReachable: false,
        activeLmkKcv: '08D7B4',
        processedCommands: 12,
        uptimeSeconds: 0,
        errorMessage: null,
      });

      // @ts-expect-error mock tauri
      window.__TAURI_INTERNALS__ = { invoke: mockInvoke };

      const status = await stopThalesSimulator();
      expect(mockInvoke).toHaveBeenCalledWith('stop_thales_simulator');
      expect(status.running).toBe(false);
    });
  });
});
