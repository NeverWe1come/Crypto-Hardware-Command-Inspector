/**
 * @packageDocumentation
 * Unit tests for plain text `.chci_history` file formatting and parsing (`@chci/explorer`).
 */

import { describe, expect, it } from 'vitest';
import {
  formatHistoryFile,
  formatHistoryLine,
  HISTORY_FILE_HEADER,
  parseHistoryFile,
  parseHistoryLine
} from '../history-format';
import type { HistoryEntry } from '../types';

describe('History Format Serializer & Parser (.chci_history)', () => {
  const sampleEntryRequest: HistoryEntry = {
    timestamp: '2026-10-20T19:00:00.000Z',
    deviceId: 'utimaco-atalla-at1000',
    version: '8.60',
    direction: 'request',
    raw: '<31#1#1#K1#K2#>'
  };

  const sampleEntryResponse: HistoryEntry = {
    timestamp: '2026-10-20T19:01:00.000Z',
    deviceId: 'thales-payshield-10k',
    version: '2.3',
    direction: 'response',
    raw: '000000 00AABBCCDD'
  };

  describe('formatHistoryLine', () => {
    it('formats an entry into the exact specification format', () => {
      const line = formatHistoryLine(sampleEntryRequest);
      expect(line).toBe(
        '2026-10-20T19:00:00.000Z | utimaco-atalla-at1000 | 8.60 | request | <31#1#1#K1#K2#>'
      );
    });

    it('formats a response entry with space-containing raw command', () => {
      const line = formatHistoryLine(sampleEntryResponse);
      expect(line).toBe(
        '2026-10-20T19:01:00.000Z | thales-payshield-10k | 2.3 | response | 000000 00AABBCCDD'
      );
    });

    it('formats raw command containing pipe characters without corrupting fields', () => {
      const entryWithPipe: HistoryEntry = {
        timestamp: '2026-10-20T19:05:00.000Z',
        deviceId: 'futurex-excrypt',
        version: '7.6.1',
        direction: 'request',
        raw: '[AOECHO;AGval1 | val2 | val3;]'
      };

      const line = formatHistoryLine(entryWithPipe);
      expect(line).toBe(
        '2026-10-20T19:05:00.000Z | futurex-excrypt | 7.6.1 | request | [AOECHO;AGval1 | val2 | val3;]'
      );
    });
  });

  describe('parseHistoryLine', () => {
    it('parses a valid request line correctly', () => {
      const line =
        '2026-10-20T19:00:00.000Z | utimaco-atalla-at1000 | 8.60 | request | <31#1#1#K1#K2#>';
      const parsed = parseHistoryLine(line);

      expect(parsed).toEqual(sampleEntryRequest);
    });

    it('parses a valid response line correctly', () => {
      const line =
        '2026-10-20T19:01:00.000Z | thales-payshield-10k | 2.3 | response | 000000 00AABBCCDD';
      const parsed = parseHistoryLine(line);

      expect(parsed).toEqual(sampleEntryResponse);
    });

    it('handles extra leading and trailing whitespace around delimiters', () => {
      const line =
        '   2026-10-20T19:00:00.000Z    |   utimaco-atalla-at1000   |   8.60   |   request   |   <31#1#>   ';
      const parsed = parseHistoryLine(line);

      expect(parsed).toEqual({
        timestamp: '2026-10-20T19:00:00.000Z',
        deviceId: 'utimaco-atalla-at1000',
        version: '8.60',
        direction: 'request',
        raw: '<31#1#>'
      });
    });

    it('preserves pipe characters embedded inside the raw command string', () => {
      const line =
        '2026-10-20T19:05:00.000Z | futurex-excrypt | 7.6.1 | request | [AOECHO;AGval1 | val2 | val3;]';
      const parsed = parseHistoryLine(line);

      expect(parsed).toEqual({
        timestamp: '2026-10-20T19:05:00.000Z',
        deviceId: 'futurex-excrypt',
        version: '7.6.1',
        direction: 'request',
        raw: '[AOECHO;AGval1 | val2 | val3;]'
      });
    });

    it('returns null for comment lines starting with #', () => {
      expect(parseHistoryLine('# This is a comment')).toBeNull();
      expect(parseHistoryLine('   # Indented comment')).toBeNull();
      expect(parseHistoryLine(HISTORY_FILE_HEADER.split('\n')[0]!)).toBeNull();
    });

    it('returns null for empty lines or whitespace-only lines', () => {
      expect(parseHistoryLine('')).toBeNull();
      expect(parseHistoryLine('   ')).toBeNull();
      expect(parseHistoryLine('\t\n')).toBeNull();
    });

    it('returns null for truncated lines with fewer than 5 columns', () => {
      expect(parseHistoryLine('2026-10-20T19:00:00.000Z | utimaco-atalla-at1000')).toBeNull();
      expect(
        parseHistoryLine('2026-10-20T19:00:00.000Z | utimaco-atalla-at1000 | 8.60 | request')
      ).toBeNull();
      expect(parseHistoryLine('just some random text without pipes')).toBeNull();
    });

    it('returns null when direction is invalid or unexpected', () => {
      expect(
        parseHistoryLine(
          '2026-10-20T19:00:00.000Z | utimaco-atalla-at1000 | 8.60 | input | <31#1#>'
        )
      ).toBeNull();
      expect(
        parseHistoryLine(
          '2026-10-20T19:00:00.000Z | utimaco-atalla-at1000 | 8.60 | output | <31#1#>'
        )
      ).toBeNull();
      expect(
        parseHistoryLine(
          '2026-10-20T19:00:00.000Z | utimaco-atalla-at1000 | 8.60 | REQUEST | <31#1#>'
        )
      ).toBeNull();
    });

    it('returns null when required fields are empty strings', () => {
      // Empty timestamp
      expect(
        parseHistoryLine('   | utimaco-atalla-at1000 | 8.60 | request | <31#1#>')
      ).toBeNull();
      // Empty deviceId
      expect(
        parseHistoryLine('2026-10-20T19:00:00.000Z | | 8.60 | request | <31#1#>')
      ).toBeNull();
      // Empty version
      expect(
        parseHistoryLine('2026-10-20T19:00:00.000Z | utimaco-atalla-at1000 | | request | <31#1#>')
      ).toBeNull();
    });

    it('allows an empty raw command payload', () => {
      const parsed = parseHistoryLine(
        '2026-10-20T19:00:00.000Z | utimaco-atalla-at1000 | 8.60 | request | '
      );
      expect(parsed).toEqual({
        timestamp: '2026-10-20T19:00:00.000Z',
        deviceId: 'utimaco-atalla-at1000',
        version: '8.60',
        direction: 'request',
        raw: ''
      });
    });
  });

  describe('formatHistoryFile and parseHistoryFile', () => {
    it('formats empty list with just the header comment', () => {
      const content = formatHistoryFile([]);
      expect(content).toContain(HISTORY_FILE_HEADER);
      expect(parseHistoryFile(content)).toEqual([]);
    });

    it('formats and parses multiple history entries preserving ordering', () => {
      const entries: HistoryEntry[] = [
        sampleEntryRequest,
        sampleEntryResponse,
        {
          timestamp: '2026-10-20T19:10:00.000Z',
          deviceId: 'futurex-excrypt',
          version: '7.6.1',
          direction: 'request',
          raw: '[AOECHO;AGping;]'
        }
      ];

      const formatted = formatHistoryFile(entries);
      const parsed = parseHistoryFile(formatted);

      expect(parsed).toEqual(entries);
      expect(parsed).toHaveLength(3);
    });

    it('parses content containing Windows CRLF line endings', () => {
      const crlfContent = `${HISTORY_FILE_HEADER}\r\n${formatHistoryLine(sampleEntryRequest)}\r\n${formatHistoryLine(sampleEntryResponse)}\r\n`;
      const parsed = parseHistoryFile(crlfContent);

      expect(parsed).toEqual([sampleEntryRequest, sampleEntryResponse]);
    });

    it('ignores arbitrary comments and blank lines interspersed throughout the file', () => {
      const mixedContent = `
# Initial session header
# Generated automatically

${formatHistoryLine(sampleEntryRequest)}

# Mid-file note from engineer
# Another comment

${formatHistoryLine(sampleEntryResponse)}

      `;

      const parsed = parseHistoryFile(mixedContent);
      expect(parsed).toEqual([sampleEntryRequest, sampleEntryResponse]);
    });

    it('gracefully skips malformed lines while still parsing valid lines', () => {
      const corruptedContent = `
${formatHistoryLine(sampleEntryRequest)}
malformed line with no pipes
${formatHistoryLine(sampleEntryResponse)}
2026-10-20T19:00:00.000Z | broken | line |
      `;

      const parsed = parseHistoryFile(corruptedContent);
      expect(parsed).toEqual([sampleEntryRequest, sampleEntryResponse]);
    });

    it('returns empty array when content is empty or only whitespace', () => {
      expect(parseHistoryFile('')).toEqual([]);
      expect(parseHistoryFile('   \n  \t  \n  ')).toEqual([]);
    });
  });
});
