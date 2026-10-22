/**
 * @packageDocumentation
 * Parser implementation for header-positional command framing (e.g., Thales payShield 10K).
 */

import { resolveDeviceVersion } from './engine';
import { maskSensitiveValue, normalizeInput } from './normalizer';
import { validateEncoding, validateFieldLength } from './validation';
import type {
  CommandDirection,
  CommandSpec,
  DeviceSpec,
  ErrorCodeSpec,
  FieldSpec,
  FrameSegment,
  ParseCommandOptions,
  ParseDiagnostic,
  ParsedField,
  ParseResult
} from './types';

/**
 * Resolves the dynamic length of a self-describing Thales cryptographic key.
 *
 * Supports Thales Key Blocks ('S' + 4-digit length), TR-31 Key Blocks ('R' + 4-digit length),
 * single-length keys ('Z'), double-length keys ('U', 'X'), triple-length keys ('T', 'Y'),
 * and raw legacy hex representations.
 *
 * @param text - Full frame text being parsed.
 * @param offset - Character index where the key field begins.
 * @param remainingAfterOffset - Remaining characters available in frame after offset.
 * @returns Total character length of the key cryptogram, or null if key format header is invalid/truncated.
 */
function resolveThalesKeyLength(
  text: string,
  offset: number,
  remainingAfterOffset: number
): number | null {
  if (remainingAfterOffset <= 0) return 0;

  const firstChar = text[offset];

  // Thales Key Block ('S' + 4-digit total length)
  if (firstChar === 'S') {
    if (remainingAfterOffset < 5) return null;
    const lenStr = text.slice(offset + 1, offset + 5);
    const parsedLen = parseInt(lenStr, 10);
    if (!isNaN(parsedLen) && parsedLen >= 5 && parsedLen <= remainingAfterOffset) {
      return parsedLen;
    }
    return null;
  }

  // TR-31 Key Block ('R' + 4-digit total length)
  if (firstChar === 'R') {
    if (remainingAfterOffset < 5) return null;
    const lenStr = text.slice(offset + 1, offset + 5);
    const parsedLen = parseInt(lenStr, 10);
    if (!isNaN(parsedLen) && parsedLen >= 5 && parsedLen <= remainingAfterOffset) {
      return parsedLen;
    }
    return null;
  }

  // Single length prefixed ('Z' + 16 hex = 17)
  if (firstChar === 'Z') {
    return remainingAfterOffset >= 17 ? 17 : null;
  }

  // Double length prefixed ('U' or 'X' + 32 hex = 33)
  if (firstChar === 'U' || firstChar === 'X') {
    return remainingAfterOffset >= 33 ? 33 : null;
  }

  // Triple length prefixed ('T' or 'Y' + 48 hex = 49)
  if (firstChar === 'T' || firstChar === 'Y') {
    return remainingAfterOffset >= 49 ? 49 : null;
  }

  // Unprefixed raw hex: 32 chars (double) or 16 chars (single)
  if (remainingAfterOffset >= 32) {
    if (remainingAfterOffset >= 38 || remainingAfterOffset === 32) {
      return 32;
    }
  }

  if (remainingAfterOffset >= 16) {
    return 16;
  }

  return null;
}

/**
 * Parses a header-positional command string (e.g., Thales payShield 10K).
 *
 * Handles optional user-defined or wire transport headers (e.g., 4 or 12 hex characters),
 * followed by a fixed 2-character command code (e.g., `NC`, `A0`, `CW`), optional mode/sub-commands,
 * and positional parameters with support for dynamic key-length resolution.
 *
 * @param raw - Raw ASCII command string.
 * @param spec - Hardware device specification containing framing rules and command schemas.
 * @param options - Optional parsing flags (expected direction, header length override, firmware version).
 * @returns Fully structured {@link ParseResult} with extracted fields, error codes, and frame segments.
 *
 * @example
 * ```typescript
 * const result = parseHeaderPositional('0000NC', thalesSpec, { headerLength: 4 });
 * console.log(result.commandCode); // "NC"
 * ```
 */
export function parseHeaderPositional(
  raw: string,
  spec: DeviceSpec,
  options?: ParseCommandOptions
): ParseResult {
  const normalized = normalizeInput(raw);
  const text = normalized.normalized;

  if (spec.framing.type !== 'header-positional') {
    throw new Error(
      `Device "${spec.id}" has incompatible framing type "${spec.framing.type}", expected "header-positional"`
    );
  }
  const framing = spec.framing;
  const versionSpec = resolveDeviceVersion(spec, options?.version);

  const diagnostics: ParseDiagnostic[] = [];
  const segments: FrameSegment[] = [];
  const fields: ParsedField[] = [];

  let valid = true;

  if (text.length === 0) {
    return {
      deviceId: spec.id,
      version: versionSpec.version,
      raw,
      normalized,
      framingType: 'header-positional',
      detectedDirection: 'unknown',
      expectedDirection: options?.expectedDirection,
      commandCode: null,
      matchedCommand: null,
      pairedCommand: null,
      isErrorResponse: false,
      errorCode: null,
      errorSpec: null,
      segments: [],
      fields: [],
      diagnostics: [
        {
          code: 'EMPTY_INPUT',
          severity: 'error',
          message: {
            es: 'El comando introducido está vacío.',
            en: 'The provided command input is empty.'
          }
        }
      ],
      valid: false
    };
  }

  // Determine clamped header length
  const rawHeaderLength =
    options?.headerLength !== undefined
      ? options.headerLength
      : framing.defaultHeaderLength;
  const headerLength = Math.max(0, rawHeaderLength);

  if (text.length < headerLength + framing.commandCodeLength) {
    diagnostics.push({
      code: 'MALFORMED_FRAME',
      severity: 'error',
      message: {
        es: `La longitud del comando (${text.length}) es inferior a la cabecera y código (${headerLength + framing.commandCodeLength}).`,
        en: `Command length (${text.length}) is shorter than header and command code (${headerLength + framing.commandCodeLength}).`
      }
    });
    return {
      deviceId: spec.id,
      version: versionSpec.version,
      raw,
      normalized,
      framingType: 'header-positional',
      detectedDirection: 'unknown',
      expectedDirection: options?.expectedDirection,
      commandCode: null,
      matchedCommand: null,
      pairedCommand: null,
      isErrorResponse: false,
      errorCode: null,
      errorSpec: null,
      segments: [],
      fields: [],
      diagnostics,
      valid: false
    };
  }

  let offset = 0;

  // Extract Header
  let headerValue: string | null = null;
  if (headerLength > 0) {
    headerValue = text.slice(0, headerLength);
    segments.push({
      id: 'seg-header',
      role: 'header',
      label: { es: 'Cabecera de Mensaje', en: 'Message Header' },
      rawValue: headerValue,
      start: 0,
      end: headerLength
    });
    offset = headerLength;
  } else {
    headerValue = '';
  }

  // Extract Command Code
  const cmdCodeStart = offset;
  const cmdCodeEnd = offset + framing.commandCodeLength;
  const commandCode = text.slice(cmdCodeStart, cmdCodeEnd);
  offset = cmdCodeEnd;

  segments.push({
    id: 'seg-command-code',
    role: 'command-code',
    label: { es: 'Código de Comando', en: 'Command Code' },
    rawValue: commandCode,
    start: cmdCodeStart,
    end: cmdCodeEnd
  });

  // Check if response and extract Error Code
  let isErrorResponse = false;
  let errorCode: string | null = null;
  let errorSpec: ErrorCodeSpec | null = null;

  // Find matching command in versionSpec
  const matchedCommand =
    (options?.expectedDirection
      ? versionSpec.commands.find(
          (c) => c.code === commandCode && c.direction === options.expectedDirection
        )
      : null) ??
    versionSpec.commands.find((c) => c.code === commandCode) ??
    null;

  if (!matchedCommand && !isErrorResponse) {
    valid = false;
    diagnostics.push({
      code: 'UNKNOWN_COMMAND',
      severity: 'error',
      message: {
        es: `Comando '${commandCode}' no reconocido para este dispositivo.`,
        en: `Command '${commandCode}' not recognized for this device.`
      },
      start: cmdCodeStart,
      end: cmdCodeEnd
    });
  }

  const detectedDirection: CommandDirection =
    matchedCommand?.direction ?? options?.expectedDirection ?? 'request';

  // Find paired command
  let pairedCommand: CommandSpec | null = null;
  if (matchedCommand?.pairedCode) {
    const pairedDir =
      matchedCommand.direction === 'request' ? 'response' : 'request';
    pairedCommand =
      versionSpec.commands.find(
        (c) => c.code === matchedCommand.pairedCode && c.direction === pairedDir
      ) ?? null;
  }

  // Check for End-of-Message delimiter and Trailer
  let trailer: string | null = null;
  let bodyEnd = text.length;

  if (framing.endMessageDelimiter) {
    const delimIdx = text.indexOf(framing.endMessageDelimiter, offset);
    if (delimIdx !== -1) {
      bodyEnd = delimIdx;
      trailer = text.slice(delimIdx + framing.endMessageDelimiter.length);
      segments.push({
        id: 'seg-trailer',
        role: 'trailer',
        label: { es: 'Trailer de Mensaje', en: 'Message Trailer' },
        rawValue: trailer,
        start: delimIdx + framing.endMessageDelimiter.length,
        end: text.length
      });
    }
  }

  // Check for optional LMK ID (%XX)
  let lmkId: string | null = null;
  if (framing.lmkIdDelimiter) {
    const lmkIdx = text.indexOf(framing.lmkIdDelimiter, offset);
    if (lmkIdx !== -1 && lmkIdx < bodyEnd) {
      lmkId = text.slice(lmkIdx + framing.lmkIdDelimiter.length, lmkIdx + framing.lmkIdDelimiter.length + 2);
      segments.push({
        id: 'seg-lmk-id',
        role: 'lmk-id',
        label: { es: 'Identificador LMK', en: 'LMK Identifier' },
        rawValue: text.slice(lmkIdx, lmkIdx + framing.lmkIdDelimiter.length + 2),
        start: lmkIdx,
        end: lmkIdx + framing.lmkIdDelimiter.length + 2
      });
      bodyEnd = lmkIdx;
    }
  }

  // If response, extract Error Code
  if (detectedDirection === 'response') {
    const errLen = framing.responseErrorCodeLength;
    if (offset + errLen <= bodyEnd) {
      errorCode = text.slice(offset, offset + errLen);
      segments.push({
        id: 'seg-error-code',
        role: 'error-code',
        label: { es: 'Código de Error', en: 'Error Code' },
        rawValue: errorCode,
        start: offset,
        end: offset + errLen
      });
      offset += errLen;

      if (errorCode !== framing.successErrorCode) {
        isErrorResponse = true;
        errorSpec = versionSpec.errorCodes[errorCode] ?? null;
        diagnostics.push({
          code: 'ERROR_RESPONSE_CODE',
          severity: 'error',
          message: {
            es: `El HSM respondió con error '${errorCode}': ${errorSpec?.title.es ?? 'Error'}`,
            en: `HSM responded with error '${errorCode}': ${errorSpec?.title.en ?? 'Error'}`
          },
          start: offset - errLen,
          end: offset
        });
      }
    }
  }

  // Extract positional fields if matchedCommand exists and it's not a non-zero error response
  if (matchedCommand && !isErrorResponse) {
    const specFields = matchedCommand.fields;

    for (let i = 0; i < specFields.length; i++) {
      const fSpec: FieldSpec = specFields[i]!;

      if (offset >= bodyEnd) {
        if (fSpec.required) {
          valid = false;
          diagnostics.push({
            code: 'MISSING_REQUIRED_FIELD',
            severity: 'error',
            message: {
              es: `Falta el campo requerido '${fSpec.name.es}'.`,
              en: `Missing required field '${fSpec.name.en}'.`
            },
            fieldId: fSpec.id
          });
        }
        continue;
      }

      let fieldLength = 0;
      let delimLength = 0;
      const remainingBody = bodyEnd - offset;

      if (fSpec.length.kind === 'fixed') {
        fieldLength = fSpec.length.length;
      } else if (fSpec.length.kind === 'thales-key') {
        const resolved = resolveThalesKeyLength(text, offset, remainingBody);
        if (resolved === null) {
          valid = false;
          diagnostics.push({
            code: 'INVALID_FIELD_LENGTH',
            severity: 'error',
            message: {
              es: `Formato de bloque de clave Thales no válido en '${fSpec.name.es}'.`,
              en: `Invalid Thales key block header format in '${fSpec.name.en}'.`
            },
            start: offset,
            end: Math.min(offset + 5, bodyEnd),
            fieldId: fSpec.id
          });
          fieldLength = remainingBody;
        } else {
          fieldLength = resolved;
        }
      } else if (fSpec.length.kind === 'range') {
        fieldLength = Math.min(fSpec.length.max, remainingBody);
      } else if (fSpec.length.kind === 'delimited') {
        const nextDelim = text.indexOf(fSpec.length.delimiter, offset);
        if (nextDelim !== -1 && nextDelim < bodyEnd) {
          fieldLength = nextDelim - offset;
          delimLength = fSpec.length.delimiter.length;
        } else {
          fieldLength = remainingBody;
        }
      } else {
        fieldLength = remainingBody;
      }

      const fStart = offset;
      const fEnd = Math.min(offset + fieldLength, bodyEnd);
      const rawVal = text.slice(fStart, fEnd);
      offset = fEnd + delimLength;

      let fieldValid = true;

      // Check required non-empty field
      if (fSpec.required && rawVal.length === 0) {
        fieldValid = false;
        valid = false;
        diagnostics.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'error',
          message: {
            es: `El campo obligatorio '${fSpec.name.es}' no puede estar vacío.`,
            en: `Required field '${fSpec.name.en}' cannot be empty.`
          },
          start: fStart,
          end: fEnd,
          fieldId: fSpec.id
        });
      }

      // Validate length
      if (rawVal.length > 0 && !validateFieldLength(rawVal, fSpec.length)) {
        fieldValid = false;
        valid = false;
        diagnostics.push({
          code: 'INVALID_FIELD_LENGTH',
          severity: 'error',
          message: {
            es: `La longitud del campo '${fSpec.name.es}' (${rawVal.length}) no es válida según su especificación.`,
            en: `Length of field '${fSpec.name.en}' (${rawVal.length}) is invalid per specification.`
          },
          start: fStart,
          end: fEnd,
          fieldId: fSpec.id
        });
      }

      // Validate encoding
      if (!validateEncoding(rawVal, fSpec.encoding)) {
        fieldValid = false;
        valid = false;
        diagnostics.push({
          code: 'INVALID_FIELD_ENCODING',
          severity: 'error',
          message: {
            es: `El campo '${fSpec.name.es}' tiene una codificación inválida (esperado ${fSpec.encoding}).`,
            en: `Field '${fSpec.name.en}' has invalid encoding (expected ${fSpec.encoding}).`
          },
          start: fStart,
          end: fEnd,
          fieldId: fSpec.id
        });
      }

      // Validate enum
      let enumMeaning = undefined;
      if (fSpec.enumValues && fSpec.enumValues.length > 0) {
        const option = fSpec.enumValues.find((o) => o.value === rawVal);
        if (option) {
          enumMeaning = option.label;
        } else {
          fieldValid = false;
          valid = false;
          const displayVal = fSpec.sensitive ? maskSensitiveValue(rawVal) : rawVal;
          diagnostics.push({
            code: 'INVALID_ENUM_VALUE',
            severity: 'error',
            message: {
              es: `Valor '${displayVal}' no permitido para '${fSpec.name.es}'.`,
              en: `Value '${displayVal}' is not allowed for '${fSpec.name.en}'.`
            },
            start: fStart,
            end: fEnd,
            fieldId: fSpec.id
          });
        }
      }

      const maskedVal = fSpec.sensitive ? maskSensitiveValue(rawVal) : rawVal;

      fields.push({
        id: fSpec.id,
        name: fSpec.name,
        description: fSpec.description,
        rawValue: rawVal,
        decodedValue: rawVal,
        maskedValue: maskedVal,
        start: fStart,
        end: fEnd,
        encoding: fSpec.encoding,
        sensitive: !!fSpec.sensitive,
        valid: fieldValid,
        position: i,
        enumMeaning,
        notes: fSpec.notes
      });

      segments.push({
        id: `seg-field-${fSpec.id}`,
        role: 'field',
        label: fSpec.name,
        rawValue: rawVal,
        start: fStart,
        end: fEnd,
        fieldId: fSpec.id
      });

      if (delimLength > 0) {
        segments.push({
          id: `seg-delim-${fSpec.id}`,
          role: 'delimiter',
          label: { es: 'Delimitador de Campo', en: 'Field Delimiter' },
          rawValue: text.slice(fEnd, fEnd + delimLength),
          start: fEnd,
          end: fEnd + delimLength,
          fieldId: fSpec.id
        });
      }
    }

    // Trailing unexpected bytes check (SF-06)
    if (offset < bodyEnd) {
      valid = false;
      const extraVal = text.slice(offset, bodyEnd);
      diagnostics.push({
        code: 'EXTRA_UNEXPECTED_FIELD',
        severity: 'error',
        message: {
          es: `Se detectaron ${extraVal.length} caracteres no esperados al final del comando.`,
          en: `Detected ${extraVal.length} unexpected characters at the end of the command.`
        },
        start: offset,
        end: bodyEnd
      });
      segments.push({
        id: 'seg-extra-trailing',
        role: 'unknown',
        label: { es: 'Bytes Inesperados', en: 'Unexpected Bytes' },
        rawValue: extraVal,
        start: offset,
        end: bodyEnd
      });
    }
  }

  return {
    deviceId: spec.id,
    version: versionSpec.version,
    raw,
    normalized,
    framingType: 'header-positional',
    detectedDirection,
    expectedDirection: options?.expectedDirection,
    commandCode,
    matchedCommand,
    pairedCommand,
    isErrorResponse,
    errorCode,
    errorSpec,
    headerValue,
    echoToken: headerValue,
    lmkId,
    trailer,
    segments,
    fields,
    diagnostics,
    valid: valid && !isErrorResponse
  };
}
