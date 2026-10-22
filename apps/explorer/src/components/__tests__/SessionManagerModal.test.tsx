/**
 * @packageDocumentation
 * Component integration tests for SessionManagerModal (`@chci/explorer`).
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionManagerModal } from '../SessionManagerModal';
import { WorkspaceProvider } from '../../state/workspace-context';
import type { WorkspaceState } from '../../state/types';
import * as storage from '../../storage/indexeddb';
import type { SavedSession, SavedSessionMeta } from '../../storage/types';

describe('SessionManagerModal Component', () => {
  const mockState: WorkspaceState = {
    locale: 'es',
    theme: 'dark',
    activeTabId: 'tab_1',
    tabs: [
      {
        id: 'tab_1',
        deviceId: 'utimaco-atalla-at1000',
        version: '8.60',
        commands: [
          {
            id: 'cmd_1',
            raw: '<31#1#>',
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

  const sampleSessionMeta: SavedSessionMeta = {
    id: 'session_abc',
    name: 'Sesión Bancaria Atalla',
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T12:00:00.000Z',
    tabCount: 1,
    commandCount: 1
  };

  const sampleFullSession: SavedSession = {
    id: 'session_abc',
    name: 'Sesión Bancaria Atalla',
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T12:00:00.000Z',
    state: mockState
  };

  function renderModal(props: { open: boolean; onOpenChange?: (open: boolean) => void }) {
    return {
      user: userEvent.setup(),
      ...render(
        <WorkspaceProvider initialState={mockState}>
          <SessionManagerModal open={props.open} onOpenChange={props.onOpenChange ?? vi.fn()} />
        </WorkspaceProvider>
      )
    };
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render modal contents when open is false', () => {
    renderModal({ open: false });
    expect(screen.queryByTestId('session-manager-modal')).not.toBeInTheDocument();
  });

  it('renders modal dialog title, input, and empty state when open is true and no sessions exist', async () => {
    vi.spyOn(storage, 'listSessions').mockResolvedValue([]);

    renderModal({ open: true });

    expect(screen.getByTestId('session-manager-modal')).toBeInTheDocument();
    expect(screen.getByText(/Biblioteca de Sesiones/i)).toBeInTheDocument();
    expect(screen.getByTestId('session-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('save-session-button')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('session-empty-state')).toBeInTheDocument();
    });
  });

  it('renders list of saved sessions with metadata tags', async () => {
    vi.spyOn(storage, 'listSessions').mockResolvedValue([sampleSessionMeta]);

    renderModal({ open: true });

    await waitFor(() => {
      expect(screen.getByTestId(`session-item-${sampleSessionMeta.id}`)).toBeInTheDocument();
      expect(screen.getByText('Sesión Bancaria Atalla')).toBeInTheDocument();
      expect(screen.getByText(/1 pestaña/i)).toBeInTheDocument();
      expect(screen.getByText(/1 comando/i)).toBeInTheDocument();
    });
  });

  it('saves current session with user-specified name and refreshes listing', async () => {
    const listSpy = vi.spyOn(storage, 'listSessions').mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        ...sampleSessionMeta,
        name: 'Nueva Sesión Producción'
      }
    ]);
    const saveSpy = vi.spyOn(storage, 'saveSession').mockResolvedValue();

    const { user } = renderModal({ open: true });

    const input = screen.getByTestId('session-name-input');
    await user.type(input, 'Nueva Sesión Producción');

    const saveButton = screen.getByTestId('save-session-button');
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Nueva Sesión Producción',
        state: mockState
      })
    );

    // Input should be reset
    expect(input).toHaveValue('');

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Nueva Sesión Producción')).toBeInTheDocument();
    });
  });

  it('loads a saved session and closes the modal', async () => {
    const onOpenChange = vi.fn();
    vi.spyOn(storage, 'listSessions').mockResolvedValue([sampleSessionMeta]);
    const loadSpy = vi.spyOn(storage, 'loadSession').mockResolvedValue(sampleFullSession);

    const { user } = renderModal({ open: true, onOpenChange });

    await waitFor(() => {
      expect(screen.getByTestId(`load-session-${sampleSessionMeta.id}`)).toBeInTheDocument();
    });

    const loadButton = screen.getByTestId(`load-session-${sampleSessionMeta.id}`);
    await user.click(loadButton);

    expect(loadSpy).toHaveBeenCalledWith(sampleSessionMeta.id);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('duplicates an existing session and updates the list', async () => {
    vi.spyOn(storage, 'listSessions').mockResolvedValueOnce([sampleSessionMeta]).mockResolvedValueOnce([
      sampleSessionMeta,
      {
        ...sampleSessionMeta,
        id: 'session_abc_copy',
        name: 'Sesión Bancaria Atalla (Copia)'
      }
    ]);
    const dupSpy = vi.spyOn(storage, 'duplicateSession').mockResolvedValue({
      ...sampleFullSession,
      id: 'session_abc_copy',
      name: 'Sesión Bancaria Atalla (Copia)'
    });

    const { user } = renderModal({ open: true });

    await waitFor(() => {
      expect(screen.getByTestId(`duplicate-session-${sampleSessionMeta.id}`)).toBeInTheDocument();
    });

    const dupButton = screen.getByTestId(`duplicate-session-${sampleSessionMeta.id}`);
    await user.click(dupButton);

    expect(dupSpy).toHaveBeenCalledWith(sampleSessionMeta.id);

    await waitFor(() => {
      expect(screen.getByText('Sesión Bancaria Atalla (Copia)')).toBeInTheDocument();
    });
  });

  it('deletes a session and updates the list', async () => {
    vi.spyOn(storage, 'listSessions').mockResolvedValueOnce([sampleSessionMeta]).mockResolvedValueOnce([]);
    const deleteSpy = vi.spyOn(storage, 'deleteSession').mockResolvedValue();

    const { user } = renderModal({ open: true });

    await waitFor(() => {
      expect(screen.getByTestId(`delete-session-${sampleSessionMeta.id}`)).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId(`delete-session-${sampleSessionMeta.id}`);
    await user.click(deleteButton);

    expect(deleteSpy).toHaveBeenCalledWith(sampleSessionMeta.id);

    await waitFor(() => {
      expect(screen.queryByTestId(`session-item-${sampleSessionMeta.id}`)).not.toBeInTheDocument();
      expect(screen.getByTestId('session-empty-state')).toBeInTheDocument();
    });
  });

  it('exports session to downloadable JSON file', async () => {
    vi.spyOn(storage, 'listSessions').mockResolvedValue([sampleSessionMeta]);
    vi.spyOn(storage, 'loadSession').mockResolvedValue(sampleFullSession);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-blob');
    const revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;

    const { user } = renderModal({ open: true });

    await waitFor(() => {
      expect(screen.getByTestId(`export-session-${sampleSessionMeta.id}`)).toBeInTheDocument();
    });

    const exportButton = screen.getByTestId(`export-session-${sampleSessionMeta.id}`);
    await user.click(exportButton);

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('imports valid session from file and displays it in list', async () => {
    const listSpy = vi.spyOn(storage, 'listSessions').mockResolvedValueOnce([]).mockResolvedValueOnce([
      sampleSessionMeta
    ]);
    const saveSpy = vi.spyOn(storage, 'saveSession').mockResolvedValue();

    renderModal({ open: true });

    const validExport = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      session: sampleFullSession
    };

    const file = new File([JSON.stringify(validExport)], 'session.json', {
      type: 'application/json'
    });

    const fileInput = screen.getByTestId('import-session-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(sampleFullSession);
      expect(listSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Sesión Bancaria Atalla')).toBeInTheDocument();
    });
  });

  it('displays error alert when importing an invalid or corrupt session file', async () => {
    vi.spyOn(storage, 'listSessions').mockResolvedValue([]);

    renderModal({ open: true });

    const corruptFile = new File(['{ invalid json content }'], 'corrupt.json', {
      type: 'application/json'
    });

    const fileInput = screen.getByTestId('import-session-input');
    fireEvent.change(fileInput, { target: { files: [corruptFile] } });

    await waitFor(() => {
      expect(screen.getByTestId('session-error-alert')).toBeInTheDocument();
      expect(screen.getByText(/Error de sintaxis JSON/i)).toBeInTheDocument();
    });
  });
});
