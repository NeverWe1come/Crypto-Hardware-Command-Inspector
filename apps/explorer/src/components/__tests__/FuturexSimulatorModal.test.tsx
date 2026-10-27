import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { WorkspaceProvider } from '../../state/workspace-context';
import { FuturexSimulatorModal } from '../FuturexSimulatorModal';
import * as futurexClient from '../../services/futurex-simulator-client';

describe('FuturexSimulatorModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderModal = (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLoadCommand?: (cmd: string) => void;
  }) => {
    return render(
      <IntlProvider locale="es" messages={{}}>
        <WorkspaceProvider>
          <FuturexSimulatorModal {...props} />
        </WorkspaceProvider>
      </IntlProvider>
    );
  };

  it('renders correctly when open and displays offline badge by default', async () => {
    vi.spyOn(futurexClient, 'getFuturexSimulatorStatus').mockResolvedValue({
      running: false,
      port: 9000,
      tcpReachable: false,
      activeMfkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: null,
    });

    renderModal({ open: true, onOpenChange: vi.fn() });

    await waitFor(() => {
      expect(screen.getByText(/Simulador Futurex Excrypt Plus/i)).toBeInTheDocument();
      const badge = screen.getByTestId('futurex-status-badge');
      expect(badge).toHaveTextContent('OFFLINE');
    });
    expect(screen.getByRole('button', { name: /Iniciar Simulador/i })).toBeInTheDocument();
  });

  it('handles starting the simulator', async () => {
    vi.spyOn(futurexClient, 'getFuturexSimulatorStatus').mockResolvedValue({
      running: false,
      port: 9000,
      tcpReachable: false,
      activeMfkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: null,
    });

    const startSpy = vi.spyOn(futurexClient, 'startFuturexSimulator').mockResolvedValue({
      running: true,
      port: 9000,
      tcpReachable: true,
      activeMfkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 1,
      errorMessage: null,
    });

    renderModal({ open: true, onOpenChange: vi.fn() });

    const startBtn = screen.getByRole('button', { name: /Iniciar Simulador/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(startSpy).toHaveBeenCalledWith(9000);
      expect(screen.getByTestId('futurex-status-badge')).toHaveTextContent('ONLINE :9000');
    });
  });

  it('allows injecting diagnostic commands to the editor', async () => {
    vi.spyOn(futurexClient, 'getFuturexSimulatorStatus').mockResolvedValue({
      running: true,
      port: 9000,
      tcpReachable: true,
      activeMfkKcv: '08D7B4',
      processedCommands: 3,
      uptimeSeconds: 20,
      errorMessage: null,
    });

    const onLoadCommand = vi.fn();
    renderModal({ open: true, onOpenChange: vi.fn(), onLoadCommand });

    const buttons = screen.getAllByRole('button');
    const injectBtn = buttons.find((b) => b.querySelector('svg.lucide-arrow-right'));
    expect(injectBtn).toBeDefined();
    if (injectBtn) {
      fireEvent.click(injectBtn);
      expect(onLoadCommand).toHaveBeenCalled();
    }
  });
});
