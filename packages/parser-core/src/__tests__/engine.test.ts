import { describe, expect, it } from 'vitest';
import { correlateCommands, parseCommand, resolveDeviceVersion } from '../engine';
import type { DeviceSpec } from '../types';

const multiVersionThalesSpec: DeviceSpec = {
  id: 'thales-payshield-10k',
  name: 'Thales payShield 10K',
  vendor: 'Thales',
  category: 'HSM_FINANCIAL',
  status: 'supported',
  summary: {
    es: 'HSM Financiero Thales payShield 10K',
    en: 'Thales payShield 10K Financial HSM'
  },
  defaultVersion: '2.3',
  framing: {
    type: 'header-positional',
    defaultHeaderLength: 4,
    commandCodeLength: 2,
    responseErrorCodeLength: 2,
    successErrorCode: '00',
    endMessageDelimiter: '\x19',
    lmkIdDelimiter: '%'
  },
  versions: {
    '1.9': {
      version: '1.9',
      label: { es: 'v1.9a', en: 'v1.9a' },
      commands: [
        {
          id: 'thales-nc-req',
          code: 'NC',
          direction: 'request',
          pairedCode: 'ND',
          name: { es: 'Diagnóstico', en: 'Diagnostics' },
          summary: { es: 'Diagnóstico del HSM', en: 'HSM Diagnostics' },
          description: { es: 'Comando NC v1.9.', en: 'Command NC v1.9.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          fields: [],
          source: 'Thales v1.9 Manual'
        },
        {
          id: 'thales-nd-res',
          code: 'ND',
          direction: 'response',
          pairedCode: 'NC',
          name: { es: 'Respuesta Diagnóstico', en: 'Diagnostics Response' },
          summary: { es: 'Respuesta ND', en: 'ND Response' },
          description: { es: 'Respuesta ND v1.9.', en: 'Response ND v1.9.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          fields: [
            {
              id: 'lmk-check',
              name: { es: 'LMK Check', en: 'LMK Check' },
              description: { es: '16H', en: '16H' },
              position: 0,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Thales v1.9 Manual'
        }
      ],
      errorCodes: {
        '00': {
          code: '00',
          title: { es: 'Sin error', en: 'No error' },
          description: { es: 'OK', en: 'OK' }
        },
        '15': {
          code: '15',
          title: { es: 'Datos inválidos', en: 'Invalid input data' },
          description: { es: 'Error 15', en: 'Error 15' }
        }
      }
    },
    '2.3': {
      version: '2.3',
      label: { es: 'v2.3a', en: 'v2.3a' },
      extends: '1.9',
      commands: [
        {
          id: 'thales-a0-req',
          code: 'A0',
          direction: 'request',
          pairedCode: 'A1',
          name: { es: 'Generar Clave', en: 'Generate Key' },
          summary: { es: 'Genera clave', en: 'Generates key' },
          description: { es: 'A0 v2.3', en: 'A0 v2.3' },
          category: { es: 'Claves', en: 'Keys' },
          fields: [
            {
              id: 'mode',
              name: { es: 'Modo', en: 'Mode' },
              description: { es: 'Modo de generación', en: 'Generation mode' },
              position: 0,
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true,
              enumValues: [
                { value: '0', label: { es: 'Solo generar', en: 'Generate only' } },
                { value: '1', label: { es: 'Generar y exportar', en: 'Generate and export' } }
              ]
            },
            {
              id: 'clear-comp',
              name: { es: 'Componente sensible', en: 'Sensitive Component' },
              description: { es: 'Clave en claro', en: 'Clear key' },
              position: 1,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            }
          ],
          source: 'Thales v2.3 Manual'
        },
        {
          id: 'thales-a1-res',
          code: 'A1',
          direction: 'response',
          pairedCode: 'A0',
          name: { es: 'Respuesta Generar Clave', en: 'Generate Key Response' },
          summary: { es: 'Respuesta A1', en: 'A1 Response' },
          description: { es: 'A1 v2.3', en: 'A1 v2.3' },
          category: { es: 'Claves', en: 'Keys' },
          fields: [
            {
              id: 'key-under-lmk',
              name: { es: 'Clave bajo LMK', en: 'Key under LMK' },
              description: { es: 'Clave cifrada', en: 'Encrypted key' },
              position: 0,
              length: { kind: 'thales-key' },
              encoding: 'ascii',
              required: true,
              sensitive: true
            }
          ],
          source: 'Thales v2.3 Manual'
        }
      ],
      errorCodes: {
        '68': {
          code: '68',
          title: { es: 'Comando deshabilitado', en: 'Command disabled' },
          description: { es: 'El comando está deshabilitado.', en: 'The command is disabled.' }
        }
      }
    }
  }
};

const futurexSpec: DeviceSpec = {
  id: 'futurex-excrypt',
  name: 'Futurex Excrypt',
  vendor: 'Futurex',
  category: 'HSM_FINANCIAL',
  status: 'supported',
  summary: { es: 'Futurex Excrypt', en: 'Futurex Excrypt' },
  defaultVersion: '7.6.1',
  framing: {
    type: 'tag-value',
    startDelimiter: '[',
    endDelimiter: ']',
    pairDelimiter: ';',
    commandTag: 'AO',
    tagLength: 2,
    errorCommandCode: 'ERRO',
    errorCodeTag: 'AM',
    offendingTagTag: 'AN',
    errorMessageTag: 'BB',
    universalTags: [
      {
        id: 'ag-echo',
        tag: 'AG',
        name: { es: 'Eco', en: 'Echo' },
        description: { es: 'Eco', en: 'Echo' },
        length: { kind: 'variable' },
        encoding: 'ascii',
        required: false
      }
    ]
  },
  versions: {
    '7.6.1': {
      version: '7.6.1',
      label: { es: 'v7.6.1', en: 'v7.6.1' },
      commands: [
        {
          id: 'fx-echo-req',
          code: 'ECHO',
          direction: 'request',
          pairedCode: 'ECHO',
          name: { es: 'Eco', en: 'Echo' },
          summary: { es: 'Eco', en: 'Echo' },
          description: { es: 'Eco', en: 'Echo' },
          category: { es: 'Diag', en: 'Diag' },
          fields: [],
          source: 'Futurex Guide'
        },
        {
          id: 'fx-echo-res',
          code: 'ECHO',
          direction: 'response',
          pairedCode: 'ECHO',
          name: { es: 'Eco Resp', en: 'Echo Resp' },
          summary: { es: 'Eco Resp', en: 'Echo Resp' },
          description: { es: 'Eco Resp', en: 'Echo Resp' },
          category: { es: 'Diag', en: 'Diag' },
          fields: [
            {
              id: 'bb-status',
              tag: 'BB',
              name: { es: 'Estado', en: 'Status' },
              description: { es: 'Estado', en: 'Status' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ],
          source: 'Futurex Guide'
        }
      ],
      errorCodes: {}
    }
  }
};

const atallaSpec: DeviceSpec = {
  id: 'utimaco-atalla-at1000',
  name: 'Utimaco Atalla AT1000',
  vendor: 'Utimaco',
  category: 'HSM_FINANCIAL',
  status: 'supported',
  summary: { es: 'Atalla AT1000', en: 'Atalla AT1000' },
  defaultVersion: '8.60',
  framing: {
    type: 'delimited-positional',
    startDelimiter: '<',
    endDelimiter: '>',
    fieldDelimiter: '#',
    requireTrailingDelimiter: true,
    contextTagPrefix: '^'
  },
  versions: {
    '8.60': {
      version: '8.60',
      label: { es: 'v8.60', en: 'v8.60' },
      commands: [
        {
          id: 'at-00-req',
          code: '00',
          direction: 'request',
          pairedCode: '00',
          name: { es: 'Eco', en: 'Echo' },
          summary: { es: 'Eco', en: 'Echo' },
          description: { es: 'Eco', en: 'Echo' },
          category: { es: 'Diag', en: 'Diag' },
          fields: [
            {
              id: 'data',
              name: { es: 'Datos', en: 'Data' },
              description: { es: 'Datos', en: 'Data' },
              position: 0,
              length: { kind: 'variable' },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Atalla Manual'
        },
        {
          id: 'at-00-res',
          code: '00',
          direction: 'response',
          pairedCode: '00',
          name: { es: 'Eco Resp', en: 'Echo Resp' },
          summary: { es: 'Eco Resp', en: 'Echo Resp' },
          description: { es: 'Eco Resp', en: 'Echo Resp' },
          category: { es: 'Diag', en: 'Diag' },
          fields: [
            {
              id: 'status',
              name: { es: 'Estado', en: 'Status' },
              description: { es: 'Estado', en: 'Status' },
              position: 0,
              length: { kind: 'fixed', length: 6 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'data',
              name: { es: 'Datos', en: 'Data' },
              description: { es: 'Datos', en: 'Data' },
              position: 1,
              length: { kind: 'variable' },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Atalla Manual'
        }
      ],
      errorCodes: {}
    }
  }
};

describe('Engine Entry Points (@chci/parser-core/engine)', () => {
  describe('resolveDeviceVersion', () => {
    it('merges inherited commands and errorCodes across extends chain', () => {
      const resolved = resolveDeviceVersion(multiVersionThalesSpec, '2.3');

      expect(resolved.version).toBe('2.3');
      // Should contain NC/ND from 1.9 AND A0/A1 from 2.3
      const codes = resolved.commands.map((c) => c.code);
      expect(codes).toContain('NC');
      expect(codes).toContain('ND');
      expect(codes).toContain('A0');
      expect(codes).toContain('A1');

      // Should merge errorCodes from 1.9 ('00', '15') and 2.3 ('68')
      expect(Object.keys(resolved.errorCodes)).toEqual(expect.arrayContaining(['00', '15', '68']));
    });

    it('throws when requested version does not exist', () => {
      expect(() => resolveDeviceVersion(multiVersionThalesSpec, '9.99')).toThrow(
        /does not exist in device/
      );
    });

    it('detects and throws on cyclic version inheritance', () => {
      const cyclicSpec: DeviceSpec = {
        ...multiVersionThalesSpec,
        versions: {
          '1.9': {
            ...multiVersionThalesSpec.versions['1.9']!,
            extends: '2.3'
          },
          '2.3': {
            ...multiVersionThalesSpec.versions['2.3']!,
            extends: '1.9'
          }
        }
      };
      expect(() => resolveDeviceVersion(cyclicSpec, '2.3')).toThrow(
        /Cyclic version inheritance detected/
      );
    });
  });

  describe('parseCommand', () => {
    it('auto-detects direction, masks sensitive fields, resolves enumMeaning, and links pairedCommand', () => {
      const res = parseCommand('0001A000123456789ABCDEF', multiVersionThalesSpec);

      expect(res.valid).toBe(true);
      expect(res.detectedDirection).toBe('request');
      expect(res.matchedCommand?.code).toBe('A0');
      expect(res.pairedCommand?.code).toBe('A1');

      expect(res.fields[0]?.rawValue).toBe('0');
      expect(res.fields[0]?.enumMeaning?.en).toBe('Generate only');

      expect(res.fields[1]?.rawValue).toBe('0123456789ABCDEF');
      expect(res.fields[1]?.sensitive).toBe(true);
      expect(res.fields[1]?.maskedValue).toBe('••••••••');
    });

    it('emits DIRECTION_MISMATCH warning when expectedDirection conflicts with detectedDirection', () => {
      const res = parseCommand('0000ND000123456789ABCDEF', multiVersionThalesSpec, {
        expectedDirection: 'request'
      });

      expect(res.detectedDirection).toBe('response');
      expect(res.expectedDirection).toBe('request');
      const mismatch = res.diagnostics.find((d) => d.code === 'DIRECTION_MISMATCH');
      expect(mismatch).toBeDefined();
      expect(mismatch?.severity).toBe('warning');
    });

    it('returns EMPTY_INPUT error diagnostic for empty or whitespace-only input', () => {
      const res = parseCommand('   ', multiVersionThalesSpec);
      expect(res.valid).toBe(false);
      expect(res.diagnostics.some((d) => d.code === 'EMPTY_INPUT')).toBe(true);
    });
  });

  describe('correlateCommands', () => {
    it('verifies Thales command/response pair compatibility and header echo match', () => {
      const req = parseCommand('0042NC', multiVersionThalesSpec);
      const resOk = parseCommand('0042ND000123456789ABCDEF', multiVersionThalesSpec);
      const resBadHeader = parseCommand('0099ND000123456789ABCDEF', multiVersionThalesSpec);
      const resWrongCmd = parseCommand(
        '0042A100U0123456789ABCDEF0123456789ABCDEF',
        multiVersionThalesSpec
      );

      const corrOk = correlateCommands(req, resOk, multiVersionThalesSpec);
      expect(corrOk.isCorrelated).toBe(true);
      expect(corrOk.commandPairMatches).toBe(true);
      expect(corrOk.echoMatches).toBe(true);
      expect(corrOk.isErrorResponse).toBe(false);

      const corrBadHeader = correlateCommands(req, resBadHeader, multiVersionThalesSpec);
      expect(corrBadHeader.commandPairMatches).toBe(true);
      expect(corrBadHeader.echoMatches).toBe(false);
      expect(corrBadHeader.isCorrelated).toBe(false);

      const corrWrongCmd = correlateCommands(req, resWrongCmd, multiVersionThalesSpec);
      expect(corrWrongCmd.commandPairMatches).toBe(false);
      expect(corrWrongCmd.isCorrelated).toBe(false);
    });

    it('verifies Futurex AG echo match and Atalla ^Context echo match', () => {
      const fxReq = parseCommand('[AOECHO;AGTX_777;]', futurexSpec);
      const fxResOk = parseCommand('[AOECHO;AGTX_777;BB4000;]', futurexSpec);
      const fxResMismatch = parseCommand('[AOECHO;AGTX_888;BB4000;]', futurexSpec);

      expect(correlateCommands(fxReq, fxResOk, futurexSpec).echoMatches).toBe(true);
      expect(correlateCommands(fxReq, fxResOk, futurexSpec).isCorrelated).toBe(true);
      expect(correlateCommands(fxReq, fxResMismatch, futurexSpec).echoMatches).toBe(false);
      expect(correlateCommands(fxReq, fxResMismatch, futurexSpec).isCorrelated).toBe(false);

      const atReq = parseCommand('<00#1234#^MYCTX#>', atallaSpec);
      const atResOk = parseCommand('<00#000086#1234#^MYCTX#>', atallaSpec);
      const atResMismatch = parseCommand('<00#000086#1234#^OTHER#>', atallaSpec);

      expect(correlateCommands(atReq, atResOk, atallaSpec).echoMatches).toBe(true);
      expect(correlateCommands(atReq, atResOk, atallaSpec).isCorrelated).toBe(true);
      expect(correlateCommands(atReq, atResMismatch, atallaSpec).echoMatches).toBe(false);
      expect(correlateCommands(atReq, atResMismatch, atallaSpec).isCorrelated).toBe(false);
    });

    it('surfaces response error codes in correlation results', () => {
      const req = parseCommand('0001A000123456789ABCDEF', multiVersionThalesSpec);
      const errRes = parseCommand('0001A115', multiVersionThalesSpec);

      const corr = correlateCommands(req, errRes, multiVersionThalesSpec);
      expect(corr.commandPairMatches).toBe(true);
      expect(corr.echoMatches).toBe(true);
      expect(corr.isErrorResponse).toBe(true);
      expect(corr.errorCode).toBe('15');
      expect(corr.errorSpec?.code).toBe('15');
    });
  });
});
