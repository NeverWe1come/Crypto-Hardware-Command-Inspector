/**
 * @packageDocumentation
 * Component integration tests for AtallaSimulatorModal (`@chci/explorer`).
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AtallaSimulatorModal } from '../AtallaSimulatorModal';
import { WorkspaceProvider } from '../../state/workspace-context';
import type { WorkspaceState } from '../../state/types';
import * as simulatorClient from '../../services/simulator-client';
import * as hardwareClient from '../../services/hardware-client';

describe('AtallaSimulatorModal Component', () => {
  const mockState: WorkspaceState = {
    locale: 'es',
    theme: 'dark',
    activeTabId: 'tab_atalla',
    tabs: [
      {
        id: 'tab_atalla',
        deviceId: 'utimaco-atalla-at1000',
        version: '8.60',
        commands: [
          {
            id: 'cmd_1',
            raw: '<00#TEST#>',
            version: '8.60',
            direction: 'request',
            linkedCommandId: null
          }
        ],
        activeCommandId: 'cmd_1'
      }
    ],
    catalogSearchQuery: '',
    selectedCategory: 'ALL',
    hardwareConnections: []
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function renderModal(props: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    onLoadCommand?: (raw: string) => void;
    initialState?: Partial<WorkspaceState>;
  }) {
    return {
      user: userEvent.setup(),
      ...render(
        <WorkspaceProvider initialState={props.initialState ?? mockState}>
          <AtallaSimulatorModal
            open={props.open}
            onOpenChange={props.onOpenChange ?? vi.fn()}
            onLoadCommand={props.onLoadCommand}
          />
        </WorkspaceProvider>
      )
    };
  }

  it('renders title and offline warning when Docker is not available', async () => {
    vi.spyOn(simulatorClient, 'getAtallaSimulatorStatus').mockResolvedValueOnce({
      dockerAvailable: false,
      imageLoaded: false,
      containerRunning: false,
      port: 7000,
      tcpReachable: false,
      errorMessage: 'Docker daemon is not running'
    });
    vi.spyOn(simulatorClient, 'getAtallaSimulatorLogs').mockResolvedValueOnce('');

    renderModal({ open: true });

    expect(await screen.findByText('Simulador Utimaco Atalla AT1000')).toBeInTheDocument();
    const badge = await screen.findByTestId('simulator-status-badge');
    expect(badge).toHaveTextContent(/Docker Apagado \/ No disponible|Docker Offline/i);
    expect(screen.getByText(/Docker Desktop no está en ejecución/)).toBeInTheDocument();
  });

  it('renders running status when simulator container is active and reachable', async () => {
    vi.spyOn(simulatorClient, 'getAtallaSimulatorStatus').mockResolvedValueOnce({
      dockerAvailable: true,
      dockerVersion: '29.6.2',
      imageLoaded: true,
      containerRunning: true,
      containerId: 'cnt_123',
      port: 7000,
      tcpReachable: true
    });
    vi.spyOn(simulatorClient, 'getAtallaSimulatorLogs').mockResolvedValueOnce('Container logs here');

    renderModal({ open: true });

    expect(await screen.findByText('En Ejecución (Puerto 7000)')).toBeInTheDocument();
    expect(screen.getByText('Detener Simulador')).toBeInTheDocument();
    expect(screen.getByText('Container logs here')).toBeInTheDocument();
  });

  it('handles starting the simulator and auto-connects to workspace', async () => {
    vi.spyOn(simulatorClient, 'getAtallaSimulatorStatus').mockResolvedValueOnce({
      dockerAvailable: true,
      imageLoaded: true,
      containerRunning: false,
      port: 7000,
      tcpReachable: false
    });
    vi.spyOn(simulatorClient, 'getAtallaSimulatorLogs').mockResolvedValue('Listening on port 7000');
    const startSpy = vi.spyOn(simulatorClient, 'startAtallaSimulator').mockResolvedValueOnce({
      dockerAvailable: true,
      imageLoaded: true,
      containerRunning: true,
      containerId: 'cnt_new',
      port: 7000,
      tcpReachable: true
    });

    const { user } = renderModal({ open: true });

    const startBtn = await screen.findByRole('button', { name: /Iniciar Simulador/i });
    await user.click(startBtn);

    await waitFor(() => {
      expect(startSpy).toHaveBeenCalled();
    });

    expect(await screen.findByText('En Ejecución (Puerto 7000)')).toBeInTheDocument();
  });

  it('handles stopping the simulator container', async () => {
    vi.spyOn(simulatorClient, 'getAtallaSimulatorStatus').mockResolvedValueOnce({
      dockerAvailable: true,
      imageLoaded: true,
      containerRunning: true,
      containerId: 'cnt_123',
      port: 7000,
      tcpReachable: true
    });
    vi.spyOn(simulatorClient, 'getAtallaSimulatorLogs').mockResolvedValue('');
    const stopSpy = vi.spyOn(simulatorClient, 'stopAtallaSimulator').mockResolvedValueOnce({
      dockerAvailable: true,
      imageLoaded: true,
      containerRunning: false,
      port: 7000,
      tcpReachable: false
    });

    const { user } = renderModal({ open: true });

    const stopBtn = await screen.findByRole('button', { name: /Detener Simulador/i });
    await user.click(stopBtn);

    await waitFor(() => {
      expect(stopSpy).toHaveBeenCalled();
    });

    expect(await screen.findByText('Detenido')).toBeInTheDocument();
  });

  it('executes self-test command and displays response with load in editor option', async () => {
    vi.spyOn(simulatorClient, 'getAtallaSimulatorStatus').mockResolvedValueOnce({
      dockerAvailable: true,
      imageLoaded: true,
      containerRunning: true,
      port: 7000,
      tcpReachable: true
    });
    vi.spyOn(simulatorClient, 'getAtallaSimulatorLogs').mockResolvedValue('');
    const sendCmdSpy = vi.spyOn(hardwareClient, 'sendHardwareCommand').mockResolvedValueOnce({
      success: true,
      response: '<00#TEST#1234#>',
      elapsedMs: 15
    });

    const onLoadCommandMock = vi.fn();
    const { user } = renderModal({ open: true, onLoadCommand: onLoadCommandMock });

    const echoBtn = await screen.findByRole('button', { name: /<00#TEST#1234#>/i });
    await user.click(echoBtn);

    await waitFor(() => {
      expect(sendCmdSpy).toHaveBeenCalledWith(
        expect.objectContaining({ host: '127.0.0.1', port: 7000 }),
        '<00#TEST#1234#>',
        'delimited-positional'
      );
    });

    // Check response rendered
    const responseElem = await screen.findByTestId('selftest-response-value');
    expect(responseElem).toHaveTextContent('<00#TEST#1234#>');
    expect(screen.getByText('15 ms')).toBeInTheDocument();

    // Click load in editor
    const loadBtn = screen.getByRole('button', { name: /Cargar en el Editor/i });
    await user.click(loadBtn);

    expect(onLoadCommandMock).toHaveBeenCalledWith('<00#TEST#1234#>');
  });
});
