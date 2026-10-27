import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { WorkspaceProvider } from '../state/workspace-context';
import { LiquidSecuritySimulatorModal } from './LiquidSecuritySimulatorModal';
import * as client from '../services/liquidsecurity-simulator-client';
import esMessages from '../i18n/locales/es.json';

vi.mock('../services/liquidsecurity-simulator-client');

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <IntlProvider locale="es" messages={esMessages}>
      <WorkspaceProvider>{ui}</WorkspaceProvider>
    </IntlProvider>
  );
};

describe('LiquidSecuritySimulatorModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.getLiquidSecuritySimulatorStatus).mockResolvedValue({
      running: false,
      port: 2225,
      tcpReachable: false,
      firmwareVersion: '3.4.0',
      activePartitions: 2,
      processedCommands: 0,
      uptimeSeconds: 0,
      errorMessage: null,
    });
  });

  it('renders modal with offline status and firmware telemetry', async () => {
    renderWithProviders(
      <LiquidSecuritySimulatorModal open={true} onOpenChange={() => {}} />
    );

    expect(await screen.findByText(/LiquidSecurity/i)).toBeInTheDocument();
    expect(screen.getByTestId('liquid-status-badge')).toBeInTheDocument();
    expect(screen.getByText('3.4.0')).toBeInTheDocument();
    expect(screen.getByTestId('liquid-start-btn')).toBeInTheDocument();
  });

  it('triggers startLiquidSecuritySimulator on Start click', async () => {
    vi.mocked(client.startLiquidSecuritySimulator).mockResolvedValue({
      running: true,
      port: 2225,
      tcpReachable: true,
      firmwareVersion: '3.4.0',
      activePartitions: 2,
      processedCommands: 1,
      uptimeSeconds: 5,
      errorMessage: null,
    });

    renderWithProviders(
      <LiquidSecuritySimulatorModal open={true} onOpenChange={() => {}} />
    );

    const startBtn = await screen.findByTestId('liquid-start-btn');
    fireEvent.click(startBtn);

    expect(client.startLiquidSecuritySimulator).toHaveBeenCalledWith(2225);
  });

  it('injects KRN_STATUS diagnostic command when clicked', async () => {
    const handleLoad = vi.fn();
    const handleOpenChange = vi.fn();

    renderWithProviders(
      <LiquidSecuritySimulatorModal
        open={true}
        onOpenChange={handleOpenChange}
        onLoadCommand={handleLoad}
      />
    );

    const testBtn = await screen.findByTestId('liquid-test-krn-btn');
    fireEvent.click(testBtn);

    expect(handleLoad).toHaveBeenCalledWith('KRN_STATUS');
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
