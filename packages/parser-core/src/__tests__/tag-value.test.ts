import { describe, expect, it } from 'vitest';
import { parseTagValue } from '../tag-value';
import type { DeviceSpec } from '../types';

const futurexTestSpec: DeviceSpec = {
  id: 'futurex-excrypt',
  name: 'Futurex Excrypt',
  vendor: 'Futurex',
  category: 'HSM_FINANCIAL',
  status: 'supported',
  summary: {
    es: 'HSM Financiero Futurex Excrypt',
    en: 'Futurex Excrypt Financial HSM'
  },
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
        id: 'echo-tag-ag',
        tag: 'AG',
        name: { es: 'Datos de Eco (AG)', en: 'Echo Data (AG)' },
        description: {
          es: 'Tag universal devuelto sin cambios en la respuesta.',
          en: 'Universal echo tag returned unchanged in the response.'
        },
        length: { kind: 'range', min: 1, max: 256 },
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
          id: 'futurex-echo-req',
          code: 'ECHO',
          direction: 'request',
          pairedCode: 'ECHO',
          name: { es: 'Mensaje de Eco (Petición)', en: 'Echo Message (Request)' },
          summary: { es: 'Verifica conectividad con el HSM', en: 'Verifies connectivity with HSM' },
          description: { es: 'Comando ECHO.', en: 'Command ECHO.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          fields: [],
          source: 'Futurex Excrypt Developer Guide v7.6.1, ECHO'
        },
        {
          id: 'futurex-echo-res',
          code: 'ECHO',
          direction: 'response',
          pairedCode: 'ECHO',
          name: { es: 'Mensaje de Eco (Respuesta)', en: 'Echo Message (Response)' },
          summary: { es: 'Respuesta del comando ECHO', en: 'ECHO command response' },
          description: { es: 'Respuesta ECHO.', en: 'Response ECHO.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          fields: [
            {
              id: 'status-bb',
              tag: 'BB',
              name: { es: 'Estado / Versión (BB)', en: 'Status / Version (BB)' },
              description: { es: 'Estado o código devuelto por el HSM', en: 'Status or version returned by HSM' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ],
          source: 'Futurex Excrypt Developer Guide v7.6.1, ECHO'
        },
        {
          id: 'futurex-stat-req',
          code: 'STAT',
          direction: 'request',
          pairedCode: 'STAT',
          name: { es: 'Estado del HSM', en: 'HSM Status' },
          summary: { es: 'Consulta banderas de estado', en: 'Queries status flags' },
          description: { es: 'Comando STAT con banderas vacías.', en: 'STAT command with empty flag tags.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          fields: [
            {
              id: 'flag-za',
              tag: 'ZA',
              name: { es: 'Bandera ZA', en: 'Flag ZA' },
              description: { es: 'Incluir estadísticas de red', en: 'Include network statistics' },
              length: { kind: 'variable', min: 0, max: 0 },
              encoding: 'ascii',
              required: false
            },
            {
              id: 'flag-zb',
              tag: 'ZB',
              name: { es: 'Bandera ZB', en: 'Flag ZB' },
              description: { es: 'Incluir estadísticas criptográficas', en: 'Include crypto statistics' },
              length: { kind: 'variable', min: 0, max: 0 },
              encoding: 'ascii',
              required: false
            }
          ],
          source: 'Futurex Excrypt Developer Guide v7.6.1, STAT'
        },
        {
          id: 'futurex-gpek-req',
          code: 'GPEK',
          direction: 'request',
          pairedCode: 'GPEK',
          name: { es: 'Generar Clave PEK', en: 'Generate PEK Key' },
          summary: { es: 'Genera una clave de cifrado de PIN', en: 'Generates a PIN encryption key' },
          description: { es: 'Comando GPEK.', en: 'Command GPEK.' },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'modifier-fs',
              tag: 'FS',
              name: { es: 'Modificador de función (FS)', en: 'Function Specifier (FS)' },
              description: { es: 'Modificador de 1 dígito', en: '1-digit modifier' },
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true
            }
          ],
          source: 'Futurex Excrypt Developer Guide v7.6.1, GPEK'
        }
      ],
      errorCodes: {
        '02': {
          code: '02',
          title: { es: 'Tag no válido o desconocido', en: 'Invalid or unknown tag' },
          description: {
            es: 'El comando contiene un tag no reconocido por esta función.',
            en: 'The command contains a tag not recognized by this function.'
          }
        }
      }
    }
  }
};

describe('parseTagValue (Futurex Excrypt style)', () => {
  it('parses Request [AOECHO;AGHelloFuturex;] and Response [AOECHO;AGHelloFuturex;BB4000;]', () => {
    const req = parseTagValue('[AOECHO;AGHelloFuturex;]', futurexTestSpec);
    expect(req.valid).toBe(true);
    expect(req.commandCode).toBe('ECHO');
    expect(req.detectedDirection).toBe('request');
    expect(req.matchedCommand?.id).toBe('futurex-echo-req');
    expect(req.echoToken).toBe('HelloFuturex');
    expect(req.fields).toHaveLength(1);
    expect(req.fields[0]).toMatchObject({
      id: 'echo-tag-ag',
      tag: 'AG',
      rawValue: 'HelloFuturex'
    });

    const res = parseTagValue('[AOECHO;AGHelloFuturex;BB4000;]', futurexTestSpec);
    expect(res.valid).toBe(true);
    expect(res.commandCode).toBe('ECHO');
    expect(res.detectedDirection).toBe('response');
    expect(res.matchedCommand?.id).toBe('futurex-echo-res');
    expect(res.echoToken).toBe('HelloFuturex');
    expect(res.fields).toHaveLength(2);
    expect(res.fields.find((f) => f.tag === 'BB')?.rawValue).toBe('4000');
  });

  it('supports flag-only empty-value tags ([AOSTAT;ZA;ZB;])', () => {
    const res = parseTagValue('[AOSTAT;ZA;ZB;]', futurexTestSpec);

    expect(res.valid).toBe(true);
    expect(res.commandCode).toBe('STAT');
    expect(res.fields).toHaveLength(2);
    expect(res.fields[0]).toMatchObject({
      tag: 'ZA',
      rawValue: '',
      valid: true
    });
    expect(res.fields[1]).toMatchObject({
      tag: 'ZB',
      rawValue: '',
      valid: true
    });
  });

  it('accepts universal AG echo tag on any command without emitting UNKNOWN_TAG warning', () => {
    const res = parseTagValue('[AOGPEK;FS1;AGREQ_99;]', futurexTestSpec);

    expect(res.valid).toBe(true);
    expect(res.commandCode).toBe('GPEK');
    expect(res.echoToken).toBe('REQ_99');
    expect(res.diagnostics.some((d) => d.code === 'UNKNOWN_TAG')).toBe(false);
    expect(res.fields.map((f) => f.tag)).toEqual(['FS', 'AG']);
  });

  it('parses dedicated error frame [AOERRO;AM02;ANAF;BBInvalid tag;] with isErrorResponse, errorCode, and offendingFieldOrTag', () => {
    const errRes = parseTagValue('[AOERRO;AM02;ANAF;BBInvalid tag;]', futurexTestSpec);

    expect(errRes.commandCode).toBe('ERRO');
    expect(errRes.detectedDirection).toBe('response');
    expect(errRes.isErrorResponse).toBe(true);
    expect(errRes.errorCode).toBe('02');
    expect(errRes.offendingFieldOrTag).toBe('AF');
    expect(errRes.errorSpec?.code).toBe('02');
    expect(errRes.diagnostics.some((d) => d.code === 'ERROR_RESPONSE_CODE')).toBe(true);
  });

  it('emits UNKNOWN_TAG warning diagnostic when an unrecognized tag is present', () => {
    const res = parseTagValue('[AOGPEK;FS1;ZZMystery;]', futurexTestSpec);

    const unknownDiag = res.diagnostics.find((d) => d.code === 'UNKNOWN_TAG');
    expect(unknownDiag).toBeDefined();
    expect(unknownDiag?.severity).toBe('warning');
  });

  it('emits UNCLOSED_FRAME error diagnostic when closing bracket ] is missing', () => {
    const res = parseTagValue('[AOECHO;AGHelloFuturex;', futurexTestSpec);

    expect(res.valid).toBe(false);
    expect(res.diagnostics.some((d) => d.code === 'UNCLOSED_FRAME')).toBe(true);
  });

  it('handles empty input and malformed frames', () => {
    const resEmpty = parseTagValue('', futurexTestSpec);
    expect(resEmpty.valid).toBe(false);
    expect(resEmpty.diagnostics.some((d) => d.code === 'EMPTY_INPUT')).toBe(true);

    const resNoOpen = parseTagValue('AOECHO;]', futurexTestSpec);
    expect(resNoOpen.valid).toBe(false);
    expect(resNoOpen.diagnostics.some((d) => d.code === 'MALFORMED_FRAME')).toBe(true);
  });

  it('flags invalid encoding in tag values', () => {
    const resBadEnc = parseTagValue('[AOGPEK;FSX;]', futurexTestSpec);
    expect(resBadEnc.valid).toBe(false);
    expect(resBadEnc.diagnostics.some((d) => d.code === 'INVALID_FIELD_ENCODING')).toBe(true);
  });

  it('detects missing required tags in commands', () => {
    // GPEK requires FS tag
    const resMissing = parseTagValue('[AOGPEK;]', futurexTestSpec);
    expect(resMissing.valid).toBe(false);
    expect(resMissing.diagnostics.some((d) => d.code === 'MISSING_REQUIRED_FIELD')).toBe(true);

    // GPEK with empty FS tag should also fail as MISSING_REQUIRED_FIELD
    const resEmptyTag = parseTagValue('[AOGPEK;FS;]', futurexTestSpec);
    expect(resEmptyTag.valid).toBe(false);
    expect(resEmptyTag.diagnostics.some((d) => d.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
  });

  it('detects missing command tag (AO) and sub-tag-length token', () => {
    const resNoAO = parseTagValue('[AGHello;]', futurexTestSpec);
    expect(resNoAO.valid).toBe(false);
    expect(resNoAO.diagnostics.some((d) => d.code === 'MALFORMED_FRAME')).toBe(true);

    const resSubTag = parseTagValue('[AOECHO;X;AGHello;]', futurexTestSpec);
    expect(resSubTag.valid).toBe(false);
    expect(resSubTag.diagnostics.some((d) => d.code === 'MALFORMED_FRAME')).toBe(true);
  });

  it('handles AOERRO frame without AM error code tag', () => {
    const resNoAM = parseTagValue('[AOERRO;ANAF;BBError;]', futurexTestSpec);
    expect(resNoAM.isErrorResponse).toBe(true);
    expect(resNoAM.diagnostics.some((d) => d.code === 'ERROR_RESPONSE_CODE')).toBe(true);
  });

  it('detects invalid field length in tag-value commands', () => {
    // FS is fixed length 1; FS123 is length 3
    const resBadLen = parseTagValue('[AOGPEK;FS123;]', futurexTestSpec);
    expect(resBadLen.valid).toBe(false);
    expect(resBadLen.diagnostics.some((d) => d.code === 'INVALID_FIELD_LENGTH')).toBe(true);
  });

  it('throws when called with incompatible framing type', () => {
    const headerFramingSpec = {
      ...futurexTestSpec,
      framing: {
        type: 'header-positional' as const,
        defaultHeaderLength: 4,
        commandCodeLength: 2,
        responseErrorCodeLength: 2,
        successErrorCode: '00'
      }
    };
    expect(() => parseTagValue('[AOECHO;]', headerFramingSpec as unknown as DeviceSpec)).toThrow(
      /incompatible framing type/
    );
  });
});
