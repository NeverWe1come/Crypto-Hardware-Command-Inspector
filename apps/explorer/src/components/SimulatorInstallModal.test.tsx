import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { SimulatorInstallModal } from './SimulatorInstallModal';
import * as hubClient from '../services/simulators-hub-client';
import esMessages from '../i18n/locales/es.json';

vi.mock('../services/simulators-hub-client');

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <IntlProvider locale="es" messages={esMessages}>
      {ui}
    </IntlProvider>
  );
};

describe('SimulatorInstallModal Component', () => {
  const dummySim: hubClient.SimulatorInventoryItem = {
    id: 'atalla-at1000',
    name: 'Utimaco Atalla AT1000',
    vendor: 'Utimaco',
    defaultPort: 7000,
    installed: false,
    running: false,
    approxSizeMb: 848,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with download tab by default', async () => {
    renderWithProviders(
      <SimulatorInstallModal
        open={true}
        onOpenChange={() => {}}
        simulator={dummySim}
      />
    );

    expect(await screen.findByTestId('simulator-install-modal')).toBeInTheDocument();
    expect(screen.getByText(/Instalar Utimaco Atalla AT1000/i)).toBeInTheDocument();
    expect(screen.getByTestId('start-download-btn')).toBeInTheDocument();
  });

  it('switches to local file tab and installs file', async () => {
    vi.mocked(hubClient.installSimulatorFromFile).mockResolvedValue({
      success: true,
      message: 'Installed',
      installPath: '/path',
    });

    const handleInstalled = vi.fn();

    renderWithProviders(
      <SimulatorInstallModal
        open={true}
        onOpenChange={() => {}}
        simulator={dummySim}
        onInstalled={handleInstalled}
      />
    );

    const localTab = screen.getByTestId('tab-local-file');
    fireEvent.click(localTab);

    expect(screen.getByTestId('local-file-path-input')).toBeInTheDocument();
    const input = screen.getByTestId('local-file-path-input');
    fireEvent.change(input, { target: { value: '/tmp/atalla.tar' } });

    const installBtn = screen.getByTestId('install-local-btn');
    fireEvent.click(installBtn);

    expect(hubClient.installSimulatorFromFile).toHaveBeenCalledWith('atalla-at1000', '/tmp/atalla.tar');
  });
});
