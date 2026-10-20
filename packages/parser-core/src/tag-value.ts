/**
 * @packageDocumentation
 * Parser implementation for tag-value command framing (e.g., Futurex Excrypt).
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
 * Parses a tag-value command string (e.g., `[AOECHO;AGHello;]`).
 */
export function parseTagValue(
  raw: string,
  spec: DeviceSpec,
  options?: ParseCommandOptions
): ParseResult {
  const normalized = normalizeInput(raw);
  const text = normalized.normalized;

  if (spec.framing.type !== 'tag-value') {
    throw new Error(
      `Device "${spec.id}" has incompatible framing type "${spec.framing.type}", expected "tag-value"`
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
      framingType: 'tag-value',
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

  const {
    startDelimiter,
    endDelimiter,
    pairDelimiter,
    commandTag,
    tagLength,
    errorCommandCode = 'ERRO',
    errorCodeTag = 'AM',
    offendingTagTag = 'AN',
    universalTags = []
  } = framing;

  // Validate start delimiter
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

  // Validate end delimiter
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
      framingType: 'tag-value',
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
    id: 'seg-start-delim',
    role: 'delimiter',
    label: { es: 'Delimitador Inicial', en: 'Start Delimiter' },
    rawValue: startDelimiter,
    start: 0,
    end: startDelimiter.length
  });

  // Extract inner tokens
  const innerContent = text.slice(
    startDelimiter.length,
    text.length - endDelimiter.length
  );

  const rawTokens = innerContent.split(pairDelimiter);
  if (rawTokens[rawTokens.length - 1] === '') {
    rawTokens.pop();
  }

  interface ExtractedTagToken {
    readonly rawToken: string;
    readonly tag: string;
    readonly value: string;
    readonly start: number;
    readonly end: number;
  }

  const extractedTokens: ExtractedTagToken[] = [];
  let currentOffset = startDelimiter.length;

  for (const tok of rawTokens) {
    const tokStart = currentOffset;
    const tokEnd = tokStart + tok.length;
    currentOffset = tokEnd + pairDelimiter.length;

    if (tok.length > 0 && tok.length < tagLength) {
      valid = false;
      diagnostics.push({
        code: 'MALFORMED_FRAME',
        severity: 'error',
        message: {
          es: `El fragmento '${tok}' es inferior a la longitud mínima de tag (${tagLength}).`,
          en: `Token fragment '${tok}' is shorter than tag length (${tagLength}).`
        },
        start: tokStart,
        end: tokEnd
      });
      continue;
    }

    if (tok.length < tagLength) {
      continue;
    }

    const tag = tok.slice(0, tagLength);
    const value = tok.slice(tagLength);
    extractedTokens.push({
      rawToken: tok,
      tag,
      value,
      start: tokStart,
      end: tokEnd
    });
  }

  // Find Command Code from commandTag ('AO')
  const cmdEntry = extractedTokens.find((t) => t.tag === commandTag);
  const commandCode = cmdEntry ? cmdEntry.value : null;

  if (cmdEntry) {
    segments.push({
      id: 'seg-command-code',
      role: 'command-code',
      label: { es: 'Código de Comando (AO)', en: 'Command Code (AO)' },
      rawValue: cmdEntry.rawToken,
      start: cmdEntry.start,
      end: cmdEntry.end,
      tag: commandTag
    });
  } else {
    valid = false;
    diagnostics.push({
      code: 'MALFORMED_FRAME',
      severity: 'error',
      message: {
        es: `Falta el tag de comando requerido '${commandTag}'.`,
        en: `Missing required command tag '${commandTag}'.`
      }
    });
  }

  // Check if this is dedicated error frame [AOERRO;...]
  let isErrorResponse = false;
  let errorCode: string | null = null;
  let errorSpec: ErrorCodeSpec | null = null;
  let offendingFieldOrTag: string | null = null;
  let echoToken: string | null = null;

  if (commandCode === errorCommandCode) {
    isErrorResponse = true;

    const errTok = extractedTokens.find((t) => t.tag === errorCodeTag);
    if (errTok) {
      errorCode = errTok.value;
      errorSpec = versionSpec.errorCodes[errorCode] ?? null;
      diagnostics.push({
        code: 'ERROR_RESPONSE_CODE',
        severity: 'error',
        message: {
          es: `El HSM respondió con error '${errorCode}': ${errorSpec?.title.es ?? 'Error'}`,
          en: `HSM responded with error '${errorCode}': ${errorSpec?.title.en ?? 'Error'}`
        },
        start: errTok.start,
        end: errTok.end
      });
    } else {
      diagnostics.push({
        code: 'ERROR_RESPONSE_CODE',
        severity: 'error',
        message: {
          es: 'El HSM emitió una trama de error sin especificar código de error (tag AM).',
          en: 'HSM emitted an error frame without specifying an error code (AM tag).'
        }
      });
    }

    const offTok = extractedTokens.find((t) => t.tag === offendingTagTag);
    if (offTok) {
      offendingFieldOrTag = offTok.value;
    }
  }

  // Extract universal echo tag (AG)
  const agTok = extractedTokens.find((t) => t.tag === 'AG');
  if (agTok) {
    echoToken = agTok.value;
  }

  // Candidate commands for matching
  const matchingCommands = versionSpec.commands.filter(
    (c) => c.code === commandCode
  );

  let detectedDirection: CommandDirection = isErrorResponse
    ? 'response'
    : 'request';

  let matchedCommand: CommandSpec | null = null;

  if (isErrorResponse) {
    detectedDirection = 'response';
    matchedCommand =
      matchingCommands.find((c) => c.direction === 'response') ??
      matchingCommands[0] ??
      null;
  } else if (matchingCommands.length > 0) {
    const presentTags = new Set(
      extractedTokens.filter((t) => t.tag !== commandTag).map((t) => t.tag)
    );

    const responseCmd = matchingCommands.find((c) => c.direction === 'response');
    const requestCmd = matchingCommands.find((c) => c.direction === 'request');

    if (options?.expectedDirection) {
      matchedCommand =
        matchingCommands.find((c) => c.direction === options.expectedDirection) ??
        matchingCommands[0] ??
        null;
      detectedDirection = options.expectedDirection;
    } else if (responseCmd && requestCmd) {
      const responseTags = new Set(
        responseCmd.fields
          .map((f) => f.tag)
          .filter((t): t is string => typeof t === 'string' && t.length > 0)
      );
      const requestTags = new Set(
        requestCmd.fields
          .map((f) => f.tag)
          .filter((t): t is string => typeof t === 'string' && t.length > 0)
      );

      const uniqueResponseTags = [...responseTags].filter((t) => !requestTags.has(t));
      const uniqueRequestTags = [...requestTags].filter((t) => !responseTags.has(t));

      const hasUniqueResponseTag = uniqueResponseTags.some((t) => presentTags.has(t));
      const hasUniqueRequestTag = uniqueRequestTags.some((t) => presentTags.has(t));

      if (hasUniqueResponseTag && !hasUniqueRequestTag) {
        detectedDirection = 'response';
        matchedCommand = responseCmd;
      } else if (hasUniqueRequestTag && !hasUniqueResponseTag) {
        detectedDirection = 'request';
        matchedCommand = requestCmd;
      } else {
        const hasStatusTag =
          presentTags.has('BB') ||
          (errorCodeTag ? presentTags.has(errorCodeTag) : false);
        if (hasStatusTag) {
          detectedDirection = 'response';
          matchedCommand = responseCmd;
        } else {
          detectedDirection = 'request';
          matchedCommand = requestCmd;
        }
      }
    } else if (responseCmd) {
      detectedDirection = 'response';
      matchedCommand = responseCmd;
    } else if (requestCmd) {
      detectedDirection = 'request';
      matchedCommand = requestCmd;
    } else {
      matchedCommand = matchingCommands[0] ?? null;
      detectedDirection = matchedCommand?.direction ?? 'request';
    }
  } else if (commandCode) {
    valid = false;
    diagnostics.push({
      code: 'UNKNOWN_COMMAND',
      severity: 'error',
      message: {
        es: `Comando '${commandCode}' no reconocido para este dispositivo.`,
        en: `Command '${commandCode}' not recognized for this device.`
      }
    });
  }

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

  // Process and validate all non-AO tags
  const validFieldsMap = new Map<string, FieldSpec>();
  if (matchedCommand) {
    for (const f of matchedCommand.fields) {
      if (f.tag) validFieldsMap.set(f.tag, f);
    }
  }
  for (const u of universalTags) {
    if (u.tag) validFieldsMap.set(u.tag, u);
  }

  const seenTags = new Set<string>();

  for (const tok of extractedTokens) {
    if (tok.tag === commandTag) {
      continue;
    }

    seenTags.add(tok.tag);
    const fSpec = validFieldsMap.get(tok.tag);

    if (!fSpec) {
      if (
        isErrorResponse &&
        (tok.tag === errorCodeTag ||
          tok.tag === offendingTagTag ||
          tok.tag === 'BB' ||
          tok.tag === framing.errorMessageTag)
      ) {
        segments.push({
          id: `seg-error-tag-${tok.tag}`,
          role: 'error-code',
          label: { es: `Tag de Error ${tok.tag}`, en: `Error Tag ${tok.tag}` },
          rawValue: tok.rawToken,
          start: tok.start,
          end: tok.end,
          tag: tok.tag
        });
        fields.push({
          id: `field-${tok.tag.toLowerCase()}`,
          name: {
            es:
              tok.tag === errorCodeTag
                ? 'Código de Error'
                : tok.tag === offendingTagTag
                ? 'Tag Ofensor'
                : 'Mensaje de Error',
            en:
              tok.tag === errorCodeTag
                ? 'Error Code'
                : tok.tag === offendingTagTag
                ? 'Offending Tag'
                : 'Error Message'
          },
          description: {
            es: `Etiqueta de error ${tok.tag}`,
            en: `Error tag ${tok.tag}`
          },
          tag: tok.tag,
          rawValue: tok.value,
          decodedValue: tok.value,
          maskedValue: tok.value,
          start: tok.start,
          end: tok.end,
          encoding: 'ascii',
          valid: true,
          sensitive: false
        });
        continue;
      }

      diagnostics.push({
        code: 'UNKNOWN_TAG',
        severity: 'warning',
        message: {
          es: `Tag no reconocido '${tok.tag}' para este comando.`,
          en: `Unrecognized tag '${tok.tag}' for this command.`
        },
        start: tok.start,
        end: tok.end
      });

      segments.push({
        id: `seg-unknown-tag-${tok.tag}`,
        role: 'unknown',
        label: { es: `Tag Desconocido ${tok.tag}`, en: `Unknown Tag ${tok.tag}` },
        rawValue: tok.rawToken,
        start: tok.start,
        end: tok.end,
        tag: tok.tag
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
          es: `El tag obligatorio '${fSpec.tag}' (${fSpec.name.es}) no puede estar vacío.`,
          en: `Required tag '${fSpec.tag}' (${fSpec.name.en}) cannot be empty.`
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
          es: `La longitud del tag '${fSpec.tag}' (${tok.value.length}) no es válida según su especificación.`,
          en: `Length of tag '${fSpec.tag}' (${tok.value.length}) is invalid per specification.`
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
          es: `El valor del tag '${fSpec.tag}' no cumple con la codificación ${fSpec.encoding}.`,
          en: `Tag '${fSpec.tag}' value does not comply with ${fSpec.encoding} encoding.`
        },
        start: tok.start,
        end: tok.end,
        fieldId: fSpec.id
      });
    }

    // Validate enum
    let enumMeaning = undefined;
    if (fSpec.enumValues && fSpec.enumValues.length > 0) {
      const option = fSpec.enumValues.find((o) => o.value === tok.value);
      if (option) {
        enumMeaning = option.label;
      } else {
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
      }
    }

    const maskedVal = fSpec.sensitive
      ? maskSensitiveValue(tok.value)
      : tok.value;

    fields.push({
      id: fSpec.id,
      name: fSpec.name,
      description: fSpec.description,
      rawValue: tok.value,
      decodedValue: tok.value,
      maskedValue: maskedVal,
      start: tok.start,
      end: tok.end,
      encoding: fSpec.encoding,
      sensitive: !!fSpec.sensitive,
      valid: fieldValid,
      tag: tok.tag,
      enumMeaning,
      notes: fSpec.notes
    });

    segments.push({
      id: `seg-tag-${tok.tag}`,
      role: 'tag',
      label: fSpec.name,
      rawValue: tok.rawToken,
      start: tok.start,
      end: tok.end,
      fieldId: fSpec.id,
      tag: tok.tag
    });
  }

  // Check required fields in matchedCommand (SF-02)
  if (matchedCommand && !isErrorResponse) {
    for (const f of matchedCommand.fields) {
      if (f.required && f.tag && !seenTags.has(f.tag)) {
        valid = false;
        diagnostics.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'error',
          message: {
            es: `Falta el tag obligatorio '${f.tag}' (${f.name.es}).`,
            en: `Missing required tag '${f.tag}' (${f.name.en}).`
          },
          fieldId: f.id
        });
      }
    }
  }

  // Record end delimiter segment
  segments.push({
    id: 'seg-end-delim',
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
    framingType: 'tag-value',
    detectedDirection,
    expectedDirection: options?.expectedDirection,
    commandCode,
    matchedCommand,
    pairedCommand,
    isErrorResponse,
    errorCode,
    errorSpec,
    offendingFieldOrTag,
    echoToken,
    segments,
    fields,
    diagnostics,
    valid: valid && !isErrorResponse
  };
}
