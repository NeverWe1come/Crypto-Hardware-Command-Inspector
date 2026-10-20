/**
 * @packageDocumentation
 * Unit and integration tests for IndexedDB persistence (`@chci/explorer`).
 * Uses `fake-indexeddb/auto` for deterministic in-memory storage emulation.
 */

import 'fake-indexeddb/auto';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { WorkspaceState } from '../../state/types';
import {
  appendHistory,
  clearActiveSession,
  clearHistory,
  closeDb,
  DB_NAME,
  DB_VERSION,
  deleteSession,
  duplicateSession,
  getDb,
  getHistory,
  listSessions,
  loadActiveSession,
  loadSession,
  resetDatabase,
  saveActiveSession,
  saveSession
} from '../indexeddb';
import type { HistoryEntry, SavedSession } from '../types';

describe('IndexedDB Persistence Layer (chci_db v1)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

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
            raw: '<31#1#1#K1#K2#>',
            version: '8.60',
            direction: 'request',
            linkedCommandId: null
          },
          {
            id: 'cmd_2',
            raw: '<32#00#1234#>',
            version: '8.60',
            direction: 'response',
            linkedCommandId: 'cmd_1'
          }
        ],
        activeCommandId: 'cmd_1'
      }
    ],
    catalogSearchQuery: '',
    selectedCategory: 'HSM_FINANCIAL'
  };

  const mockSession1: SavedSession = {
    id: 'session_1',
    name: 'Atalla Financial Testing',
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T10:30:00.000Z',
    state: mockState
  };

  const mockSession2: SavedSession = {
    id: 'session_2',
    name: 'Thales Key Exchange',
    createdAt: '2026-10-20T11:00:00.000Z',
    updatedAt: '2026-10-20T12:00:00.000Z',
    state: {
      ...mockState,
      tabs: [
        {
          id: 'tab_thales',
          deviceId: 'thales-payshield-10k',
          version: '2.3',
          headerLength: 4,
          commands: [
            {
              id: 'cmd_thales_1',
              raw: '0000 00AABB',
              version: '2.3',
              direction: 'request',
              linkedCommandId: null
            }
          ],
          activeCommandId: 'cmd_thales_1'
        }
      ]
    }
  };

  describe('Database Initialization & Schema', () => {
    it('initializes chci_db with version 1 and all required object stores', async () => {
      const db = await getDb();

      expect(db.name).toBe(DB_NAME);
      expect(db.version).toBe(DB_VERSION);
      expect(db.objectStoreNames.contains('sessions')).toBe(true);
      expect(db.objectStoreNames.contains('active_session')).toBe(true);
      expect(db.objectStoreNames.contains('history')).toBe(true);
    });
  });

  describe('Saved Sessions Operations', () => {
    it('saves a session and loads it accurately by ID', async () => {
      await saveSession(mockSession1);

      const loaded = await loadSession(mockSession1.id);
      expect(loaded).toEqual(mockSession1);
    });

    it('returns null when loading a non-existent session ID', async () => {
      const loaded = await loadSession('non_existent_id');
      expect(loaded).toBeNull();
    });

    it('updates an existing session upon save with the same ID', async () => {
      await saveSession(mockSession1);

      const updatedSession: SavedSession = {
        ...mockSession1,
        name: 'Updated Atalla Testing Session',
        updatedAt: '2026-10-20T13:00:00.000Z'
      };
      await saveSession(updatedSession);

      const loaded = await loadSession(mockSession1.id);
      expect(loaded?.name).toBe('Updated Atalla Testing Session');
      expect(loaded?.updatedAt).toBe('2026-10-20T13:00:00.000Z');
    });

    it('lists all sessions ordered by updatedAt descending with tab and command counts', async () => {
      // Save Session 1 (updated at 10:30) and Session 2 (updated at 12:00)
      await saveSession(mockSession1);
      await saveSession(mockSession2);

      const list = await listSessions();

      expect(list).toHaveLength(2);
      // Session 2 should be first because its updatedAt is later
      expect(list[0]?.id).toBe('session_2');
      expect(list[0]?.tabCount).toBe(1);
      expect(list[0]?.commandCount).toBe(1);

      // Session 1 should be second
      expect(list[1]?.id).toBe('session_1');
      expect(list[1]?.tabCount).toBe(1);
      expect(list[1]?.commandCount).toBe(2);
    });

    it('deletes a saved session and removes it from listing', async () => {
      await saveSession(mockSession1);
      await saveSession(mockSession2);

      await deleteSession(mockSession1.id);

      const loaded = await loadSession(mockSession1.id);
      expect(loaded).toBeNull();

      const list = await listSessions();
      expect(list).toHaveLength(1);
      expect(list[0]?.id).toBe('session_2');
    });

    it('safely handles deleteSession on non-existent ID without throwing', async () => {
      await expect(deleteSession('does_not_exist')).resolves.toBeUndefined();
    });

    it('duplicates an existing session with default copy name', async () => {
      await saveSession(mockSession1);

      const duplicated = await duplicateSession(mockSession1.id);

      expect(duplicated.id).not.toBe(mockSession1.id);
      expect(duplicated.name).toBe(`${mockSession1.name} (Copia)`);
      expect(duplicated.state).toEqual(mockSession1.state);

      const list = await listSessions();
      expect(list).toHaveLength(2);
    });

    it('duplicates an existing session with a custom provided name', async () => {
      await saveSession(mockSession1);

      const duplicated = await duplicateSession(mockSession1.id, 'Cloned Atalla Staging');

      expect(duplicated.name).toBe('Cloned Atalla Staging');
      const loaded = await loadSession(duplicated.id);
      expect(loaded?.name).toBe('Cloned Atalla Staging');
    });

    it('throws when duplicating a non-existent session ID', async () => {
      await expect(duplicateSession('ghost_id')).rejects.toThrow(
        /no se encontró la sesión/i
      );
    });
  });

  describe('Active Session Autosave Operations', () => {
    it('returns null when no active session has been saved', async () => {
      const active = await loadActiveSession();
      expect(active).toBeNull();
    });

    it('saves and restores active workspace state', async () => {
      await saveActiveSession(mockState);

      const loaded = await loadActiveSession();
      expect(loaded).toEqual(mockState);
    });

    it('clears active session autosave record', async () => {
      await saveActiveSession(mockState);
      expect(await loadActiveSession()).not.toBeNull();

      await clearActiveSession();
      expect(await loadActiveSession()).toBeNull();
    });
  });

  describe('Command History Log Operations', () => {
    const entry1: HistoryEntry = {
      timestamp: '2026-10-20T14:00:00.000Z',
      deviceId: 'utimaco-atalla-at1000',
      version: '8.60',
      direction: 'request',
      raw: '<31#1#1#>'
    };

    const entry2: HistoryEntry = {
      timestamp: '2026-10-20T14:05:00.000Z',
      deviceId: 'utimaco-atalla-at1000',
      version: '8.60',
      direction: 'response',
      raw: '<32#00#>'
    };

    const entry3: HistoryEntry = {
      timestamp: '2026-10-20T14:10:00.000Z',
      deviceId: 'thales-payshield-10k',
      version: '2.3',
      direction: 'request',
      raw: '0000 00AABB'
    };

    it('returns empty array when history is empty', async () => {
      const history = await getHistory();
      expect(history).toEqual([]);
    });

    it('appends history entries and retrieves them sorted by timestamp descending', async () => {
      await appendHistory(entry1);
      await appendHistory(entry2);
      await appendHistory(entry3);

      const history = await getHistory();
      expect(history).toHaveLength(3);

      // Most recent (entry3 at 14:10) should be first
      expect(history[0]?.timestamp).toBe(entry3.timestamp);
      expect(history[0]?.deviceId).toBe(entry3.deviceId);
      expect(history[1]?.timestamp).toBe(entry2.timestamp);
      expect(history[2]?.timestamp).toBe(entry1.timestamp);
    });

    it('respects limit parameter when querying history', async () => {
      await appendHistory(entry1);
      await appendHistory(entry2);
      await appendHistory(entry3);

      const limited = await getHistory(2);
      expect(limited).toHaveLength(2);
      expect(limited[0]?.timestamp).toBe(entry3.timestamp);
      expect(limited[1]?.timestamp).toBe(entry2.timestamp);
    });

    it('clears all history records', async () => {
      await appendHistory(entry1);
      await appendHistory(entry2);
      expect(await getHistory()).toHaveLength(2);

      await clearHistory();
      expect(await getHistory()).toHaveLength(0);
    });
  });
});
