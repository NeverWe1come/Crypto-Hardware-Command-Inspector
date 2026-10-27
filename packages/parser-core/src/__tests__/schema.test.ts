import { describe, expect, it } from 'vitest';
import {
  CommandSpecSchema,
  DeviceSpecSchema,
  ErrorCodeSpecSchema,
  FieldSpecSchema,
  FramingConfigSchema,
  LocalizedStringSchema,
  validateDeviceSpec
} from '../schema';
import type { DeviceSpec } from '../types';

describe('Zod Specification Schemas (@chci/parser-core/schema)', () => {
  describe('LocalizedStringSchema', () => {
    it('accepts valid bilingual es/en strings', () => {
      const parsed = LocalizedStringSchema.safeParse({
        es: 'Comando de diagnóstico',
        en: 'Diagnostics command'
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects missing or empty language translations', () => {
      expect(LocalizedStringSchema.safeParse({ es: 'Hola' }).success).toBe(false);
      expect(LocalizedStringSchema.safeParse({ en: 'Hello' }).success).toBe(false);
      expect(LocalizedStringSchema.safeParse({ es: '', en: 'Hello' }).success).toBe(false);
      expect(LocalizedStringSchema.safeParse({ es: 'Hola', en: '   ' }).success).toBe(false);
    });
  });

  describe('FramingConfigSchema', () => {
    it('accepts valid delimited-positional framing config (Atalla style)', () => {
      const res = FramingConfigSchema.safeParse({
        type: 'delimited-positional',
        startDelimiter: '<',
        endDelimiter: '>',
        fieldDelimiter: '#',
        requireTrailingDelimiter: true,
        contextTagPrefix: '^'
      });
      expect(res.success).toBe(true);
    });

    it('accepts valid header-positional framing config (Thales style)', () => {
      const res = FramingConfigSchema.safeParse({
        type: 'header-positional',
        defaultHeaderLength: 4,
        minHeaderLength: 0,
        maxHeaderLength: 32,
        commandCodeLength: 2,
        responseErrorCodeLength: 2,
        successErrorCode: '00',
        endMessageDelimiter: '\x19',
        lmkIdDelimiter: '%'
      });
      expect(res.success).toBe(true);
    });

    it('accepts valid tag-value framing config (Futurex style)', () => {
      const res = FramingConfigSchema.safeParse({
        type: 'tag-value',
        startDelimiter: '[',
        endDelimiter: ']',
        pairDelimiter: ';',
        commandTag: 'AO',
        tagLength: 2,
        errorCommandCode: 'ERRO',
        errorCodeTag: 'AM',
        offendingTagTag: 'AN',
        errorMessageTag: 'BB'
      });
      expect(res.success).toBe(true);
    });

    it('rejects unknown framing type or invalid numeric constraints', () => {
      expect(
        FramingConfigSchema.safeParse({
          type: 'xml-soap',
          startDelimiter: '<',
          endDelimiter: '>'
        }).success
      ).toBe(false);

      expect(
        FramingConfigSchema.safeParse({
          type: 'header-positional',
          defaultHeaderLength: -1,
          commandCodeLength: 0,
          responseErrorCodeLength: 2,
          successErrorCode: '00'
        }).success
      ).toBe(false);
    });
  });

  describe('FieldSpecSchema', () => {
    it('accepts fixed, range, variable, delimited, and thales-key field specs', () => {
      const baseField = {
        id: 'key-field',
        name: { es: 'Clave', en: 'Key' },
        description: { es: 'Clave criptográfica', en: 'Cryptographic key' },
        encoding: 'hex-ascii' as const,
        required: true,
        sensitive: true
      };

      expect(
        FieldSpecSchema.safeParse({
          ...baseField,
          length: { kind: 'fixed', length: 16 }
        }).success
      ).toBe(true);

      expect(
        FieldSpecSchema.safeParse({
          ...baseField,
          length: { kind: 'range', min: 4, max: 32 }
        }).success
      ).toBe(true);

      expect(
        FieldSpecSchema.safeParse({
          ...baseField,
          length: { kind: 'variable' }
        }).success
      ).toBe(true);

      expect(
        FieldSpecSchema.safeParse({
          ...baseField,
          length: { kind: 'delimited', delimiter: ';' }
        }).success
      ).toBe(true);

      expect(
        FieldSpecSchema.safeParse({
          ...baseField,
          length: { kind: 'thales-key' }
        }).success
      ).toBe(true);
    });

    it('rejects range length where min > max or fixed length <= 0', () => {
      const baseField = {
        id: 'invalid-field',
        name: { es: 'Campo', en: 'Field' },
        description: { es: 'Descripción', en: 'Description' },
        encoding: 'ascii' as const,
        required: true
      };

      expect(
        FieldSpecSchema.safeParse({
          ...baseField,
          length: { kind: 'fixed', length: 0 }
        }).success
      ).toBe(false);

      expect(
        FieldSpecSchema.safeParse({
          ...baseField,
          length: { kind: 'range', min: 16, max: 8 }
        }).success
      ).toBe(false);
    });
  });

  describe('CommandSpecSchema & ErrorCodeSpecSchema', () => {
    it('validates a complete CommandSpec and ErrorCodeSpec', () => {
      const cmdResult = CommandSpecSchema.safeParse({
        id: 'thales-nc-req',
        code: 'NC',
        direction: 'request',
        pairedCode: 'ND',
        name: { es: 'Diagnóstico del HSM', en: 'HSM Diagnostics' },
        summary: { es: 'Verifica el estado del HSM', en: 'Performs HSM diagnostics check' },
        description: {
          es: 'Retorna el valor de control del LMK y versión de firmware.',
          en: 'Returns the LMK check value and firmware version.'
        },
        category: { es: 'Diagnóstico', en: 'Diagnostics' },
        fields: [],
        source: 'Thales payShield 10K Host Command Reference Manual, Ch. 3'
      });
      expect(cmdResult.success).toBe(true);

      const errResult = ErrorCodeSpecSchema.safeParse({
        code: '15',
        title: { es: 'Datos de entrada inválidos', en: 'Invalid input data' },
        description: {
          es: 'Uno de los campos tiene formato o longitud no válida.',
          en: 'One of the input fields has an invalid format or length.'
        }
      });
      expect(errResult.success).toBe(true);
    });

    it('rejects CommandSpec with empty code or missing source', () => {
      expect(
        CommandSpecSchema.safeParse({
          id: 'bad-cmd',
          code: '',
          direction: 'request',
          name: { es: 'Nombre', en: 'Name' },
          summary: { es: 'Resumen', en: 'Summary' },
          description: { es: 'Desc', en: 'Desc' },
          category: { es: 'Cat', en: 'Cat' },
          fields: [],
          source: ''
        }).success
      ).toBe(false);
    });
  });

  describe('DeviceSpecSchema & validateDeviceSpec', () => {
    const validDeviceSpec: DeviceSpec = {
      id: 'utimaco-atalla-at1000',
      name: 'Utimaco Atalla AT1000',
      vendor: 'Utimaco',
      category: 'HSM_FINANCIAL',
      status: 'supported',
      summary: {
        es: 'Módulo de seguridad de hardware financiero Atalla AT1000',
        en: 'Atalla AT1000 Financial Hardware Security Module'
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
        '8.50': {
          version: '8.50',
          label: { es: 'Firmware v8.50', en: 'Firmware v8.50' },
          commands: [
            {
              id: 'atalla-00-req',
              code: '00',
              direction: 'request',
              pairedCode: '00',
              name: { es: 'Prueba de Eco', en: 'Echo Test' },
              summary: { es: 'Eco de datos al host', en: 'Echoes data back to host' },
              description: {
                es: 'Devuelve el mensaje enviado junto al estado del HSM.',
                en: 'Returns the sent message along with HSM status.'
              },
              category: { es: 'Diagnóstico', en: 'Diagnostics' },
              fields: [
                {
                  id: 'echo-data',
                  name: { es: 'Datos de eco', en: 'Echo Data' },
                  description: { es: 'Cadena hexadecimal o ASCII', en: 'Hex or ASCII string' },
                  position: 0,
                  length: { kind: 'variable' },
                  encoding: 'ascii',
                  required: true
                }
              ],
              source: 'Atalla AT1000 Command Reference v8.50'
            }
          ],
          errorCodes: {
            '00': {
              code: '00',
              title: { es: 'Sin error', en: 'No error' },
              description: { es: 'Comando procesado con éxito', en: 'Command processed successfully' }
            }
          }
        },
        '8.60': {
          version: '8.60',
          label: { es: 'Firmware v8.60', en: 'Firmware v8.60' },
          extends: '8.50',
          commands: [],
          errorCodes: {}
        }
      }
    };

    it('accepts a valid DeviceSpec and returns typed data via validateDeviceSpec', () => {
      const parsed = DeviceSpecSchema.safeParse(validDeviceSpec);
      expect(parsed.success).toBe(true);
      expect(() => validateDeviceSpec(validDeviceSpec)).not.toThrow();
    });

    it('rejects a DeviceSpec when defaultVersion does not exist in versions map', () => {
      const brokenSpec = {
        ...validDeviceSpec,
        defaultVersion: '9.99'
      };
      const parsed = DeviceSpecSchema.safeParse(brokenSpec);
      expect(parsed.success).toBe(false);
    });

    it('rejects a DeviceSpec when a version extends a non-existent base version', () => {
      const brokenExtendsSpec: DeviceSpec = {
        ...validDeviceSpec,
        versions: {
          ...validDeviceSpec.versions,
          '8.60': {
            version: '8.60',
            label: { es: 'Firmware v8.60', en: 'Firmware v8.60' },
            extends: '7.00',
            commands: [],
            errorCodes: {}
          }
        }
      };
      const parsed = DeviceSpecSchema.safeParse(brokenExtendsSpec);
      expect(parsed.success).toBe(false);
    });

    it('rejects a DeviceSpec with cyclic version inheritance', () => {
      const cyclicSpec: DeviceSpec = {
        ...validDeviceSpec,
        versions: {
          '8.50': {
            ...validDeviceSpec.versions['8.50']!,
            extends: '8.60'
          },
          '8.60': {
            ...validDeviceSpec.versions['8.60']!,
            extends: '8.50'
          }
        }
      };
      const parsed = DeviceSpecSchema.safeParse(cyclicSpec);
      expect(parsed.success).toBe(false);
    });
  });
});
