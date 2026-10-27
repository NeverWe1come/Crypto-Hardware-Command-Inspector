import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { WorkspaceProvider } from '../../state/workspace-context';
import { ThalesSimulatorModal } from '../ThalesSimulatorModal';
import * as thalesClient from '../../services/thales-simulator-client';

describe('ThalesSimulatorModal', () => {
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
          <ThalesSimulatorModal {...props} />
        </WorkspaceProvider>
      </IntlProvider>
    );
  };

  it('renders correctly when open and displays offline badge by default', async () => {
    vi.spyOn(thalesClient, 'getThalesSimulatorStatus').mockResolvedValue({
      running: false,
      port: 1500,
      tcpReachable: false,
      activeLmkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: null,
    });

    renderModal({ open: true, onOpenChange: vi.fn() });

    await waitFor(() => {
      expect(screen.getByText(/Simulador Thales payShield 10K/i)).toBeInTheDocument();
      const badge = screen.getByTestId('simulator-status-badge');
      expect(badge).toHaveTextContent('OFFLINE');
    });
    expect(screen.getByRole('button', { name: /Iniciar Simulador/i })).toBeInTheDocument();
  });

  it('handles starting the simulator', async () => {
    vi.spyOn(thalesClient, 'getThalesSimulatorStatus').mockResolvedValue({
      running: false,
      port: 1500,
      tcpReachable: false,
      activeLmkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: null,
    });

    const startSpy = vi.spyOn(thalesClient, 'startThalesSimulator').mockResolvedValue({
      running: true,
      port: 1500,
      tcpReachable: true,
      activeLmkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 1,
      errorMessage: null,
    });

    renderModal({ open: true, onOpenChange: vi.fn() });

    const startBtn = screen.getByRole('button', { name: /Iniciar Simulador/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(startSpy).toHaveBeenCalledWith(1500);
      expect(screen.getByTestId('simulator-status-badge')).toHaveTextContent('ONLINE :1500');
    });
  });

  it('allows injecting diagnostic commands to the editor', async () => {
    vi.spyOn(thalesClient, 'getThalesSimulatorStatus').mockResolvedValue({
      running: true,
      port: 1500,
      tcpReachable: true,
      activeLmkKcv: '08D7B4',
      processedCommands: 4,
      uptimeSeconds: 30,
      errorMessage: null,
    });

    const onLoadCommand = vi.fn();
    renderModal({ open: true, onOpenChange: vi.fn(), onLoadCommand });

    const buttons = screen.getAllByRole('button');
    // Find one of the arrow inject buttons
    const injectBtn = buttons.find((b) => b.querySelector('svg.lucide-arrow-right'));
    expect(injectBtn).toBeDefined();
    if (injectBtn) {
      fireEvent.click(injectBtn);
      expect(onLoadCommand).toHaveBeenCalled();
    }
  });
});
