/**
 * @packageDocumentation
 * Local persistence adapter utilizing IndexedDB (`chci_db` v1) via `idb` (`@chci/explorer`).
 * Manages saved sessions, autosave active workspace state, and command execution history log.
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { WorkspaceState } from '../state/types';
import type { CHCIDBSchema, HistoryEntry, SavedSession, SavedSessionMeta } from './types';

/**
 * Global IndexedDB database name and schema version.
 */
export const DB_NAME = 'chci_db';
export const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CHCIDBSchema>> | null = null;

/**
 * Retrieves or initializes the shared IndexedDB connection to `chci_db`.
 *
 * @returns IDBPDatabase instance with typed schema.
 */
export async function getDb(): Promise<IDBPDatabase<CHCIDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<CHCIDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Object Store 1: Saved sessions library
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionsStore.createIndex('by_updatedAt', 'updatedAt');
        }

        // Object Store 2: Active session autosave
        if (!db.objectStoreNames.contains('active_session')) {
          db.createObjectStore('active_session', { keyPath: 'key' });
        }

        // Object Store 3: Command history log
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', {
            keyPath: 'id',
            autoIncrement: true
          });
          historyStore.createIndex('by_timestamp', 'timestamp');
          historyStore.createIndex('by_deviceId', 'deviceId');
        }
      }
    });
  }
  return dbPromise;
}

/**
 * Closes the active IndexedDB connection if open.
 */
export async function closeDb(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}

/**
 * Resets all stores in the database. Used primarily for test teardown and factory reset.
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['sessions', 'active_session', 'history'], 'readwrite');
  await Promise.all([
    tx.objectStore('sessions').clear(),
    tx.objectStore('active_session').clear(),
    tx.objectStore('history').clear(),
    tx.done
  ]);
}

// -----------------------------------------------------------------------------
// SAVED SESSIONS OPERATIONS
// -----------------------------------------------------------------------------

/**
 * Saves or updates a named session in the `sessions` object store.
 *
 * @param session - Complete session record.
 */
export async function saveSession(session: SavedSession): Promise<void> {
  const db = await getDb();
  await db.put('sessions', session);
}

/**
 * Loads a saved session by its unique ID.
 *
 * @param id - Session ID.
 * @returns The session if found, or null otherwise.
 */
export async function loadSession(id: string): Promise<SavedSession | null> {
  const db = await getDb();
  const record = await db.get('sessions', id);
  return record ?? null;
}

/**
 * Lists all saved sessions as lightweight metadata, ordered by `updatedAt` descending.
 *
 * @returns Sorted array of session metadata.
 */
export async function listSessions(): Promise<SavedSessionMeta[]> {
  const db = await getDb();
  const sessions = await db.getAll('sessions');

  // Sort by updatedAt descending (newest first)
  sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return sessions.map((s) => ({
    id: s.id,
    name: s.name,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    tabCount: s.state.tabs.length,
    commandCount: s.state.tabs.reduce((acc, tab) => acc + tab.commands.length, 0)
  }));
}

/**
 * Deletes a session from the library by its ID.
 *
 * @param id - Session ID to remove.
 */
export async function deleteSession(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('sessions', id);
}

/**
 * Duplicates an existing session with a new unique ID and optional name override.
 *
 * @param id - Existing session ID to duplicate.
 * @param newName - Optional custom name for the duplicated session.
 * @returns Newly created duplicated session.
 */
export async function duplicateSession(id: string, newName?: string): Promise<SavedSession> {
  const original = await loadSession(id);
  if (!original) {
    throw new Error(`No se encontró la sesión con ID "${id}"`);
  }

  const now = new Date().toISOString();
  const newId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `session_${crypto.randomUUID()}`
      : `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const duplicated: SavedSession = {
    id: newId,
    name: newName && newName.trim() ? newName.trim() : `${original.name} (Copia)`,
    createdAt: now,
    updatedAt: now,
    state: structuredClone(original.state)
  };

  await saveSession(duplicated);
  return duplicated;
}

// -----------------------------------------------------------------------------
// ACTIVE SESSION / AUTOSAVE OPERATIONS
// -----------------------------------------------------------------------------

/**
 * Key used to store the single active session autosave record.
 */
const ACTIVE_SESSION_KEY = 'active_workspace';

/**
 * Persists the current workspace state to IndexedDB for automatic recovery.
 *
 * @param state - Current workspace state.
 */
export async function saveActiveSession(state: WorkspaceState): Promise<void> {
  const db = await getDb();
  await db.put('active_session', {
    key: ACTIVE_SESSION_KEY,
    state,
    savedAt: new Date().toISOString()
  });
}

/**
 * Loads the autosaved workspace state if one exists.
 *
 * @returns Saved workspace state or null if clean.
 */
export async function loadActiveSession(): Promise<WorkspaceState | null> {
  const db = await getDb();
  const record = await db.get('active_session', ACTIVE_SESSION_KEY);
  return record ? record.state : null;
}

/**
 * Clears the active session autosave record from IndexedDB.
 */
export async function clearActiveSession(): Promise<void> {
  const db = await getDb();
  await db.delete('active_session', ACTIVE_SESSION_KEY);
}

// -----------------------------------------------------------------------------
// HISTORY LOG OPERATIONS
// -----------------------------------------------------------------------------

/**
 * Appends a command record to the history log.
 *
 * @param entry - Inspected command history record.
 */
export async function appendHistory(entry: HistoryEntry): Promise<void> {
  const db = await getDb();
  // Strip entry id if undefined so autoIncrement assigns positive integer key
  const { id: _ignored, ...payload } = entry;
  await db.add('history', payload as HistoryEntry);
}

/**
 * Retrieves command history log entries ordered by timestamp descending (most recent first).
 *
 * @param limit - Optional maximum number of entries to retrieve.
 * @returns List of history entries.
 */
export async function getHistory(limit?: number): Promise<HistoryEntry[]> {
  const db = await getDb();
  const entries = await db.getAll('history');

  // Sort by timestamp descending
  entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  if (typeof limit === 'number' && limit > 0) {
    return entries.slice(0, limit);
  }
  return entries;
}

/**
 * Clears all entries in the command history log.
 */
export async function clearHistory(): Promise<void> {
  const db = await getDb();
  await db.clear('history');
}
