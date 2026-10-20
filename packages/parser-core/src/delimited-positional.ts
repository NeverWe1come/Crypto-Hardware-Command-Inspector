/**
 * @packageDocumentation
 * Parser implementation for delimited positional command framing (e.g., Utimaco Atalla AT1000).
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
 * Parses a delimited positional command string (e.g., `<CMD#field1#field2#>`).
 *
 * Used primarily by hardware such as Utimaco / Atalla AT1000 where frames are
 * enclosed by start/end delimiters (`<` and `>`) and tokens are separated by `#`.
 *
 * @param raw - Raw ASCII or hexadecimal command string received from wire/host.
 * @param spec - Hardware device specification containing framing and command schemas.
 * @param options - Optional parsing flags (expected direction, explicit firmware version).
 * @returns Fully structured {@link ParseResult} with extracted fields, diagnostics, and segments.
 *
 * @example
 * ```typescript
 * const result = parseDelimitedPositional('<31#Y#01#>', atallaSpec);
 * console.log(result.commandCode); // "31"
 * console.log(result.errorCode); // "01"
 * ```
 */
export function parseDelimitedPositional(
  raw: string,
  spec: DeviceSpec,
  options?: ParseCommandOptions
): ParseResult {
  const normalized = normalizeInput(raw);
  const text = normalized.normalized;

  if (spec.framing.type !== 'delimited-positional') {
    throw new Error(
      `Device "${spec.id}" has incompatible framing type "${spec.framing.type}", expected "delimited-positional"`
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
      framingType: 'delimited-positional',
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

  const { startDelimiter, endDelimiter, fieldDelimiter, requireTrailingDelimiter, contextTagPrefix } =
    framing;

  // Verify start delimiter
  if (!text.startsWith(startDelimiter)) {
    diagnostics.push({
      code: 'MALFORMED_FRAME',
      severity: 'error',
      message: {
        es: `El comando debe comenzar con el delimitador '${startDelimiter}'.`,
        en: `Command must begin with start delimiter '${startDelimiter}'.`
      },
      start: 0,
      end: 1
    });
    valid = false;
  }

  // Verify end delimiter
  if (!text.endsWith(endDelimiter)) {
    diagnostics.push({
      code: 'UNCLOSED_FRAME',
      severity: 'error',
      message: {
        es: `El comando no está cerrado con el delimitador '${endDelimiter}'.`,
        en: `Command is not closed with end delimiter '${endDelimiter}'.`
      },
      start: Math.max(0, text.length - 1),
      end: text.length
    });
    valid = false;
  }

  if (!valid) {
    return {
      deviceId: spec.id,
      version: versionSpec.version,
      raw,
      normalized,
      framingType: 'delimited-positional',
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

  // Slice content inside start/end delimiters
  const innerContent = text.slice(
    startDelimiter.length,
    text.length - endDelimiter.length
  );

  if (requireTrailingDelimiter && !innerContent.endsWith(fieldDelimiter)) {
    diagnostics.push({
      code: 'MALFORMED_FRAME',
      severity: 'error',
      message: {
        es: `El comando debe finalizar con el separador de campo '${fieldDelimiter}' antes de '${endDelimiter}'.`,
        en: `Command must end with field delimiter '${fieldDelimiter}' before '${endDelimiter}'.`
      },
      start: text.length - endDelimiter.length,
      end: text.length
    });
    return {
      deviceId: spec.id,
      version: versionSpec.version,
      raw,
      normalized,
      framingType: 'delimited-positional',
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

  // Record start delimiter segment
  segments.push({
    id: 'seg-start-delimiter',
    role: 'delimiter',
    label: { es: 'Delimitador Inicial', en: 'Start Delimiter' },
    rawValue: startDelimiter,
    start: 0,
    end: startDelimiter.length
  });

  // Tokenize inner content by field delimiter
  const tokensWithPositions: { value: string; start: number; end: number }[] = [];
  let currentPos = startDelimiter.length;
  const rawTokens = innerContent.split(fieldDelimiter);

  // If requireTrailingDelimiter is true and innerContent ends with fieldDelimiter,
  // split leaves an empty string at the end which we remove
  if (requireTrailingDelimiter && rawTokens[rawTokens.length - 1] === '') {
    rawTokens.pop();
  }

  for (let i = 0; i < rawTokens.length; i++) {
    const tokenVal = rawTokens[i]!;
    const tokStart = currentPos;
    const tokEnd = tokStart + tokenVal.length;
    tokensWithPositions.push({ value: tokenVal, start: tokStart, end: tokEnd });

    // Record delimiter segment after token
    const delimStart = tokEnd;
    const delimEnd = delimStart + fieldDelimiter.length;
    currentPos = delimEnd;
  }

  if (tokensWithPositions.length === 0) {
    return {
      deviceId: spec.id,
      version: versionSpec.version,
      raw,
      normalized,
      framingType: 'delimited-positional',
      detectedDirection: 'unknown',
      expectedDirection: options?.expectedDirection,
      commandCode: null,
      matchedCommand: null,
      pairedCommand: null,
      isErrorResponse: false,
      errorCode: null,
      errorSpec: null,
      segments,
      fields: [],
      diagnostics: [
        {
          code: 'MALFORMED_FRAME',
          severity: 'error',
          message: {
            es: 'El comando no contiene ningún token delimitado.',
            en: 'Command does not contain any delimited tokens.'
          }
        }
      ],
      valid: false
    };
  }

  // Token 0 is command code
  const cmdToken = tokensWithPositions[0]!;
  const commandCode = cmdToken.value;

  if (commandCode.length === 0) {
    valid = false;
    diagnostics.push({
      code: 'MALFORMED_FRAME',
      severity: 'error',
      message: {
        es: 'El comando no contiene un código de comando válido.',
        en: 'Command does not contain a valid command code.'
      },
      start: cmdToken.start,
      end: cmdToken.end
    });
  }

  segments.push({
    id: 'seg-command-code',
    role: 'command-code',
    label: { es: 'Código de Comando', en: 'Command Code' },
    rawValue: commandCode,
    start: cmdToken.start,
    end: cmdToken.end
  });

  // Extract optional trailing context tag (e.g., ^MYCTX#)
  let echoToken: string | null = null;
  const lastToken = tokensWithPositions[tokensWithPositions.length - 1];
  let fieldTokens = tokensWithPositions.slice(1);

  if (
    contextTagPrefix &&
    lastToken &&
    tokensWithPositions.length > 1 &&
    lastToken.value.startsWith(contextTagPrefix)
  ) {
    echoToken = lastToken.value.slice(contextTagPrefix.length);
    segments.push({
      id: 'seg-context-tag',
      role: 'context-tag',
      label: { es: 'Tag de Contexto / Eco', en: 'Context / Echo Tag' },
      rawValue: lastToken.value,
      start: lastToken.start,
      end: lastToken.end
    });
    fieldTokens = tokensWithPositions.slice(1, -1);
  }

  // Handle Atalla status & error responses
  let isErrorResponse = false;
  let errorCode: string | null = null;
  let errorSpec: ErrorCodeSpec | null = null;
  let offendingFieldOrTag: string | null = null;
  let firmwareVersionToken: string | null = null;
  let detectedDirection: CommandDirection = 'request';

  // Check if this command is '00' response or error response
  if (commandCode === '00' && fieldTokens.length > 0) {
    const f0Val = fieldTokens[0]!.value;
    if (f0Val.length === 6 && /^\d{6}$/.test(f0Val)) {
      detectedDirection = 'response';
      const ee = f0Val.slice(0, 2);
      const ff = f0Val.slice(2, 4);
      const vv = f0Val.slice(4, 6);

      errorCode = ee;
      offendingFieldOrTag = ff;
      firmwareVersionToken = vv;

      if (ee !== '00') {
        isErrorResponse = true;
        errorSpec = versionSpec.errorCodes[ee] ?? null;
        diagnostics.push({
          code: 'ERROR_RESPONSE_CODE',
          severity: 'error',
          message: {
            es: `El HSM respondió con error '${ee}': ${errorSpec?.title.es ?? 'Error'}`,
            en: `HSM responded with error '${ee}': ${errorSpec?.title.en ?? 'Error'}`
          },
          start: fieldTokens[0]!.start,
          end: fieldTokens[0]!.start + 2
        });
      }
    }
  }

  // Find candidate commands
  const matchingCommands = versionSpec.commands.filter(
    (c) => c.code === commandCode
  );

  let matchedCommand: CommandSpec | null = null;

  if (matchingCommands.length > 0) {
    let filtered = matchingCommands;
    if (commandCode === '00') {
      filtered = matchingCommands.filter(
        (c) => c.direction === detectedDirection
      );
    } else {
      detectedDirection = matchingCommands[0]!.direction;
    }

    for (const cmd of filtered) {
      if (cmd.subCode !== undefined) {
        const subIdx = cmd.subCodeFieldIndex ?? 0;
        const subTok = fieldTokens[subIdx];
        if (subTok && subTok.value === cmd.subCode) {
          matchedCommand = cmd;
          break;
        }
      }
    }

    if (!matchedCommand) {
      matchedCommand = filtered[0] ?? null;
    }
  } else if (!isErrorResponse && commandCode.length > 0) {
    valid = false;
    diagnostics.push({
      code: 'UNKNOWN_COMMAND',
      severity: 'error',
      message: {
        es: `Comando '${commandCode}' no reconocido para este dispositivo.`,
        en: `Command '${commandCode}' not recognized for this device.`
      },
      start: cmdToken.start,
      end: cmdToken.end
    });
  }

  // Find paired command for request <-> response linking
  let pairedCommand: CommandSpec | null = null;
  if (matchedCommand?.pairedCode) {
    const pairedDir =
      matchedCommand.direction === 'request' ? 'response' : 'request';
    pairedCommand =
      versionSpec.commands.find(
        (c) =>
          c.code === matchedCommand?.pairedCode &&
          c.direction === pairedDir &&
          (!matchedCommand.subCode || c.subCode === matchedCommand.subCode)
      ) ?? null;
  }

  // Parse & validate fields against matchedCommand.fields
  if (matchedCommand) {
    const specFields = matchedCommand.fields;

    if (!isErrorResponse) {
      if (fieldTokens.length < specFields.length) {
        valid = false;
        diagnostics.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'error',
          message: {
            es: `Se esperaban ${specFields.length} campos pero se recibieron ${fieldTokens.length}.`,
            en: `Expected ${specFields.length} fields but received ${fieldTokens.length}.`
          }
        });
      } else if (fieldTokens.length > specFields.length) {
        valid = false;
        diagnostics.push({
          code: 'EXTRA_UNEXPECTED_FIELD',
          severity: 'error',
          message: {
            es: `Se esperaban ${specFields.length} campos pero se recibieron ${fieldTokens.length}.`,
            en: `Expected ${specFields.length} fields but received ${fieldTokens.length}.`
          },
          start: fieldTokens[specFields.length]?.start,
          end: fieldTokens[fieldTokens.length - 1]?.end
        });
      }
    }

    for (let i = 0; i < fieldTokens.length; i++) {
      const tok = fieldTokens[i]!;
      const fSpec: FieldSpec | undefined = specFields[i];

      if (!fSpec) {
        segments.push({
          id: `seg-extra-field-${i}`,
          role: 'field',
          label: { es: `Campo Extra ${i + 1}`, en: `Extra Field ${i + 1}` },
          rawValue: tok.value,
          start: tok.start,
          end: tok.end
        });
        continue;
      }

      let fieldValid = true;

      // Check required non-empty field
      if (fSpec.required && tok.value.length === 0) {
        fieldValid = false;
        valid = false;
        diagnostics.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'error',
          message: {
            es: `El campo obligatorio '${fSpec.name.es}' no puede estar vacío.`,
            en: `Required field '${fSpec.name.en}' cannot be empty.`
          },
          start: tok.start,
          end: tok.end,
          fieldId: fSpec.id
        });
      }

      // Validate length
      if (tok.value.length > 0 && !validateFieldLength(tok.value, fSpec.length)) {
        fieldValid = false;
        valid = false;
        diagnostics.push({
          code: 'INVALID_FIELD_LENGTH',
          severity: 'error',
          message: {
            es: `La longitud del campo '${fSpec.name.es}' (${tok.value.length}) no es válida según su especificación.`,
            en: `Length of field '${fSpec.name.en}' (${tok.value.length}) is invalid per specification.`
          },
          start: tok.start,
          end: tok.end,
          fieldId: fSpec.id
        });
      }

      // Validate encoding
      if (!validateEncoding(tok.value, fSpec.encoding)) {
        fieldValid = false;
        valid = false;
        diagnostics.push({
          code: 'INVALID_FIELD_ENCODING',
          severity: 'error',
          message: {
            es: `El campo '${fSpec.name.es}' tiene una codificación inválida (esperado ${fSpec.encoding}).`,
            en: `Field '${fSpec.name.en}' has invalid encoding (expected ${fSpec.encoding}).`
          },
          start: tok.start,
          end: tok.end,
          fieldId: fSpec.id
        });
      }

      // Validate enum values with safe masking
      let enumMeaning = undefined;
      if (fSpec.enumValues && fSpec.enumValues.length > 0) {
        const option = fSpec.enumValues.find((o) => o.value === tok.value);
        if (!option) {
          fieldValid = false;
          valid = false;
          const displayVal = fSpec.sensitive ? maskSensitiveValue(tok.value) : tok.value;
          diagnostics.push({
            code: 'INVALID_ENUM_VALUE',
            severity: 'error',
            message: {
              es: `Valor '${displayVal}' no permitido para '${fSpec.name.es}'.`,
              en: `Value '${displayVal}' is not allowed for '${fSpec.name.en}'.`
            },
            start: tok.start,
            end: tok.end,
            fieldId: fSpec.id
          });
        } else {
          enumMeaning = option.label;
        }
      }

      const maskedValue = fSpec.sensitive
        ? maskSensitiveValue(tok.value)
        : tok.value;

      fields.push({
        id: fSpec.id,
        name: fSpec.name,
        description: fSpec.description,
        rawValue: tok.value,
        decodedValue: tok.value,
        maskedValue,
        start: tok.start,
        end: tok.end,
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
        rawValue: tok.value,
        start: tok.start,
        end: tok.end,
        fieldId: fSpec.id
      });
    }
  }

  // Record end delimiter segment
  segments.push({
    id: 'seg-end-delimiter',
    role: 'delimiter',
    label: { es: 'Delimitador Final', en: 'End Delimiter' },
    rawValue: endDelimiter,
    start: text.length - endDelimiter.length,
    end: text.length
  });

  return {
    deviceId: spec.id,
    version: versionSpec.version,
    raw,
    normalized,
    framingType: 'delimited-positional',
    detectedDirection,
    expectedDirection: options?.expectedDirection,
    commandCode,
    subCode: matchedCommand?.subCode ?? null,
    matchedCommand,
    pairedCommand,
    isErrorResponse,
    errorCode,
    errorSpec,
    offendingFieldOrTag,
    firmwareVersionToken,
    echoToken,
    segments,
    fields,
    diagnostics,
    valid: valid && !isErrorResponse
  };
}
