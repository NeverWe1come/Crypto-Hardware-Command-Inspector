/**
 * @packageDocumentation
 * Parser implementation for delimited positional command framing (e.g., Utimaco Atalla AT1000).
 */

import { resolveDeviceVersion } from './engine';
import { maskSensitiveValue, normalizeInput } from './normalizer';
import { isVolatileTableLocation, validateEncoding, validateFieldLength } from './validation';
import type {
  CommandDirection,
  CommandSpec,
  DeviceSpec,
  ErrorCodeSpec,
  FieldSpec,
  FrameSegment,
  KeyManagementMode,
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
 * @param raw - Raw ASCII command string.
 * @param spec - Hardware device specification containing framing and command schemas.
 * @param options - Optional parsing flags (expected direction, explicit firmware version, key management).
 * @returns Fully structured {@link ParseResult} with extracted fields, diagnostics, and segments.
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

  // Handle leading noise before '<' or trailing [CRLF] after '>'
  const startIdx = text.indexOf(startDelimiter);
  const endIdx = text.lastIndexOf(endDelimiter);

  if (startIdx === -1) {
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

  if (endIdx === -1 || (startIdx !== -1 && endIdx < startIdx)) {
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

  // Check for leading or trailing noise
  if (startIdx > 0) {
    diagnostics.push({
      code: 'NOISE_IGNORED',
      severity: 'info',
      message: {
        es: `Se ignoraron ${startIdx} caracteres de ruido antes del delimitador inicial '${startDelimiter}'.`,
        en: `Ignored ${startIdx} noise characters before start delimiter '${startDelimiter}'.`
      },
      start: 0,
      end: startIdx
    });
  }

  if (endIdx < text.length - 1) {
    const trailingNoise = text.slice(endIdx + 1);
    if (trailingNoise !== '\r\n' && trailingNoise !== '\n' && trailingNoise !== '\r' && trailingNoise !== '[CRLF]') {
      diagnostics.push({
        code: 'NOISE_IGNORED',
        severity: 'info',
        message: {
          es: `Se ignoraron caracteres posteriores al delimitador final '${endDelimiter}'.`,
          en: `Ignored characters after end delimiter '${endDelimiter}'.`
        },
        start: endIdx + 1,
        end: text.length
      });
    }
  }

  // Slice content strictly inside start/end delimiters
  const innerContent = text.slice(startIdx + startDelimiter.length, endIdx);

  if (requireTrailingDelimiter && !innerContent.endsWith(fieldDelimiter)) {
    diagnostics.push({
      code: 'MALFORMED_FRAME',
      severity: 'error',
      message: {
        es: `El comando debe finalizar con el separador de campo '${fieldDelimiter}' antes de '${endDelimiter}'.`,
        en: `Command must end with field delimiter '${fieldDelimiter}' before '${endDelimiter}'.`
      },
      start: endIdx - 1,
      end: endIdx
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
    start: startIdx,
    end: startIdx + startDelimiter.length
  });

  // Tokenize inner content by field delimiter
  const tokensWithPositions: { value: string; start: number; end: number }[] = [];
  let currentPos = startIdx + startDelimiter.length;
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
  const commandCode = cmdToken.value.toUpperCase();

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
    rawValue: cmdToken.value,
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
  let detailedErrorCode: string | null = null;
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

      // Extract optional detailed error code (Table 11-2) in field 1
      if (ee !== '00' && fieldTokens.length > 1 && fieldTokens[1]!.value.length > 0) {
        detailedErrorCode = fieldTokens[1]!.value;
      }

      if (ee !== '00') {
        isErrorResponse = true;
        errorSpec = versionSpec.errorCodes[ee] ?? null;
        const errTitle = errorSpec?.title.en ?? 'Error';
        diagnostics.push({
          code: 'ERROR_RESPONSE_CODE',
          severity: 'error',
          message: {
            es: `El HSM respondió con error '${ee}': ${errorSpec?.title.es ?? errTitle}`,
            en: `HSM responded with error '${ee}': ${errTitle}`
          },
          start: fieldTokens[0]!.start,
          end: fieldTokens[0]!.start + 2
        });
      }
    }
  }

  // Detect Key Management Mode from field tokens
  let detectedKeyManagement: KeyManagementMode | null = null;
  if (options?.keyManagement && options.keyManagement !== 'auto') {
    detectedKeyManagement = options.keyManagement;
  } else {
    for (const tok of fieldTokens) {
      if (tok.value.includes(',') || /^[13][A-Za-z0-9]{3}[A-Za-z0-9]000/.test(tok.value)) {
        detectedKeyManagement = 'akb';
        break;
      }
    }
    if (!detectedKeyManagement) {
      // Check for variant specific markers: 16/32 hex keys without commas
      for (const tok of fieldTokens) {
        if (/^[0-9A-Fa-f]{16}$/.test(tok.value) || /^[0-9A-Fa-f]{32}$/.test(tok.value)) {
          detectedKeyManagement = 'variant';
          break;
        }
      }
    }
  }

  // Find candidate commands
  const matchingCommands = versionSpec.commands.filter((c) => c.code === commandCode);

  let matchedCommand: CommandSpec | null = null;

  if (matchingCommands.length > 0) {
    let filtered = matchingCommands;
    if (commandCode === '00') {
      filtered = matchingCommands.filter((c) => c.direction === detectedDirection);
    } else if (options?.expectedDirection) {
      const byDirection = matchingCommands.filter((c) => c.direction === options.expectedDirection);
      if (byDirection.length > 0) {
        filtered = byDirection;
        detectedDirection = options.expectedDirection;
      } else {
        detectedDirection = matchingCommands[0]!.direction;
      }
    } else {
      detectedDirection = matchingCommands[0]!.direction;
    }

    // Try discriminating candidates using discriminator or subCode
    for (const cmd of filtered) {
      if (cmd.discriminator) {
        const disc = cmd.discriminator;
        const targetTok = fieldTokens[disc.fieldIndex];
        if (targetTok) {
          const tokVal = targetTok.value.trim().toUpperCase();
          if (disc.match === 'exact' && disc.values.some((v) => v.toUpperCase() === tokVal)) {
            matchedCommand = cmd;
            break;
          } else if (disc.match === 'oneOf' && disc.values.some((v) => v.toUpperCase() === tokVal)) {
            matchedCommand = cmd;
            break;
          } else if (disc.match === 'beforeComma') {
            const prefix = tokVal.split(',')[0]!.trim();
            if (disc.values.some((v) => v.toUpperCase() === prefix)) {
              matchedCommand = cmd;
              break;
            }
          } else if (disc.match === 'keyword') {
            if (disc.values.some((v) => tokVal.startsWith(v.toUpperCase()))) {
              matchedCommand = cmd;
              break;
            }
          }
        }
      } else if (cmd.subCode !== undefined) {
        const subIdx = cmd.subCodeFieldIndex ?? 0;
        const subTok = fieldTokens[subIdx];
        if (subTok && subTok.value.toUpperCase() === cmd.subCode.toUpperCase()) {
          matchedCommand = cmd;
          break;
        }
      }
    }

    // If still no direct discriminator match, pick candidate with closest field count & key management
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
    const pairedDir = matchedCommand.direction === 'request' ? 'response' : 'request';
    pairedCommand =
      versionSpec.commands.find(
        (c) =>
          c.code === matchedCommand?.pairedCode &&
          c.direction === pairedDir &&
          (!matchedCommand.subCode || c.subCode === matchedCommand.subCode)
      ) ?? null;
  }

  // Resolve target fields for this command and mode (AKB vs Variant)
  let specFields: readonly FieldSpec[] = matchedCommand?.fields ?? [];
  if (matchedCommand?.fieldsByMode && detectedKeyManagement) {
    const modeFields = matchedCommand.fieldsByMode[detectedKeyManagement];
    if (modeFields && modeFields.length > 0) {
      specFields = modeFields;
    }
  }

  // Calculate minimum required count: up to the last strictly required field
  let minRequired = 0;
  for (let idx = 0; idx < specFields.length; idx++) {
    const sf = specFields[idx]!;
    if (sf.presence === 'required' || (sf.presence === undefined && sf.required)) {
      minRequired = idx + 1;
    }
  }

  const omittedFields: FieldSpec[] = [];

  if (matchedCommand && !isErrorResponse) {
    if (fieldTokens.length < minRequired) {
      valid = false;
      diagnostics.push({
        code: 'MISSING_REQUIRED_FIELD',
        severity: 'error',
        message: {
          es: `Se esperaban al menos ${minRequired} campos pero se recibieron ${fieldTokens.length}.`,
          en: `Expected at least ${minRequired} fields but received ${fieldTokens.length}.`
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

  // Track omitted optional fields
  if (fieldTokens.length < specFields.length) {
    for (let j = fieldTokens.length; j < specFields.length; j++) {
      const of = specFields[j];
      if (of) omittedFields.push(of);
    }
  }

  for (let i = 0; i < fieldTokens.length; i++) {
    const tok = fieldTokens[i]!;
    const fSpec: FieldSpec | undefined = specFields[i];

    if (!fSpec) {
      const extraFieldId = `field-${i + 1}`;
      const extraName = {
        es: matchedCommand ? `Campo Extra ${i + 1}` : `Campo ${i + 1}`,
        en: matchedCommand ? `Extra Field ${i + 1}` : `Field ${i + 1}`
      };
      const extraDesc = {
        es: `Campo delimitado en posición ${i + 1}`,
        en: `Delimited field at position ${i + 1}`
      };

      fields.push({
        id: extraFieldId,
        name: extraName,
        description: extraDesc,
        rawValue: tok.value,
        decodedValue: tok.value,
        maskedValue: tok.value,
        start: tok.start,
        end: tok.end,
        encoding: 'ascii',
        sensitive: false,
        valid: true,
        position: i
      });

      segments.push({
        id: `seg-field-${extraFieldId}`,
        role: 'field',
        label: extraName,
        rawValue: tok.value,
        start: tok.start,
        end: tok.end,
        fieldId: extraFieldId
      });
      continue;
    }

    let fieldValid = true;

    // Check presence & emptiness
    const isStrictlyRequired = fSpec.presence === 'required' || (fSpec.presence === undefined && fSpec.required);
    if (isStrictlyRequired && tok.value.length === 0) {
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

    // Validate length (handling set, range, volatile table locations, space-grouped hex)
    const cleanHex = tok.value.replace(/\s+/g, '');
    const isVolatile = fSpec.allowsVolatileLocation && isVolatileTableLocation(tok.value);
    const isLengthValid =
      tok.value.length === 0 ||
      isVolatile ||
      validateFieldLength(tok.value, fSpec.length) ||
      validateFieldLength(cleanHex, fSpec.length) ||
      (fSpec.variants &&
        fSpec.variants.length > 0 &&
        fSpec.variants.some((v) => validateFieldLength(tok.value, v.length) || validateFieldLength(cleanHex, v.length)));

    const resolvedDescription = fSpec.description;
    const detectedMode: 'akb' | 'variant' | 'both' | undefined = detectedKeyManagement ?? undefined;

    if (tok.value.length > 0 && !isLengthValid) {
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
    const isEncodingValid =
      tok.value.length === 0 ||
      isVolatile ||
      validateEncoding(tok.value, fSpec.encoding) ||
      ((fSpec.encoding === 'hex-ascii' || fSpec.encoding === 'binary-hex') && validateEncoding(cleanHex, fSpec.encoding));

    if (tok.value.length > 0 && !isEncodingValid) {
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

    const maskedValue = fSpec.sensitive ? maskSensitiveValue(tok.value) : tok.value;

    fields.push({
      id: fSpec.id,
      name: fSpec.name,
      description: resolvedDescription,
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
      notes: fSpec.notes,
      variants: fSpec.variants,
      detectedMode
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

  // Record end delimiter segment
  segments.push({
    id: 'seg-end-delimiter',
    role: 'delimiter',
    label: { es: 'Delimitador Final', en: 'End Delimiter' },
    rawValue: endDelimiter,
    start: endIdx,
    end: endIdx + endDelimiter.length
  });

  return {
    deviceId: spec.id,
    version: versionSpec.version,
    raw,
    normalized,
    framingType: 'delimited-positional',
    detectedDirection,
    expectedDirection: options?.expectedDirection,
    detectedKeyManagement,
    commandCode,
    subCode: matchedCommand?.subCode ?? null,
    matchedCommand,
    pairedCommand,
    isErrorResponse,
    errorCode,
    detailedErrorCode,
    errorSpec,
    offendingFieldOrTag,
    firmwareVersionToken,
    echoToken,
    segments,
    fields,
    omittedFields: omittedFields.length > 0 ? omittedFields : undefined,
    diagnostics,
    valid: valid && !isErrorResponse
  };
}
