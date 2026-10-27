import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getFuturexSimulatorStatus,
  startFuturexSimulator,
  stopFuturexSimulator,
} from '../futurex-simulator-client';

describe('futurex-simulator-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // @ts-expect-error test cleanup
    delete window.__TAURI_INTERNALS__;
  });

  describe('Non-Tauri environment (Web Sandbox)', () => {
    it('returns offline mock status in browser mode', async () => {
      const status = await getFuturexSimulatorStatus();
      expect(status.running).toBe(false);
      expect(status.port).toBe(9000);
      expect(status.tcpReachable).toBe(false);
      expect(status.errorMessage).toContain('El simulador nativo requiere ejecutar la aplicación de escritorio CHCI');
    });

    it('rejects startFuturexSimulator with helpful error in browser mode', async () => {
      await expect(startFuturexSimulator()).rejects.toThrow(
        'El simulador nativo requiere ejecutar la aplicación de escritorio CHCI'
      );
    });

    it('handles stopFuturexSimulator safely as a no-op in browser mode', async () => {
      const status = await stopFuturexSimulator();
      expect(status.running).toBe(false);
    });
  });

  describe('Tauri environment', () => {
    it('invokes get_futurex_simulator_status properly', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        running: true,
        port: 9000,
        tcpReachable: true,
        activeMfkKcv: '08D7B4',
        processedCommands: 8,
        uptimeSeconds: 30,
        errorMessage: null,
      });

      // @ts-expect-error mock tauri
      window.__TAURI_INTERNALS__ = { invoke: mockInvoke };

      const status = await getFuturexSimulatorStatus();
      expect(mockInvoke).toHaveBeenCalledWith('get_futurex_simulator_status');
      expect(status.running).toBe(true);
      expect(status.processedCommands).toBe(8);
    });

    it('invokes start_futurex_simulator with custom port', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        running: true,
        port: 9005,
        tcpReachable: true,
        activeMfkKcv: '08D7B4',
        processedCommands: 0,
        uptimeSeconds: 0,
        errorMessage: null,
      });

      // @ts-expect-error mock tauri
      window.__TAURI_INTERNALS__ = { invoke: mockInvoke };

      const status = await startFuturexSimulator(9005);
      expect(mockInvoke).toHaveBeenCalledWith('start_futurex_simulator', { port: 9005 });
      expect(status.running).toBe(true);
      expect(status.port).toBe(9005);
    });

    it('invokes stop_futurex_simulator properly', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        running: false,
        port: 9000,
        tcpReachable: false,
        activeMfkKcv: '08D7B4',
        processedCommands: 8,
        uptimeSeconds: 0,
        errorMessage: null,
      });

      // @ts-expect-error mock tauri
      window.__TAURI_INTERNALS__ = { invoke: mockInvoke };

      const status = await stopFuturexSimulator();
      expect(mockInvoke).toHaveBeenCalledWith('stop_futurex_simulator');
      expect(status.running).toBe(false);
    });
  });
});
