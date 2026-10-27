/**
 * @packageDocumentation
 * Type definitions and contracts for IndexedDB persistence, saved sessions, and command history (`@chci/explorer`).
 */

import type { CommandDirection } from '@chci/parser-core';
import type { WorkspaceState } from '../state/types';
import type { DBSchema } from 'idb';

/**
 * Metadata summary of a saved workspace session for quick listing and cards.
 */
export interface SavedSessionMeta {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tabCount: number;
  readonly commandCount: number;
}

/**
 * Full saved session entity stored in IndexedDB.
 */
export interface SavedSession {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly state: WorkspaceState;
}

/**
 * Record representing an executed or inspected cryptographic command in the history log.
 */
export interface HistoryEntry {
  readonly id?: number;
  readonly timestamp: string;
  readonly deviceId: string;
  readonly version: string;
  readonly direction: CommandDirection;
  readonly raw: string;
}

/**
 * Export envelope format for JSON session files (`chci-session-v1.json`).
 */
export interface SessionExport {
  readonly schemaVersion: 1;
  readonly exportedAt: string;
  readonly session: SavedSession;
}

/**
 * IndexedDB database schema for `chci_db` v1.
 */
export interface CHCIDBSchema extends DBSchema {
  readonly sessions: {
    key: string;
    value: SavedSession;
    indexes: {
      readonly by_updatedAt: string;
    };
  };
  readonly active_session: {
    key: string;
    value: {
      readonly key: string;
      readonly state: WorkspaceState;
      readonly savedAt: string;
    };
  };
  readonly history: {
    key: number;
    value: HistoryEntry;
    indexes: {
      readonly by_timestamp: string;
      readonly by_deviceId: string;
    };
  };
}
