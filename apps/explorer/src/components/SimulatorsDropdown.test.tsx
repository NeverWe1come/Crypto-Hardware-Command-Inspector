import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { SimulatorsDropdown } from './SimulatorsDropdown';
import * as hubClient from '../services/simulators-hub-client';
import esMessages from '../i18n/locales/es.json';

vi.mock('../services/simulators-hub-client');
vi.mock('../services/simulator-client');
vi.mock('../services/thales-simulator-client');
vi.mock('../services/futurex-simulator-client');
vi.mock('../services/liquidsecurity-simulator-client');

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <IntlProvider locale="es" messages={esMessages}>
      {ui}
    </IntlProvider>
  );
};

describe('SimulatorsDropdown Component', () => {
  const mockInventory: hubClient.SimulatorInventoryItem[] = [
    {
      id: 'atalla-at1000',
      name: 'Utimaco Atalla AT1000',
      vendor: 'Utimaco',
      defaultPort: 7000,
      installed: false,
      running: false,
      approxSizeMb: 848,
    },
    {
      id: 'thales-payshield',
      name: 'Thales payShield 10K',
      vendor: 'Thales',
      defaultPort: 1500,
      installed: true,
      running: false,
      approxSizeMb: 5,
    },
    {
      id: 'futurex-excrypt',
      name: 'Futurex Excrypt Plus',
      vendor: 'Futurex',
      defaultPort: 9000,
      installed: true,
      running: true,
      approxSizeMb: 5,
    },
    {
      id: 'marvell-liquidsecurity',
      name: 'Marvell LiquidSecurity HSM',
      vendor: 'Marvell',
      defaultPort: 2225,
      installed: true,
      running: false,
      approxSizeMb: 5,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hubClient.getSimulatorsInventory).mockResolvedValue(mockInventory);
  });

  it('renders trigger button with active count badge', async () => {
    renderWithProviders(
      <SimulatorsDropdown
        onOpenAtallaConsole={() => {}}
        onOpenThalesConsole={() => {}}
        onOpenFuturexConsole={() => {}}
        onOpenLiquidConsole={() => {}}
      />
    );

    const trigger = screen.getByTestId('simulators-hub-button');
    expect(trigger).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('simulators-active-badge')).toHaveTextContent('1/4');
    });
  });

  it('opens dropdown and displays all 4 simulators with their ports', async () => {
    renderWithProviders(
      <SimulatorsDropdown
        onOpenAtallaConsole={() => {}}
        onOpenThalesConsole={() => {}}
        onOpenFuturexConsole={() => {}}
        onOpenLiquidConsole={() => {}}
      />
    );

    const trigger = screen.getByTestId('simulators-hub-button');
    await waitFor(() => {
      expect(screen.getByTestId('simulators-active-badge')).toHaveTextContent('1/4');
    });
    fireEvent.click(trigger);

    expect(screen.getByTestId('simulators-hub-popover')).toBeInTheDocument();
    expect(screen.getByText(/Atalla AT1000/i)).toBeInTheDocument();
    expect(screen.getByText(/payShield 10K/i)).toBeInTheDocument();
    expect(screen.getByText(/Excrypt Plus/i)).toBeInTheDocument();
    expect(screen.getByText(/LiquidSecurity/i)).toBeInTheDocument();

    expect(screen.getByText('TCP :7000')).toBeInTheDocument();
    expect(screen.getByText('TCP :1500')).toBeInTheDocument();
    expect(screen.getByText('TCP :9000')).toBeInTheDocument();
    expect(screen.getByText('TCP :2225')).toBeInTheDocument();
  });

  it('triggers stopAllSimulators when running and clicked', async () => {
    vi.mocked(hubClient.stopAllSimulators).mockResolvedValue(
      mockInventory.map((s) => ({ ...s, running: false }))
    );

    renderWithProviders(
      <SimulatorsDropdown
        onOpenAtallaConsole={() => {}}
        onOpenThalesConsole={() => {}}
        onOpenFuturexConsole={() => {}}
        onOpenLiquidConsole={() => {}}
      />
    );

    const trigger = screen.getByTestId('simulators-hub-button');
    await waitFor(() => {
      expect(screen.getByTestId('simulators-active-badge')).toHaveTextContent('1/4');
    });
    fireEvent.click(trigger);

    const stopAllBtn = screen.getByTestId('stop-all-simulators-btn');
    fireEvent.click(stopAllBtn);

    expect(hubClient.stopAllSimulators).toHaveBeenCalled();
  });

  it('opens console callback when clicking Consola button', async () => {
    const handleThalesConsole = vi.fn();

    renderWithProviders(
      <SimulatorsDropdown
        onOpenAtallaConsole={() => {}}
        onOpenThalesConsole={handleThalesConsole}
        onOpenFuturexConsole={() => {}}
        onOpenLiquidConsole={() => {}}
      />
    );

    const trigger = screen.getByTestId('simulators-hub-button');
    await waitFor(() => {
      expect(screen.getByTestId('simulators-active-badge')).toHaveTextContent('1/4');
    });
    fireEvent.click(trigger);

    const thalesConsoleBtn = screen.getByTestId('console-sim-thales-payshield');
    fireEvent.click(thalesConsoleBtn);

    expect(handleThalesConsole).toHaveBeenCalled();
  });

  it('opens install modal when clicking Instalar on uninstalled simulator', async () => {
    renderWithProviders(
      <SimulatorsDropdown
        onOpenAtallaConsole={() => {}}
        onOpenThalesConsole={() => {}}
        onOpenFuturexConsole={() => {}}
        onOpenLiquidConsole={() => {}}
      />
    );

    const trigger = screen.getByTestId('simulators-hub-button');
    await waitFor(() => {
      expect(screen.getByTestId('simulators-active-badge')).toHaveTextContent('1/4');
    });
    fireEvent.click(trigger);

    const installAtallaBtn = screen.getByTestId('install-sim-atalla-at1000');
    fireEvent.click(installAtallaBtn);

    expect(await screen.findByTestId('simulator-install-modal')).toBeInTheDocument();
  });
});
