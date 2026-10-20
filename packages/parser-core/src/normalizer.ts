/**
 * @packageDocumentation
 * ASCII command normalizer, control character extractor, and sensitive masking utilities.
 */

import type { ControlCharInfo, NormalizedInput } from './types';

/**
 * Standard mask placeholder string used for sensitive cryptographic material.
 */
export const MASK_PLACEHOLDER = '••••••••';

/**
 * Known ASCII control character definitions and visual representations.
 */
const CONTROL_CHAR_MAP: Readonly<Record<number, { readonly name: string; readonly symbol: string }>> = {
  0x00: { name: 'NUL', symbol: '<NUL>' },
  0x01: { name: 'SOH', symbol: '<SOH>' },
  0x02: { name: 'STX', symbol: '<STX>' },
  0x03: { name: 'ETX', symbol: '<ETX>' },
  0x04: { name: 'EOT', symbol: '<EOT>' },
  0x05: { name: 'ENQ', symbol: '<ENQ>' },
  0x06: { name: 'ACK', symbol: '<ACK>' },
  0x07: { name: 'BEL', symbol: '<BEL>' },
  0x08: { name: 'BS', symbol: '<BS>' },
  0x09: { name: 'HT', symbol: '<TAB>' },
  0x0a: { name: 'LF', symbol: '<LF>' },
  0x0b: { name: 'VT', symbol: '<VT>' },
  0x0c: { name: 'FF', symbol: '<FF>' },
  0x0d: { name: 'CR', symbol: '<CR>' },
  0x0e: { name: 'SO', symbol: '<SO>' },
  0x0f: { name: 'SI', symbol: '<SI>' },
  0x10: { name: 'DLE', symbol: '<DLE>' },
  0x11: { name: 'DC1', symbol: '<DC1>' },
  0x12: { name: 'DC2', symbol: '<DC2>' },
  0x13: { name: 'DC3', symbol: '<DC3>' },
  0x14: { name: 'DC4', symbol: '<DC4>' },
  0x15: { name: 'NAK', symbol: '<NAK>' },
  0x16: { name: 'SYN', symbol: '<SYN>' },
  0x17: { name: 'ETB', symbol: '<ETB>' },
  0x18: { name: 'CAN', symbol: '<CAN>' },
  0x19: { name: 'EM', symbol: '␙' },
  0x1a: { name: 'SUB', symbol: '<SUB>' },
  0x1b: { name: 'ESC', symbol: '<ESC>' },
  0x1c: { name: 'FS', symbol: '<FS>' },
  0x1d: { name: 'GS', symbol: '<GS>' },
  0x1e: { name: 'RS', symbol: '<RS>' },
  0x1f: { name: 'US', symbol: '<US>' },
  0x7f: { name: 'DEL', symbol: '<DEL>' }
};

/**
 * Extracts all ASCII control characters from a raw string with their exact offsets,
 * hex codes, and visual symbol representations.
 *
 * @param raw - Any raw string (without trimming).
 * @returns Array of ControlCharInfo objects for every control character found.
 */
export function detectControlChars(raw: string): readonly ControlCharInfo[] {
  const controlChars: ControlCharInfo[] = [];

  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    const entry = CONTROL_CHAR_MAP[code];
    if (entry) {
      controlChars.push({
        index: i,
        code,
        hex: `0x${code.toString(16).toUpperCase().padStart(2, '0')}`,
        name: entry.name,
        symbol: entry.symbol
      });
    }
  }

  return Object.freeze(controlChars);
}

/**
 * Normalizes a raw input command string by trimming outer whitespace (spaces, tabs, and newlines),
 * computing byte length, and extracting ASCII control characters.
 *
 * @param raw - Raw input string from the editor or terminal.
 * @returns NormalizedInput containing the cleaned string, offset shifts, and control char metadata.
 */
export function normalizeInput(raw: string): NormalizedInput {
  if (raw.length === 0) {
    return {
      original: '',
      normalized: '',
      leadingTrimmed: 0,
      trailingTrimmed: 0,
      byteLength: 0,
      charLength: 0,
      controlChars: []
    };
  }

  // Detect whitespace-only string
  if (/^[ \t\r\n]+$/.test(raw)) {
    return {
      original: raw,
      normalized: '',
      leadingTrimmed: raw.length,
      trailingTrimmed: 0,
      byteLength: 0,
      charLength: 0,
      controlChars: []
    };
  }

  const leadingMatch = raw.match(/^[ \t\r\n]+/);
  const leadingTrimmed = leadingMatch?.[0]?.length ?? 0;

  const trailingMatch = raw.match(/[ \t\r\n]+$/);
  const trailingTrimmed = trailingMatch?.[0]?.length ?? 0;

  const normalized = raw.slice(leadingTrimmed, raw.length - trailingTrimmed);
  const charLength = normalized.length;
  const byteLength = new TextEncoder().encode(normalized).length;

  const controlChars: ControlCharInfo[] = [];

  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    const entry = CONTROL_CHAR_MAP[code];
    if (entry) {
      controlChars.push({
        index: i,
        code,
        hex: `0x${code.toString(16).toUpperCase().padStart(2, '0')}`,
        name: entry.name,
        symbol: entry.symbol
      });
    }
  }

  return {
    original: raw,
    normalized,
    leadingTrimmed,
    trailingTrimmed,
    byteLength,
    charLength,
    controlChars
  };
}

/**
 * Replaces a sensitive value with the standard mask placeholder.
 * If the value is empty, it returns an empty string without masking.
 *
 * @param value - Sensitive string to mask.
 * @returns Masked representation or empty string.
 */
export function maskSensitiveValue(value: string): string {
  if (value.length === 0) {
    return '';
  }
  return MASK_PLACEHOLDER;
}
