import { describe, expect, it } from 'vitest';
import { parseDelimitedPositional } from '../delimited-positional';
import type { DeviceSpec } from '../types';

const atallaTestSpec: DeviceSpec = {
  id: 'utimaco-atalla-at1000',
  name: 'Utimaco Atalla AT1000',
  vendor: 'Utimaco',
  category: 'HSM_FINANCIAL',
  status: 'supported',
  summary: {
    es: 'HSM Financiero Utimaco Atalla AT1000',
    en: 'Utimaco Atalla AT1000 Financial HSM'
  },
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
          id: 'atalla-00-req',
          code: '00',
          direction: 'request',
          pairedCode: '00',
          name: { es: 'Prueba de Eco (Petición)', en: 'Echo Test (Request)' },
          summary: { es: 'Envía datos de prueba al HSM', en: 'Sends echo test data to HSM' },
          description: { es: 'Petición de eco.', en: 'Echo request.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          fields: [
            {
              id: 'echo-data',
              name: { es: 'Mensaje de eco', en: 'Echo Message' },
              description: { es: 'Datos a devolver', en: 'Data to echo back' },
              position: 0,
              length: { kind: 'range', min: 1, max: 64 },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Atalla AT1000 Manual v8.60, Cmd 00'
        },
        {
          id: 'atalla-00-res',
          code: '00',
          direction: 'response',
          pairedCode: '00',
          name: { es: 'Prueba de Eco (Respuesta)', en: 'Echo Test (Response)' },
          summary: { es: 'Respuesta de eco y estado', en: 'Echo and status response' },
          description: { es: 'Respuesta del comando 00.', en: 'Command 00 response.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          fields: [
            {
              id: 'status-word',
              name: { es: 'Palabra de estado', en: 'Status Word' },
              description: { es: 'Código EEFFVV (Error, Campo, Versión)', en: 'EEFFVV status word' },
              position: 0,
              length: { kind: 'fixed', length: 6 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'echo-data',
              name: { es: 'Mensaje de eco', en: 'Echo Message' },
              description: { es: 'Datos devueltos', en: 'Echoed data' },
              position: 1,
              length: { kind: 'range', min: 1, max: 64 },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Atalla AT1000 Manual v8.60, Cmd 00'
        },
        {
          id: 'atalla-10-req',
          code: '10',
          direction: 'request',
          pairedCode: '20',
          name: { es: 'Generar Clave de Trabajo', en: 'Generate Working Key' },
          summary: { es: 'Genera una clave bajo AKB', en: 'Generates a working key under AKB' },
          description: { es: 'Genera clave de trabajo.', en: 'Generates working key.' },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'key-usage',
              name: { es: 'Uso de clave', en: 'Key Usage' },
              description: { es: 'Indicador de tipo de clave', en: 'Key type indicator' },
              position: 0,
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true,
              enumValues: [
                { value: '1', label: { es: 'Clave de PIN (PEK)', en: 'PIN Encryption Key (PEK)' } },
                { value: '2', label: { es: 'Clave de Datos (DEK)', en: 'Data Encryption Key (DEK)' } }
              ]
            },
            {
              id: 'master-key',
              name: { es: 'Clave Maestra AKB', en: 'Master Key AKB' },
              description: { es: 'Criptograma AKB maestro', en: 'Master AKB cryptogram' },
              position: 1,
              length: { kind: 'range', min: 4, max: 128 },
              encoding: 'ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'key-length',
              name: { es: 'Longitud de clave', en: 'Key Length' },
              description: { es: '16, 32 o 48 caracteres hex', en: '16, 32, or 48 hex chars' },
              position: 2,
              length: { kind: 'fixed', length: 2 },
              encoding: 'decimal',
              required: true,
              enumValues: [
                { value: '16', label: { es: 'Simple (64 bits)', en: 'Single length (64-bit)' } },
                { value: '32', label: { es: 'Doble (128 bits)', en: 'Double length (128-bit)' } }
              ]
            }
          ],
          source: 'Atalla AT1000 Manual v8.60, Cmd 10'
        },
        {
          id: 'atalla-20-res',
          code: '20',
          direction: 'response',
          pairedCode: '10',
          name: { es: 'Respuesta Generar Clave', en: 'Generate Working Key Response' },
          summary: { es: 'Retorna la nueva clave y KCV', en: 'Returns generated key and KCV' },
          description: { es: 'Respuesta al comando 10.', en: 'Response to command 10.' },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'generated-key-akb',
              name: { es: 'Clave generada (AKB)', en: 'Generated Key (AKB)' },
              description: { es: 'Criptograma AKB generado', en: 'Generated AKB cryptogram' },
              position: 0,
              length: { kind: 'range', min: 4, max: 128 },
              encoding: 'ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'check-digits',
              name: { es: 'Dígitos de control (KCV)', en: 'Check Digits (KCV)' },
              description: { es: '4 dígitos hexadecimales', en: '4 hex check digits' },
              position: 1,
              length: { kind: 'fixed', length: 4 },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Atalla AT1000 Manual v8.60, Cmd 20'
        },
        {
          id: 'atalla-31-sub1-req',
          code: '31',
          subCode: '1',
          subCodeFieldIndex: 0,
          direction: 'request',
          pairedCode: '41',
          name: { es: 'Traducir PIN ANSI (Sub 1)', en: 'Translate PIN ANSI (Sub 1)' },
          summary: { es: 'Traducción de PIN formato ANSI X9.8', en: 'ANSI X9.8 PIN block translation' },
          description: { es: 'Subcomando 1.', en: 'Subcommand 1.' },
          category: { es: 'Procesamiento de PIN', en: 'PIN Processing' },
          fields: [
            {
              id: 'pin-format',
              name: { es: 'Formato de PIN', en: 'PIN Format' },
              description: { es: 'Subcomando de formato', en: 'Format subcommand' },
              position: 0,
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'pin-block',
              name: { es: 'PIN Block entrante', en: 'Incoming PIN Block' },
              description: { es: 'PIN block de 16 hex', en: '16-hex PIN block' },
              position: 1,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            }
          ],
          source: 'Atalla AT1000 Manual v8.60, Cmd 31'
        },
        {
          id: 'atalla-31-sub7-req',
          code: '31',
          subCode: '7',
          subCodeFieldIndex: 0,
          direction: 'request',
          pairedCode: '41',
          name: { es: 'Traducir PIN ISO-3 (Sub 7)', en: 'Translate PIN ISO-3 (Sub 7)' },
          summary: { es: 'Traducción de PIN formato ISO-3', en: 'ISO-3 PIN block translation' },
          description: { es: 'Subcomando 7.', en: 'Subcommand 7.' },
          category: { es: 'Procesamiento de PIN', en: 'PIN Processing' },
          fields: [
            {
              id: 'pin-format',
              name: { es: 'Formato de PIN', en: 'PIN Format' },
              description: { es: 'Subcomando de formato', en: 'Format subcommand' },
              position: 0,
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'pin-block',
              name: { es: 'PIN Block ISO-3', en: 'ISO-3 PIN Block' },
              description: { es: 'PIN block de 16 hex', en: '16-hex PIN block' },
              position: 1,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'pan-token',
              name: { es: 'PAN de 12 dígitos', en: '12-digit PAN' },
              description: { es: '12 dígitos del PAN', en: '12 rightmost PAN digits' },
              position: 2,
              length: { kind: 'fixed', length: 12 },
              encoding: 'decimal',
              required: true
            }
          ],
          source: 'Atalla AT1000 Manual v8.60, Cmd 31'
        }
      ],
      errorCodes: {
        '00': {
          code: '00',
          title: { es: 'Éxito', en: 'Success' },
          description: { es: 'Operación completada sin errores', en: 'Operation completed without errors' }
        },
        '02': {
          code: '02',
          title: { es: 'Carácter no válido o longitud incorrecta', en: 'Invalid character or bad length' },
          description: {
            es: 'El parámetro indicado contiene caracteres no permitidos o longitud errónea.',
            en: 'The indicated parameter contains invalid characters or bad length.'
          }
        }
      }
    }
  }
};

describe('parseDelimitedPositional (Utimaco Atalla AT1000 style)', () => {
  it('parses a standard request frame (<00#1234#>) with exact character offsets', () => {
    const res = parseDelimitedPositional('<00#1234#>', atallaTestSpec);

    expect(res.valid).toBe(true);
    expect(res.commandCode).toBe('00');
    expect(res.detectedDirection).toBe('request');
    expect(res.matchedCommand?.id).toBe('atalla-00-req');
    expect(res.isErrorResponse).toBe(false);
    expect(res.fields).toHaveLength(1);
    expect(res.fields[0]).toMatchObject({
      id: 'echo-data',
      rawValue: '1234',
      decodedValue: '1234',
      maskedValue: '1234',
      start: 4,
      end: 8,
      valid: true
    });

    // Verify segments cover '<', '00', '#', '1234', '#', '>'
    const cmdSegment = res.segments.find((s) => s.role === 'command-code');
    expect(cmdSegment).toMatchObject({ rawValue: '00', start: 1, end: 3 });
  });

  it('parses a multi-field request (<10#1#1AKB#16#>) with enum resolution and sensitive masking', () => {
    const res = parseDelimitedPositional('<10#1#1AKB#16#>', atallaTestSpec);

    expect(res.valid).toBe(true);
    expect(res.commandCode).toBe('10');
    expect(res.detectedDirection).toBe('request');
    expect(res.fields).toHaveLength(3);

    expect(res.fields[0]?.rawValue).toBe('1');
    expect(res.fields[0]?.enumMeaning?.en).toBe('PIN Encryption Key (PEK)');

    expect(res.fields[1]?.rawValue).toBe('1AKB');
    expect(res.fields[1]?.sensitive).toBe(true);
    expect(res.fields[1]?.maskedValue).toBe('••••••••');

    expect(res.fields[2]?.rawValue).toBe('16');
    expect(res.fields[2]?.enumMeaning?.en).toBe('Single length (64-bit)');
  });

  it('parses a standard response frame (<00#000086#1234#> and <20#1AKB9999#ABCD#>)', () => {
    const echoRes = parseDelimitedPositional('<00#000086#1234#>', atallaTestSpec);

    expect(echoRes.valid).toBe(true);
    expect(echoRes.detectedDirection).toBe('response');
    expect(echoRes.matchedCommand?.id).toBe('atalla-00-res');
    expect(echoRes.isErrorResponse).toBe(false);
    expect(echoRes.errorCode).toBe('00');
    expect(echoRes.offendingFieldOrTag).toBe('00');
    expect(echoRes.firmwareVersionToken).toBe('86');
    expect(echoRes.fields).toHaveLength(2);

    const keyRes = parseDelimitedPositional('<20#1AKB9999#ABCD#>', atallaTestSpec);
    expect(keyRes.valid).toBe(true);
    expect(keyRes.detectedDirection).toBe('response');
    expect(keyRes.matchedCommand?.id).toBe('atalla-20-res');
    expect(keyRes.fields[0]?.maskedValue).toBe('••••••••');
    expect(keyRes.fields[1]?.rawValue).toBe('ABCD');
  });

  it('disambiguates subcommands based on field 0 value (command 31 with field 1 = 1 vs 7)', () => {
    const sub1 = parseDelimitedPositional('<31#1#0123456789ABCDEF#>', atallaTestSpec);
    expect(sub1.valid).toBe(true);
    expect(sub1.subCode).toBe('1');
    expect(sub1.matchedCommand?.id).toBe('atalla-31-sub1-req');
    expect(sub1.fields).toHaveLength(2);

    const sub7 = parseDelimitedPositional(
      '<31#7#0123456789ABCDEF#123456789012#>',
      atallaTestSpec
    );
    expect(sub7.valid).toBe(true);
    expect(sub7.subCode).toBe('7');
    expect(sub7.matchedCommand?.id).toBe('atalla-31-sub7-req');
    expect(sub7.fields).toHaveLength(3);
  });

  it('parses an Atalla error response (<00#020186#0000#>) extracting error code 02, offending field 01, and version 86', () => {
    const res = parseDelimitedPositional('<00#020186#0000#>', atallaTestSpec);

    expect(res.detectedDirection).toBe('response');
    expect(res.isErrorResponse).toBe(true);
    expect(res.errorCode).toBe('02');
    expect(res.offendingFieldOrTag).toBe('01');
    expect(res.firmwareVersionToken).toBe('86');
    expect(res.errorSpec?.code).toBe('02');
    expect(res.errorSpec?.title.en).toContain('Invalid character');
    expect(res.diagnostics.some((d) => d.code === 'ERROR_RESPONSE_CODE')).toBe(true);
  });

  it('extracts optional context tag suffix (^MYCTX#) before closing >', () => {
    const res = parseDelimitedPositional('<00#1234#^MYCTX#>', atallaTestSpec);

    expect(res.valid).toBe(true);
    expect(res.echoToken).toBe('MYCTX');
    expect(res.fields).toHaveLength(1);
    expect(res.fields[0]?.rawValue).toBe('1234');

    const ctxSegment = res.segments.find((s) => s.role === 'context-tag');
    expect(ctxSegment).toBeDefined();
    expect(ctxSegment?.rawValue).toBe('^MYCTX');
  });

  describe('malformed frames and field validation edge cases', () => {
    it('flags missing start delimiter < or missing closing #>', () => {
      const noStart = parseDelimitedPositional('00#1234#>', atallaTestSpec);
      expect(noStart.valid).toBe(false);
      expect(noStart.diagnostics.some((d) => d.code === 'MALFORMED_FRAME')).toBe(true);

      const noEnd = parseDelimitedPositional('<00#1234#', atallaTestSpec);
      expect(noEnd.valid).toBe(false);
      expect(noEnd.diagnostics.some((d) => d.code === 'UNCLOSED_FRAME')).toBe(true);

      const noTrailingHash = parseDelimitedPositional('<00#1234>', atallaTestSpec);
      expect(noTrailingHash.valid).toBe(false);
      expect(noTrailingHash.diagnostics.some((d) => d.code === 'MALFORMED_FRAME')).toBe(true);
    });

    it('flags missing required fields and extra unexpected fields', () => {
      const missingFields = parseDelimitedPositional('<10#1#>', atallaTestSpec);
      expect(missingFields.valid).toBe(false);
      expect(missingFields.diagnostics.some((d) => d.code === 'MISSING_REQUIRED_FIELD')).toBe(true);

      const extraFields = parseDelimitedPositional('<00#1234#EXTRA1#EXTRA2#>', atallaTestSpec);
      expect(extraFields.valid).toBe(false);
      expect(extraFields.diagnostics.some((d) => d.code === 'EXTRA_UNEXPECTED_FIELD')).toBe(true);
    });

    it('flags invalid hex/decimal encoding and invalid enum values', () => {
      const badHex = parseDelimitedPositional('<00#ZZZZ#>', atallaTestSpec);
      expect(badHex.valid).toBe(false);
      expect(badHex.diagnostics.some((d) => d.code === 'INVALID_FIELD_ENCODING')).toBe(true);

      const badEnum = parseDelimitedPositional('<10#9#1AKB#24#>', atallaTestSpec);
      expect(badEnum.valid).toBe(false);
      expect(badEnum.diagnostics.some((d) => d.code === 'INVALID_ENUM_VALUE')).toBe(true);
    });

    it('handles empty input and empty tokens', () => {
      const resEmpty = parseDelimitedPositional('', atallaTestSpec);
      expect(resEmpty.valid).toBe(false);
      expect(resEmpty.diagnostics.some((d) => d.code === 'EMPTY_INPUT')).toBe(true);

      const resNoTokens = parseDelimitedPositional('<#>', atallaTestSpec);
      expect(resNoTokens.valid).toBe(false);
    });

    it('flags empty required fields as MISSING_REQUIRED_FIELD', () => {
      // Command 10 requires field 0 (key usage)
      const resEmptyRequired = parseDelimitedPositional('<10##1AKB#16#>', atallaTestSpec);
      expect(resEmptyRequired.valid).toBe(false);
      expect(resEmptyRequired.diagnostics.some((d) => d.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
    });

    it('flags invalid field length as INVALID_FIELD_LENGTH', () => {
      // Key length in command 10 is fixed 2 chars ('16' or '32'). Providing 4 chars:
      const resBadLen = parseDelimitedPositional('<10#1#1AKB#1699#>', atallaTestSpec);
      expect(resBadLen.valid).toBe(false);
      expect(resBadLen.diagnostics.some((d) => d.code === 'INVALID_FIELD_LENGTH')).toBe(true);
    });

    it('preserves and breaks down all fields even for unregistered or extra-field commands', () => {
      // Unregistered command should still extract all delimited fields
      const resUnregistered = parseDelimitedPositional('<UNKNOWN#VAL1#VAL2#VAL3#VAL4#>', atallaTestSpec);
      expect(resUnregistered.commandCode).toBe('UNKNOWN');
      expect(resUnregistered.fields.length).toBe(4);
      expect(resUnregistered.fields[0]?.rawValue).toBe('VAL1');
      expect(resUnregistered.fields[1]?.rawValue).toBe('VAL2');
      expect(resUnregistered.fields[2]?.rawValue).toBe('VAL3');
      expect(resUnregistered.fields[3]?.rawValue).toBe('VAL4');
      expect(resUnregistered.fields[0]?.name.es).toBe('Campo 1');

      // Command with extra fields beyond spec should also include all fields
      const resExtra = parseDelimitedPositional('<00#1234#EXTRA1#EXTRA2#>', atallaTestSpec);
      expect(resExtra.fields.length).toBe(3);
      expect(resExtra.fields[0]?.id).toBe('echo-data');
      expect(resExtra.fields[1]?.rawValue).toBe('EXTRA1');
      expect(resExtra.fields[1]?.name.es).toBe('Campo Extra 2');
      expect(resExtra.fields[2]?.rawValue).toBe('EXTRA2');
      expect(resExtra.fields[2]?.name.es).toBe('Campo Extra 3');
    });

    it('throws when called with incompatible framing type', () => {
      const headerFramingSpec = {
        ...atallaTestSpec,
        framing: {
          type: 'header-positional' as const,
          defaultHeaderLength: 4,
          commandCodeLength: 2,
          responseErrorCodeLength: 2,
          successErrorCode: '00'
        }
      };
      expect(() => parseDelimitedPositional('<00#1234#>', headerFramingSpec as unknown as DeviceSpec)).toThrow(
        /incompatible framing type/
      );
    });
  });
});
