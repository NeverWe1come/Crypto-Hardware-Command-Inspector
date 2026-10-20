/**
 * @packageDocumentation
 * Serializer and parser for plain text history files (`.chci_history`), styled after `.bash_history`.
 * Format specification:
 * `ISO_TIMESTAMP | DEVICE_ID | VERSION | DIRECTION | RAW_COMMAND`
 */

import type { CommandDirection } from '@chci/parser-core';
import type { HistoryEntry } from './types';

/**
 * Standard comment header prepended to exported `.chci_history` files.
 */
export const HISTORY_FILE_HEADER =
  '# Crypto Hardware Command Inspector History (.chci_history)\n# Format: ISO_TIMESTAMP | DEVICE_ID | VERSION | DIRECTION | RAW_COMMAND';

/**
 * Formats a single history entry into a one-line string.
 *
 * @param entry - History log record.
 * @returns Formatted line `ISO_TIMESTAMP | DEVICE_ID | VERSION | DIRECTION | RAW_COMMAND`.
 */
export function formatHistoryLine(entry: HistoryEntry): string {
  return `${entry.timestamp} | ${entry.deviceId} | ${entry.version} | ${entry.direction} | ${entry.raw}`;
}

/**
 * Parses a single line from a `.chci_history` file.
 * Returns null if the line is empty, a comment, or malformed.
 *
 * @param line - Raw line text.
 * @returns Parsed `HistoryEntry` or null if invalid.
 */
export function parseHistoryLine(line: string): HistoryEntry | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  // Find the first 4 pipe separator positions to preserve any pipes present in RAW_COMMAND
  const pipeIndices: number[] = [];
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '|') {
      pipeIndices.push(i);
      if (pipeIndices.length === 4) {
        break;
      }
    }
  }

  const [p0, p1, p2, p3] = pipeIndices;
  if (p0 === undefined || p1 === undefined || p2 === undefined || p3 === undefined) {
    return null;
  }

  const timestamp = trimmed.slice(0, p0).trim();
  const deviceId = trimmed.slice(p0 + 1, p1).trim();
  const version = trimmed.slice(p1 + 1, p2).trim();
  const directionStr = trimmed.slice(p2 + 1, p3).trim();
  const raw = trimmed.slice(p3 + 1).trim();

  // Validate mandatory fields
  if (!timestamp || !deviceId || !version) {
    return null;
  }

  // Validate direction strictly
  if (directionStr !== 'request' && directionStr !== 'response') {
    return null;
  }

  const direction: CommandDirection = directionStr;

  return {
    timestamp,
    deviceId,
    version,
    direction,
    raw
  };
}

/**
 * Formats an array of history entries into the full text content of a `.chci_history` file.
 *
 * @param entries - List of history log records.
 * @returns Complete file text including header comments.
 */
export function formatHistoryFile(entries: readonly HistoryEntry[]): string {
  if (entries.length === 0) {
    return `${HISTORY_FILE_HEADER}\n`;
  }
  const lines = entries.map(formatHistoryLine);
  return `${HISTORY_FILE_HEADER}\n${lines.join('\n')}\n`;
}

/**
 * Parses the full content of a `.chci_history` file into an array of valid history entries.
 * Skips comments, empty lines, and malformed records.
 *
 * @param content - Full file text content.
 * @returns Array of successfully parsed history entries.
 */
export function parseHistoryFile(content: string): HistoryEntry[] {
  if (!content || !content.trim()) {
    return [];
  }

  const lines = content.split(/\r?\n/);
  const result: HistoryEntry[] = [];

  for (const line of lines) {
    const parsed = parseHistoryLine(line);
    if (parsed) {
      result.push(parsed);
    }
  }

  return result;
}
