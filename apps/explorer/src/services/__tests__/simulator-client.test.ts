/**
 * @packageDocumentation
 * Unit tests for Atalla simulator client service (`@chci/explorer`).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAtallaSimulatorStatus,
  startAtallaSimulator,
  stopAtallaSimulator,
  getAtallaSimulatorLogs
} from '../simulator-client';

describe('simulator-client service', () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe('without Tauri internals (Web sandbox fallback)', () => {
    beforeEach(() => {
      // Mock window without __TAURI_INTERNALS__
      global.window = {} as unknown as Window & typeof globalThis;
    });

    it('returns web fallback status indicating desktop app is required', async () => {
      const status = await getAtallaSimulatorStatus();
      expect(status.dockerAvailable).toBe(false);
      expect(status.containerRunning).toBe(false);
      expect(status.port).toBe(7000);
      expect(status.errorMessage).toContain('Modo web');
    });

    it('throws error when attempting to start simulator in web mode', async () => {
      await expect(startAtallaSimulator()).rejects.toThrow(
        'El simulador requiere ejecutar la aplicación de escritorio nativa.'
      );
    });

    it('throws error when attempting to stop simulator in web mode', async () => {
      await expect(stopAtallaSimulator()).rejects.toThrow(
        'El simulador requiere ejecutar la aplicación de escritorio nativa.'
      );
    });

    it('returns web message when querying logs in web mode', async () => {
      const logs = await getAtallaSimulatorLogs();
      expect(logs).toContain('Modo web');
    });
  });

  describe('with Tauri internals (Desktop environment)', () => {
    const mockInvoke = vi.fn();

    beforeEach(() => {
      mockInvoke.mockReset();
      global.window = {
        __TAURI_INTERNALS__: {
          invoke: mockInvoke
        }
      } as unknown as Window & typeof globalThis;
    });

    it('successfully retrieves simulator status from Tauri backend', async () => {
      mockInvoke.mockResolvedValueOnce({
        dockerAvailable: true,
        dockerVersion: '29.6.2',
        imageLoaded: true,
        containerRunning: true,
        containerId: 'test_container_123',
        port: 7000,
        tcpReachable: true
      });

      const status = await getAtallaSimulatorStatus();
      expect(mockInvoke).toHaveBeenCalledWith('get_atalla_simulator_status');
      expect(status.dockerAvailable).toBe(true);
      expect(status.containerRunning).toBe(true);
      expect(status.containerId).toBe('test_container_123');
    });

    it('handles backend failure when retrieving status', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Daemon not responding'));

      const status = await getAtallaSimulatorStatus();
      expect(status.dockerAvailable).toBe(false);
      expect(status.errorMessage).toContain('Daemon not responding');
    });

    it('successfully starts simulator container with custom path and port', async () => {
      mockInvoke.mockResolvedValueOnce({
        dockerAvailable: true,
        imageLoaded: true,
        containerRunning: true,
        port: 7000,
        tcpReachable: true
      });

      const status = await startAtallaSimulator('/custom/path.tar', 7000);
      expect(mockInvoke).toHaveBeenCalledWith('start_atalla_simulator', {
        tarPath: '/custom/path.tar',
        port: 7000
      });
      expect(status.containerRunning).toBe(true);
    });

    it('successfully stops simulator container', async () => {
      mockInvoke.mockResolvedValueOnce({
        dockerAvailable: true,
        imageLoaded: true,
        containerRunning: false,
        port: 7000,
        tcpReachable: false
      });

      const status = await stopAtallaSimulator();
      expect(mockInvoke).toHaveBeenCalledWith('stop_atalla_simulator');
      expect(status.containerRunning).toBe(false);
    });

    it('successfully retrieves container logs', async () => {
      mockInvoke.mockResolvedValueOnce('Atalla AT1000 Simulator initialized.\nListening on port 7000.\n');

      const logs = await getAtallaSimulatorLogs(50);
      expect(mockInvoke).toHaveBeenCalledWith('get_atalla_simulator_logs', { tail: 50 });
      expect(logs).toContain('Listening on port 7000.');
    });
  });
});
