import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import * as simulatorClient from './services/simulator-client';
import * as thalesClient from './services/thales-simulator-client';
import * as futurexClient from './services/futurex-simulator-client';
import * as liquidClient from './services/liquidsecurity-simulator-client';

describe('App bootstrap', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the application title', () => {
    const { unmount } = render(<App />);
    expect(
      screen.getByRole('heading', { name: /Crypto Hardware Command Inspector/i })
    ).toBeInTheDocument();
    unmount();
  });

  it('triggers cleanup for all simulators on beforeunload event', () => {
    const atallaSpy = vi.spyOn(simulatorClient, 'stopAtallaSimulator').mockResolvedValue({
      dockerAvailable: true,
      imageLoaded: true,
      containerRunning: false,
      port: 7000,
      tcpReachable: false
    });
    const thalesSpy = vi.spyOn(thalesClient, 'stopThalesSimulator').mockResolvedValue({
      running: false,
      port: 1500,
      tcpReachable: false,
      activeLmkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
    });
    const futurexSpy = vi.spyOn(futurexClient, 'stopFuturexSimulator').mockResolvedValue({
      running: false,
      port: 9000,
      tcpReachable: false,
      activeMfkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
    });
    const liquidSpy = vi.spyOn(liquidClient, 'stopLiquidSecuritySimulator').mockResolvedValue({
      running: false,
      port: 2225,
      tcpReachable: false,
      firmwareVersion: '3.4.0',
      activePartitions: 2,
      processedCommands: 0,
      uptimeSeconds: 0,
    });

    const { unmount } = render(<App />);
    fireEvent(window, new Event('beforeunload'));

    expect(atallaSpy).toHaveBeenCalledTimes(1);
    expect(thalesSpy).toHaveBeenCalledTimes(1);
    expect(futurexSpy).toHaveBeenCalledTimes(1);
    expect(liquidSpy).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('unregisters beforeunload listener when unmounted', () => {
    const atallaSpy = vi.spyOn(simulatorClient, 'stopAtallaSimulator').mockResolvedValue({
      dockerAvailable: true,
      imageLoaded: true,
      containerRunning: false,
      port: 7000,
      tcpReachable: false
    });
    const thalesSpy = vi.spyOn(thalesClient, 'stopThalesSimulator').mockResolvedValue({
      running: false,
      port: 1500,
      tcpReachable: false,
      activeLmkKcv: '08D7B4',
      processedCommands: 0,
      uptimeSeconds: 0,
    });

    const { unmount } = render(<App />);
    unmount();
    fireEvent(window, new Event('beforeunload'));

    expect(atallaSpy).not.toHaveBeenCalled();
    expect(thalesSpy).not.toHaveBeenCalled();
  });

  it('gracefully handles simulator rejection on beforeunload without crashing', async () => {
    const atallaSpy = vi.spyOn(simulatorClient, 'stopAtallaSimulator').mockRejectedValue(new Error('Docker daemon unavailable'));
    const thalesSpy = vi.spyOn(thalesClient, 'stopThalesSimulator').mockRejectedValue(new Error('Socket error'));

    const { unmount } = render(<App />);
    expect(() => {
      fireEvent(window, new Event('beforeunload'));
    }).not.toThrow();

    expect(atallaSpy).toHaveBeenCalledTimes(1);
    expect(thalesSpy).toHaveBeenCalledTimes(1);

    unmount();
  });
});

