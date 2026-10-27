import { describe, expect, it } from 'vitest';
import { parseHeaderPositional } from '../header-positional';
import type { DeviceSpec } from '../types';

const thalesTestSpec: DeviceSpec = {
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
    minHeaderLength: 0,
    maxHeaderLength: 32,
    commandCodeLength: 2,
    responseErrorCodeLength: 2,
    successErrorCode: '00',
    endMessageDelimiter: '\x19',
    lmkIdDelimiter: '%'
  },
  versions: {
    '2.3': {
      version: '2.3',
      label: { es: 'v2.3a', en: 'v2.3a' },
      commands: [
        {
          id: 'thales-nc-req',
          code: 'NC',
          direction: 'request',
          pairedCode: 'ND',
          name: { es: 'Diagnóstico del HSM', en: 'Diagnostics' },
          summary: { es: 'Realiza prueba de diagnóstico', en: 'Performs diagnostics check' },
          description: { es: 'Comando NC.', en: 'Command NC.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          fields: [],
          source: 'Thales payShield 10K Host Command Reference v2.3, NC'
        },
        {
          id: 'thales-nd-res',
          code: 'ND',
          direction: 'response',
          pairedCode: 'NC',
          name: { es: 'Respuesta de Diagnóstico', en: 'Diagnostics Response' },
          summary: { es: 'Retorna LMK check value y versión', en: 'Returns LMK check value and version' },
          description: { es: 'Respuesta ND.', en: 'Response ND.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          fields: [
            {
              id: 'lmk-check-value',
              name: { es: 'Valor de control LMK', en: 'LMK Check Value' },
              description: { es: '16 caracteres hexadecimales', en: '16 hexadecimal characters' },
              position: 0,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true
            },
            {
              id: 'firmware-number',
              name: { es: 'Número de firmware', en: 'Firmware Number' },
              description: { es: 'Identificador de versión', en: 'Firmware release identifier' },
              position: 1,
              length: { kind: 'fixed', length: 9 },
              encoding: 'ascii',
              required: true
            }
          ],
          source: 'Thales payShield 10K Host Command Reference v2.3, ND'
        },
        {
          id: 'thales-a0-req',
          code: 'A0',
          direction: 'request',
          pairedCode: 'A1',
          name: { es: 'Generar una Clave', en: 'Generate a Key' },
          summary: { es: 'Genera una clave criptográfica', en: 'Generates a cryptographic key' },
          description: { es: 'Comando A0.', en: 'Command A0.' },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'mode',
              name: { es: 'Modo', en: 'Mode' },
              description: { es: '0=Generar, 1=Generar y exportar bajo ZMK', en: '0=Generate, 1=Generate and export under ZMK' },
              position: 0,
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true,
              enumValues: [
                { value: '0', label: { es: 'Solo generar clave', en: 'Generate key only' } },
                { value: '1', label: { es: 'Generar y exportar bajo ZMK', en: 'Generate and export under ZMK' } }
              ]
            },
            {
              id: 'key-type',
              name: { es: 'Tipo de clave', en: 'Key Type' },
              description: { es: 'Código de tipo de clave de 3 caracteres', en: '3-character key type code' },
              position: 1,
              length: { kind: 'fixed', length: 3 },
              encoding: 'hex-ascii',
              required: true
            },
            {
              id: 'key-scheme',
              name: { es: 'Esquema de clave LMK', en: 'Key Scheme (LMK)' },
              description: { es: 'Z, U, T, X, Y, S o R', en: 'Z, U, T, X, Y, S, or R' },
              position: 2,
              length: { kind: 'fixed', length: 1 },
              encoding: 'alphanumeric',
              required: true
            }
          ],
          source: 'Thales payShield 10K Host Command Reference v2.3, A0'
        },
        {
          id: 'thales-a1-res',
          code: 'A1',
          direction: 'response',
          pairedCode: 'A0',
          name: { es: 'Respuesta Generar Clave', en: 'Generate Key Response' },
          summary: { es: 'Devuelve la clave generada bajo LMK y su KCV', en: 'Returns generated key under LMK and KCV' },
          description: { es: 'Respuesta A1.', en: 'Response A1.' },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'generated-key',
              name: { es: 'Clave bajo LMK', en: 'Key under LMK' },
              description: { es: 'Clave cifrada bajo LMK', en: 'Encrypted key under LMK' },
              position: 0,
              length: { kind: 'thales-key' },
              encoding: 'ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'key-check-value',
              name: { es: 'Valor de control de clave (KCV)', en: 'Key Check Value (KCV)' },
              description: { es: '6 caracteres hexadecimales', en: '6 hexadecimal characters' },
              position: 1,
              length: { kind: 'fixed', length: 6 },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Thales payShield 10K Host Command Reference v2.3, A1'
        }
      ],
      errorCodes: {
        '00': {
          code: '00',
          title: { es: 'Sin error', en: 'No error' },
          description: { es: 'Comando exitoso', en: 'Command successful' }
        },
        '15': {
          code: '15',
          title: { es: 'Datos de entrada erróneos', en: 'Invalid input data' },
          description: {
            es: 'Datos insuficientes o caracteres no válidos en algún campo.',
            en: 'Insufficient data or invalid characters in an input field.'
          }
        }
      }
    }
  }
};

describe('parseHeaderPositional (Thales payShield 10K style)', () => {
  it('parses simple request (0000NC) and parameterized request (0001A00000U)', () => {
    const nc = parseHeaderPositional('0000NC', thalesTestSpec);
    expect(nc.valid).toBe(true);
    expect(nc.headerValue).toBe('0000');
    expect(nc.echoToken).toBe('0000');
    expect(nc.commandCode).toBe('NC');
    expect(nc.detectedDirection).toBe('request');
    expect(nc.fields).toHaveLength(0);

    const a0 = parseHeaderPositional('0001A00000U', thalesTestSpec);
    expect(a0.valid).toBe(true);
    expect(a0.headerValue).toBe('0001');
    expect(a0.commandCode).toBe('A0');
    expect(a0.detectedDirection).toBe('request');
    expect(a0.fields).toHaveLength(3);
    expect(a0.fields[0]?.rawValue).toBe('0');
    expect(a0.fields[0]?.enumMeaning?.en).toBe('Generate key only');
    expect(a0.fields[1]?.rawValue).toBe('000');
    expect(a0.fields[2]?.rawValue).toBe('U');
  });

  it('parses response frames (0000ND00... and 0001A100U32HEX...)', () => {
    const nd = parseHeaderPositional('0000ND000123456789ABCDEF1347-0900', thalesTestSpec);
    expect(nd.valid).toBe(true);
    expect(nd.headerValue).toBe('0000');
    expect(nd.commandCode).toBe('ND');
    expect(nd.detectedDirection).toBe('response');
    expect(nd.isErrorResponse).toBe(false);
    expect(nd.errorCode).toBe('00');
    expect(nd.fields).toHaveLength(2);
    expect(nd.fields[0]?.rawValue).toBe('0123456789ABCDEF');
    expect(nd.fields[1]?.rawValue).toBe('1347-0900');
  });

  describe('self-describing Thales key lengths (thales-key)', () => {
    it('parses 16H single-length hex key (16 chars)', () => {
      const key16 = '0123456789ABCDEF';
      const res = parseHeaderPositional(`0001A100${key16}A1B2C3`, thalesTestSpec);
      expect(res.valid).toBe(true);
      expect(res.fields[0]?.rawValue).toBe(key16);
      expect(res.fields[0]?.maskedValue).toBe('••••••••');
      expect(res.fields[1]?.rawValue).toBe('A1B2C3');
    });

    it('parses 32H bare double-length hex key (32 chars)', () => {
      const key32 = '0123456789ABCDEF0123456789ABCDEF';
      const res = parseHeaderPositional(`0001A100${key32}A1B2C3`, thalesTestSpec);
      expect(res.valid).toBe(true);
      expect(res.fields[0]?.rawValue).toBe(key32);
      expect(res.fields[1]?.rawValue).toBe('A1B2C3');
    });

    it('parses Z+16H (17 chars), U+32H (33 chars), and T+48H (49 chars) prefixed keys', () => {
      const zKey = 'Z' + '1122334455667788';
      const zRes = parseHeaderPositional(`0001A100${zKey}F0E1D2`, thalesTestSpec);
      expect(zRes.valid).toBe(true);
      expect(zRes.fields[0]?.rawValue).toBe(zKey);
      expect(zRes.fields[1]?.rawValue).toBe('F0E1D2');

      const uKey = 'U' + '0123456789ABCDEF0123456789ABCDEF';
      const uRes = parseHeaderPositional(`0001A100${uKey}F0E1D2`, thalesTestSpec);
      expect(uRes.valid).toBe(true);
      expect(uRes.fields[0]?.rawValue).toBe(uKey);
      expect(uRes.fields[1]?.rawValue).toBe('F0E1D2');

      const tKey = 'T' + '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const tRes = parseHeaderPositional(`0001A100${tKey}F0E1D2`, thalesTestSpec);
      expect(tRes.valid).toBe(true);
      expect(tRes.fields[0]?.rawValue).toBe(tKey);
      expect(tRes.fields[1]?.rawValue).toBe('F0E1D2');
    });

    it('parses S Key Block where chars 1..4 after S specify total length (e.g. S0096... = 96 chars)', () => {
      const sKeyBlock = 'S0096' + 'A'.repeat(91); // 'S' (1) + '0096' (4) + 91 = 96 chars total
      expect(sKeyBlock).toHaveLength(96);

      const res = parseHeaderPositional(`0001A100${sKeyBlock}123456`, thalesTestSpec);
      expect(res.valid).toBe(true);
      expect(res.fields[0]?.rawValue).toBe(sKeyBlock);
      expect(res.fields[0]?.rawValue).toHaveLength(96);
      expect(res.fields[1]?.rawValue).toBe('123456');
    });

    it('parses R TR-31 Key Block where chars 1..4 after R specify total length (e.g. R0080... = 80 chars)', () => {
      const rKeyBlock = 'R0080' + 'B'.repeat(75); // 'R' (1) + '0080' (4) + 75 = 80 chars total
      expect(rKeyBlock).toHaveLength(80);

      const res = parseHeaderPositional(`0001A100${rKeyBlock}ABCDEF`, thalesTestSpec);
      expect(res.valid).toBe(true);
      expect(res.fields[0]?.rawValue).toBe(rKeyBlock);
      expect(res.fields[0]?.rawValue).toHaveLength(80);
      expect(res.fields[1]?.rawValue).toBe('ABCDEF');
    });
  });

  it('handles error response (0001A115) without requiring subsequent response fields', () => {
    const errRes = parseHeaderPositional('0001A115', thalesTestSpec);

    expect(errRes.detectedDirection).toBe('response');
    expect(errRes.commandCode).toBe('A1');
    expect(errRes.isErrorResponse).toBe(true);
    expect(errRes.errorCode).toBe('15');
    expect(errRes.errorSpec?.code).toBe('15');
    expect(errRes.fields).toHaveLength(0);
    // Should NOT emit MISSING_REQUIRED_FIELD when errorCode !== '00'
    expect(errRes.diagnostics.some((d) => d.code === 'MISSING_REQUIRED_FIELD')).toBe(false);
    expect(errRes.diagnostics.some((d) => d.code === 'ERROR_RESPONSE_CODE')).toBe(true);
  });

  it('extracts optional LMK ID (%00) and End Message Delimiter (\\x19 + trailer)', () => {
    const raw = '0001A00000U%00\x19END_TRAILER';
    const res = parseHeaderPositional(raw, thalesTestSpec);

    expect(res.valid).toBe(true);
    expect(res.lmkId).toBe('00');
    expect(res.trailer).toBe('END_TRAILER');
    expect(res.fields).toHaveLength(3);
    expect(res.segments.some((s) => s.role === 'lmk-id' && s.rawValue === '%00')).toBe(true);
    expect(res.segments.some((s) => s.role === 'trailer' && s.rawValue === 'END_TRAILER')).toBe(
      true
    );
  });

  it('handles empty input cleanly', () => {
    const res = parseHeaderPositional('', thalesTestSpec);
    expect(res.valid).toBe(false);
    expect(res.diagnostics.some((d) => d.code === 'EMPTY_INPUT')).toBe(true);
  });

  it('flags frame shorter than header and command code', () => {
    const res = parseHeaderPositional('00', thalesTestSpec);
    expect(res.valid).toBe(false);
    expect(res.diagnostics.some((d) => d.code === 'MALFORMED_FRAME')).toBe(true);
  });

  it('flags missing required fields and invalid encoding', () => {
    const resMissing = parseHeaderPositional('0001A00', thalesTestSpec);
    expect(resMissing.valid).toBe(false);
    expect(resMissing.diagnostics.some((d) => d.code === 'MISSING_REQUIRED_FIELD')).toBe(true);

    const resBadEncoding = parseHeaderPositional('0001A00ZZZU', thalesTestSpec);
    expect(resBadEncoding.valid).toBe(false);
    expect(resBadEncoding.diagnostics.some((d) => d.code === 'INVALID_FIELD_ENCODING')).toBe(true);
  });

  it('detects corrupt Thales key block header and invalid enum value', () => {
    const resCorruptKey = parseHeaderPositional('0001A100SXXXX123456', thalesTestSpec);
    expect(resCorruptKey.valid).toBe(false);
    expect(resCorruptKey.diagnostics.some((d) => d.code === 'INVALID_FIELD_LENGTH')).toBe(true);

    const resTruncatedZKey = parseHeaderPositional('0001A100Z123', thalesTestSpec);
    expect(resTruncatedZKey.valid).toBe(false);
    expect(resTruncatedZKey.diagnostics.some((d) => d.code === 'INVALID_FIELD_LENGTH')).toBe(true);

    const resBadEnum = parseHeaderPositional('0001A09000U', thalesTestSpec);
    expect(resBadEnum.valid).toBe(false);
    expect(resBadEnum.diagnostics.some((d) => d.code === 'INVALID_ENUM_VALUE')).toBe(true);
  });

  it('detects unparsed trailing unexpected bytes (EXTRA_UNEXPECTED_FIELD)', () => {
    const resTrailing = parseHeaderPositional('0000NCEXTRA_JUNK', thalesTestSpec);
    expect(resTrailing.valid).toBe(false);
    expect(resTrailing.diagnostics.some((d) => d.code === 'EXTRA_UNEXPECTED_FIELD')).toBe(true);
  });

  it('throws when called with incompatible framing type', () => {
    const atallaFramingSpec = {
      ...thalesTestSpec,
      framing: {
        type: 'delimited-positional' as const,
        startDelimiter: '<',
        endDelimiter: '>',
        fieldDelimiter: '#'
      }
    };
    expect(() => parseHeaderPositional('0000NC', atallaFramingSpec as unknown as DeviceSpec)).toThrow(
      /incompatible framing type/
    );
  });

  it('supports delimited and range field specs in header-positional frames', () => {
    const delimitedSpec: DeviceSpec = {
      ...thalesTestSpec,
      versions: {
        '2.3': {
          ...thalesTestSpec.versions['2.3']!,
          commands: [
            {
              id: 'thales-delim-cmd',
              code: 'ZZ',
              direction: 'request',
              name: { es: 'Delim Test', en: 'Delim Test' },
              summary: { es: 'Delim Test', en: 'Delim Test' },
              description: { es: 'Delim Test', en: 'Delim Test' },
              category: { es: 'Test', en: 'Test' },
              fields: [
                {
                  id: 'range-field',
                  name: { es: 'Range', en: 'Range' },
                  description: { es: 'Range', en: 'Range' },
                  position: 0,
                  length: { kind: 'range', min: 2, max: 4 },
                  encoding: 'decimal',
                  required: true
                },
                {
                  id: 'delim-field',
                  name: { es: 'Delim', en: 'Delim' },
                  description: { es: 'Delim', en: 'Delim' },
                  position: 1,
                  length: { kind: 'delimited', delimiter: ';' },
                  encoding: 'ascii',
                  required: true
                }
              ],
              source: 'Manual'
            }
          ]
        }
      }
    };

    const res = parseHeaderPositional('0000ZZ1234TEXT;', delimitedSpec);
    expect(res.valid).toBe(true);
    expect(res.fields[0]?.rawValue).toBe('1234');
    expect(res.fields[1]?.rawValue).toBe('TEXT');
  });
});
