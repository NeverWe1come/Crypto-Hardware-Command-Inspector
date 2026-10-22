import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import * as simulatorClient from './services/simulator-client';

describe('App bootstrap', () => {
  it('renders the application title', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /Crypto Hardware Command Inspector/i })
    ).toBeInTheDocument();
  });

  it('triggers stopAtallaSimulator cleanup on beforeunload event', () => {
    const stopSpy = vi.spyOn(simulatorClient, 'stopAtallaSimulator').mockResolvedValue({
      dockerAvailable: true,
      imageLoaded: true,
      containerRunning: false,
      port: 7000,
      tcpReachable: false
    });

    render(<App />);
    fireEvent(window, new Event('beforeunload'));

    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it('unregisters beforeunload listener when unmounted', () => {
    const stopSpy = vi.spyOn(simulatorClient, 'stopAtallaSimulator').mockResolvedValue({
      dockerAvailable: true,
      imageLoaded: true,
      containerRunning: false,
      port: 7000,
      tcpReachable: false
    });

    const { unmount } = render(<App />);
    unmount();
    fireEvent(window, new Event('beforeunload'));

    expect(stopSpy).not.toHaveBeenCalled();
  });

  it('gracefully handles stopAtallaSimulator rejection on beforeunload without crashing', async () => {
    const stopSpy = vi.spyOn(simulatorClient, 'stopAtallaSimulator').mockRejectedValue(new Error('Docker daemon unavailable'));

    render(<App />);
    expect(() => {
      fireEvent(window, new Event('beforeunload'));
    }).not.toThrow();

    expect(stopSpy).toHaveBeenCalledTimes(1);
  });
});

