/**
 * @packageDocumentation
 * Component integration tests for HistoryModal (`@chci/explorer`).
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HistoryModal } from '../HistoryModal';
import { WorkspaceProvider } from '../../state/workspace-context';
import type { WorkspaceState } from '../../state/types';
import * as storage from '../../storage/indexeddb';
import type { HistoryEntry } from '../../storage/types';

describe('HistoryModal Component', () => {
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
            id: 'cmd_active',
            raw: '<31#1#>',
            version: '8.60',
            direction: 'request',
            linkedCommandId: null
          }
        ],
        activeCommandId: 'cmd_active'
      }
    ],
    catalogSearchQuery: '',
    selectedCategory: 'ALL'
  };

  const sampleEntries: HistoryEntry[] = [
    {
      timestamp: '2026-10-20T14:00:00.000Z',
      deviceId: 'utimaco-atalla-at1000',
      version: '8.60',
      direction: 'request',
      raw: '<31#1#1#K1#K2#>'
    },
    {
      timestamp: '2026-10-20T14:05:00.000Z',
      deviceId: 'thales-payshield-10k',
      version: '2.3',
      direction: 'response',
      raw: '000000 00AABBCCDD'
    },
    {
      timestamp: '2026-10-20T14:10:00.000Z',
      deviceId: 'futurex-excrypt',
      version: '7.6.1',
      direction: 'request',
      raw: '[AOECHO;AGtesting;]'
    }
  ];

  function renderModal(props: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    initialState?: Partial<WorkspaceState>;
  }) {
    return {
      user: userEvent.setup(),
      ...render(
        <WorkspaceProvider initialState={props.initialState ?? mockState}>
          <HistoryModal open={props.open} onOpenChange={props.onOpenChange ?? vi.fn()} />
        </WorkspaceProvider>
      )
    };
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render modal contents when open is false', () => {
    renderModal({ open: false });
    expect(screen.queryByTestId('history-modal')).not.toBeInTheDocument();
  });

  it('renders modal dialog title, search input, and empty state when history is empty', async () => {
    vi.spyOn(storage, 'getHistory').mockResolvedValue([]);

    renderModal({ open: true });

    expect(screen.getByTestId('history-modal')).toBeInTheDocument();
    expect(screen.getByText(/Historial de Comandos/i)).toBeInTheDocument();
    expect(screen.getByTestId('history-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('history-export-button')).toBeDisabled();
    expect(screen.getByTestId('history-clear-button')).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByTestId('history-empty-state')).toBeInTheDocument();
    });
  });

  it('renders list of history entries with badges, formatted date, and raw command', async () => {
    vi.spyOn(storage, 'getHistory').mockResolvedValue(sampleEntries);

    renderModal({ open: true });

    await waitFor(() => {
      expect(screen.getByTestId('history-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('history-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('history-item-2')).toBeInTheDocument();

      expect(screen.getByText('<31#1#1#K1#K2#>')).toBeInTheDocument();
      expect(screen.getByText('000000 00AABBCCDD')).toBeInTheDocument();
      expect(screen.getByText('[AOECHO;AGtesting;]')).toBeInTheDocument();
    });

    expect(screen.getByTestId('history-export-button')).toBeEnabled();
    expect(screen.getByTestId('history-clear-button')).toBeEnabled();
  });

  it('filters entries dynamically via real-time search input', async () => {
    vi.spyOn(storage, 'getHistory').mockResolvedValue(sampleEntries);

    const { user } = renderModal({ open: true });

    await waitFor(() => {
      expect(screen.getByTestId('history-item-0')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('history-search-input');

    // Filter by device name "futurex"
    await user.type(searchInput, 'futurex');

    expect(screen.getByText('[AOECHO;AGtesting;]')).toBeInTheDocument();
    expect(screen.queryByText('<31#1#1#K1#K2#>')).not.toBeInTheDocument();
    expect(screen.queryByText('000000 00AABBCCDD')).not.toBeInTheDocument();

    // Filter by non-existent term
    await user.clear(searchInput);
    await user.type(searchInput, 'non_existent_device');

    expect(screen.getByTestId('history-no-match-state')).toBeInTheDocument();
    expect(screen.queryByTestId('history-item-0')).not.toBeInTheDocument();

    // Clear search restores all
    await user.clear(searchInput);
    expect(screen.getByTestId('history-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('history-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('history-item-2')).toBeInTheDocument();
  });

  it('inserts history command into the active command and closes modal', async () => {
    const onOpenChange = vi.fn();
    vi.spyOn(storage, 'getHistory').mockResolvedValue(sampleEntries);

    const { user } = renderModal({ open: true, onOpenChange });

    await waitFor(() => {
      expect(screen.getByTestId('history-insert-active-1')).toBeInTheDocument();
    });

    // Insert Thales response into active command
    const insertBtn = screen.getByTestId('history-insert-active-1');
    await user.click(insertBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('adds history command as a new command in active workspace tab and closes modal', async () => {
    const onOpenChange = vi.fn();
    vi.spyOn(storage, 'getHistory').mockResolvedValue(sampleEntries);

    const { user } = renderModal({ open: true, onOpenChange });

    await waitFor(() => {
      expect(screen.getByTestId('history-add-new-2')).toBeInTheDocument();
    });

    // Add Futurex command as new command
    const addNewBtn = screen.getByTestId('history-add-new-2');
    await user.click(addNewBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables insert and add-new buttons when no active tab exists in workspace', async () => {
    vi.spyOn(storage, 'getHistory').mockResolvedValue(sampleEntries);

    renderModal({
      open: true,
      initialState: {
        ...mockState,
        activeTabId: null,
        tabs: []
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('history-insert-active-0')).toBeDisabled();
      expect(screen.getByTestId('history-add-new-0')).toBeDisabled();
    });
  });

  it('exports history to downloadable .chci_history file', async () => {
    vi.spyOn(storage, 'getHistory').mockResolvedValue(sampleEntries);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-history');
    const revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;

    const { user } = renderModal({ open: true });

    await waitFor(() => {
      expect(screen.getByTestId('history-export-button')).toBeEnabled();
    });

    await user.click(screen.getByTestId('history-export-button'));

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('clears all history entries and transitions to empty state', async () => {
    vi.spyOn(storage, 'getHistory').mockResolvedValue(sampleEntries);
    const clearSpy = vi.spyOn(storage, 'clearHistory').mockResolvedValue();

    const { user } = renderModal({ open: true });

    await waitFor(() => {
      expect(screen.getByTestId('history-clear-button')).toBeEnabled();
    });

    await user.click(screen.getByTestId('history-clear-button'));

    expect(clearSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByTestId('history-item-0')).not.toBeInTheDocument();
      expect(screen.getByTestId('history-empty-state')).toBeInTheDocument();
    });
  });
});
