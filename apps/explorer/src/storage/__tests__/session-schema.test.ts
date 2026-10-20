/**
 * @packageDocumentation
 * Unit tests for session JSON export schemas, Zod validation, and serialization (`@chci/explorer`).
 */

import { describe, expect, it } from 'vitest';
import {
  CommandDirectionSchema,
  CommandEntrySchema,
  exportSessionToJson,
  SavedSessionSchema,
  SessionExportSchema,
  validateAndParseSessionJson,
  WorkspaceStateSchema,
  WorkspaceTabSchema
} from '../session-schema';
import type { SavedSession, SessionExport } from '../types';

describe('Session Zod Schema & Serialization (chci-session-v1.json)', () => {
  const validSession: SavedSession = {
    id: 'session_test_123',
    name: 'Sesión de Pruebas Producción - HSMs',
    createdAt: '2026-10-20T18:00:00.000Z',
    updatedAt: '2026-10-20T19:00:00.000Z',
    state: {
      locale: 'es',
      theme: 'dark',
      activeTabId: 'tab_atalla_1',
      tabs: [
        {
          id: 'tab_atalla_1',
          deviceId: 'utimaco-atalla-at1000',
          version: '8.60',
          commands: [
            {
              id: 'cmd_1',
              raw: '<31#1#1#K1#K2#>',
              version: '8.60',
              direction: 'request',
              linkedCommandId: 'cmd_2'
            },
            {
              id: 'cmd_2',
              raw: '<32#00#01020304#>',
              version: '8.60',
              direction: 'response',
              linkedCommandId: 'cmd_1'
            }
          ],
          activeCommandId: 'cmd_1'
        },
        {
          id: 'tab_thales_1',
          deviceId: 'thales-payshield-10k',
          version: '2.3',
          headerLength: 6,
          commands: [
            {
              id: 'cmd_3',
              raw: '000000 00AABBCCDD',
              version: '2.3',
              direction: 'response',
              linkedCommandId: null
            }
          ],
          activeCommandId: 'cmd_3'
        }
      ],
      catalogSearchQuery: 'atalla',
      selectedCategory: 'HSM_FINANCIAL'
    }
  };

  describe('Zod Sub-Schemas Validation', () => {
    it('validates CommandDirectionSchema strictly with request and response', () => {
      expect(CommandDirectionSchema.safeParse('request').success).toBe(true);
      expect(CommandDirectionSchema.safeParse('response').success).toBe(true);
      expect(CommandDirectionSchema.safeParse('input').success).toBe(false);
      expect(CommandDirectionSchema.safeParse('output').success).toBe(false);
      expect(CommandDirectionSchema.safeParse('REQUEST').success).toBe(false);
      expect(CommandDirectionSchema.safeParse('').success).toBe(false);
    });

    it('validates CommandEntrySchema with required and optional fields', () => {
      const validCmd = {
        id: 'cmd_1',
        raw: '<31#1#>',
        version: '8.60',
        direction: 'request',
        linkedCommandId: null
      };
      expect(CommandEntrySchema.safeParse(validCmd).success).toBe(true);

      // Missing raw is invalid
      expect(CommandEntrySchema.safeParse({ ...validCmd, raw: undefined }).success).toBe(false);

      // Empty ID is invalid
      expect(CommandEntrySchema.safeParse({ ...validCmd, id: '' }).success).toBe(false);

      // Invalid direction is invalid
      expect(CommandEntrySchema.safeParse({ ...validCmd, direction: 'invalid' }).success).toBe(
        false
      );
    });

    it('validates WorkspaceTabSchema including headerLength constraints', () => {
      const validTab = validSession.state.tabs[0]!;
      expect(WorkspaceTabSchema.safeParse(validTab).success).toBe(true);

      const thalesTab = validSession.state.tabs[1]!;
      expect(WorkspaceTabSchema.safeParse(thalesTab).success).toBe(true);

      // Negative headerLength is rejected
      expect(WorkspaceTabSchema.safeParse({ ...thalesTab, headerLength: -1 }).success).toBe(false);

      // Non-integer headerLength is rejected
      expect(WorkspaceTabSchema.safeParse({ ...thalesTab, headerLength: 4.5 }).success).toBe(false);
    });

    it('validates WorkspaceStateSchema with locale, theme, and categories', () => {
      expect(WorkspaceStateSchema.safeParse(validSession.state).success).toBe(true);

      // Invalid locale
      expect(
        WorkspaceStateSchema.safeParse({ ...validSession.state, locale: 'de' }).success
      ).toBe(false);

      // Invalid theme
      expect(
        WorkspaceStateSchema.safeParse({ ...validSession.state, theme: 'solarized' }).success
      ).toBe(false);

      // Invalid category filter
      expect(
        WorkspaceStateSchema.safeParse({ ...validSession.state, selectedCategory: 'NON_EXISTENT' })
          .success
      ).toBe(false);
    });

    it('validates SavedSessionSchema and SessionExportSchema directly', () => {
      expect(SavedSessionSchema.safeParse(validSession).success).toBe(true);

      const validExportPayload = {
        schemaVersion: 1,
        exportedAt: '2026-10-20T19:00:00.000Z',
        session: validSession
      };
      expect(SessionExportSchema.safeParse(validExportPayload).success).toBe(true);

      // Rejects invalid schemaVersion on SessionExportSchema
      expect(
        SessionExportSchema.safeParse({ ...validExportPayload, schemaVersion: 99 }).success
      ).toBe(false);
    });
  });

  describe('SessionExportSchema & Serialization', () => {
    it('serializes a complete saved session to a valid JSON string', () => {
      const json = exportSessionToJson(validSession);
      expect(typeof json).toBe('string');

      const parsed = JSON.parse(json) as SessionExport;
      expect(parsed.schemaVersion).toBe(1);
      expect(parsed.session.id).toBe(validSession.id);
      expect(parsed.session.name).toBe(validSession.name);
      expect(parsed.session.state.tabs).toHaveLength(2);
      expect(parsed.exportedAt).toBeDefined();
    });

    it('successfully validates and parses an exported session JSON string', () => {
      const json = exportSessionToJson(validSession);
      const result = validateAndParseSessionJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.schemaVersion).toBe(1);
        expect(result.data.session.id).toBe(validSession.id);
        expect(result.data.session.state.tabs[0]?.commands).toHaveLength(2);
        expect(result.data.session.state.tabs[1]?.headerLength).toBe(6);
      }
    });

    it('preserves Unicode characters and emoji in session name and command payloads', () => {
      const sessionWithUnicode: SavedSession = {
        ...validSession,
        name: 'Prueba de Criptografía 🔐 — Utimaco & Thales',
        state: {
          ...validSession.state,
          tabs: [
            {
              ...validSession.state.tabs[0]!,
              commands: [
                {
                  id: 'cmd_uni',
                  raw: '<31#Texto con acentos y caracteres especiales: áéíóú ñ ␙#>',
                  version: '8.60',
                  direction: 'request',
                  linkedCommandId: null
                }
              ]
            }
          ]
        }
      };

      const json = exportSessionToJson(sessionWithUnicode);
      const result = validateAndParseSessionJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.session.name).toBe('Prueba de Criptografía 🔐 — Utimaco & Thales');
        expect(result.data.session.state.tabs[0]?.commands[0]?.raw).toContain('áéíóú ñ ␙');
      }
    });
  });

  describe('Rejection of Corrupt / Malformed Inputs', () => {
    it('rejects empty or whitespace-only json string', () => {
      const emptyResult = validateAndParseSessionJson('');
      expect(emptyResult.success).toBe(false);
      if (!emptyResult.success) {
        expect(emptyResult.error).toMatch(/vacío|no contiene datos/i);
      }

      const whitespaceResult = validateAndParseSessionJson('   \n\t   ');
      expect(whitespaceResult.success).toBe(false);
    });

    it('rejects malformed syntax JSON strings gracefully without throwing', () => {
      const syntaxErrorResult = validateAndParseSessionJson('{ "schemaVersion": 1, broken json }');
      expect(syntaxErrorResult.success).toBe(false);
      if (!syntaxErrorResult.success) {
        expect(syntaxErrorResult.error).toMatch(/sintaxis json/i);
      }
    });

    it('rejects payloads with wrong or unsupported schemaVersion', () => {
      const badVersionPayload = {
        schemaVersion: 2,
        exportedAt: '2026-10-20T19:00:00.000Z',
        session: validSession
      };

      const result = validateAndParseSessionJson(JSON.stringify(badVersionPayload));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/schemaVersion/i);
      }
    });

    it('rejects payloads where direction is not request or response', () => {
      const corruptPayload = {
        schemaVersion: 1,
        exportedAt: '2026-10-20T19:00:00.000Z',
        session: {
          ...validSession,
          state: {
            ...validSession.state,
            tabs: [
              {
                ...validSession.state.tabs[0]!,
                commands: [
                  {
                    id: 'cmd_bad',
                    raw: '<31#1#>',
                    version: '8.60',
                    direction: 'input_direction_invalid'
                  }
                ]
              }
            ]
          }
        }
      };

      const result = validateAndParseSessionJson(JSON.stringify(corruptPayload));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/direction/i);
      }
    });

    it('rejects payload missing mandatory session identifiers or name', () => {
      const missingIdPayload = {
        schemaVersion: 1,
        exportedAt: '2026-10-20T19:00:00.000Z',
        session: {
          ...validSession,
          id: '' // empty string is rejected by min(1)
        }
      };

      const result = validateAndParseSessionJson(JSON.stringify(missingIdPayload));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/ID de sesión/i);
      }
    });

    it('rejects payload when tabs is not an array', () => {
      const corruptTabsPayload = {
        schemaVersion: 1,
        exportedAt: '2026-10-20T19:00:00.000Z',
        session: {
          ...validSession,
          state: {
            ...validSession.state,
            tabs: { 'tab-1': 'not an array' }
          }
        }
      };

      const result = validateAndParseSessionJson(JSON.stringify(corruptTabsPayload));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/tabs/i);
      }
    });
  });
});
