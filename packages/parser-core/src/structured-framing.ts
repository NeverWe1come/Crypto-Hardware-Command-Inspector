/**
 * @packageDocumentation
 * Structured protocol framing parser (`@chci/parser-core`).
 * Decomposes structured payloads across industry standard and proprietary interfaces:
 * - `json`: REST APIs (Thales Luna REST, Vault Transit, AWS KMS, Azure Managed HSM).
 * - `xml`: OASIS KMIP XML messages (`<RequestMessage>`, `<ResponseMessage>`).
 * - `callable`: C APIs & IBM CCA Callable Service verbs (`C_Encrypt(...)`, `CSNBENC(...)`).
 * - `cli`: Appliance and operator shell commands (`lunash:> ...`, `vault write ...`, `aws kms ...`).
 */

import { resolveDeviceVersion } from './engine';
import { maskSensitiveValue, normalizeInput } from './normalizer';
import type {
  CommandDirection,
  CommandSpec,
  DeviceSpec,
  FrameSegment,
  ParseCommandOptions,
  ParseDiagnostic,
  ParsedField,
  ParseResult,
  StructuredFramingConfig
} from './types';
import { validateEncoding, validateFieldLength } from './validation';

/**
 * Parses structured payloads (JSON, KMIP XML, Callable APIs, CLIs) against a device specification.
 *
 * @param raw - Raw command string.
 * @param deviceSpec - Target cryptographic device specification.
 * @param options - Optional parser parameters (version, direction, interfaceId).
 * @param framingConfig - Structured framing configuration.
 * @returns Fully parsed and validated ParseResult.
 */
export function parseStructuredFraming(
  raw: string,
  deviceSpec: DeviceSpec,
  options?: ParseCommandOptions,
  framingConfig?: StructuredFramingConfig
): ParseResult {
  const normalized = normalizeInput(raw);
  const versionKey = options?.version ?? deviceSpec.defaultVersion;
  const versionSpec = resolveDeviceVersion(deviceSpec, versionKey);

  // Filter commands by active interface if specified
  const interfaceCommands = options?.interfaceId
    ? versionSpec.commands.filter((cmd) => !cmd.interfaceId || cmd.interfaceId === options.interfaceId)
    : versionSpec.commands;

  const candidateCommands = interfaceCommands.length > 0 ? interfaceCommands : versionSpec.commands;

  const format = framingConfig?.format ?? detectStructuredFormat(normalized.normalized);

  switch (format) {
    case 'json':
      return parseJsonStructured(raw, normalized, deviceSpec, versionKey, candidateCommands, options, framingConfig);
    case 'xml':
      return parseXmlStructured(raw, normalized, deviceSpec, versionKey, candidateCommands, options, framingConfig);
    case 'callable':
      return parseCallableStructured(raw, normalized, deviceSpec, versionKey, candidateCommands, options, framingConfig);
    case 'cli':
      return parseCliStructured(raw, normalized, deviceSpec, versionKey, candidateCommands, options, framingConfig);
  }
}

/**
 * Heuristically detects the structured format of a normalized command string.
 */
function detectStructuredFormat(text: string): 'json' | 'xml' | 'callable' | 'cli' {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[') || /^(POST|GET|PUT|DELETE)\s+\//i.test(trimmed)) {
    return 'json';
  }
  if (trimmed.startsWith('<') && !trimmed.startsWith('<!')) {
    return 'xml';
  }
  if (/^[A-Za-z0-9_]+\s*\(/.test(trimmed)) {
    return 'callable';
  }
  return 'cli';
}

/**
 * Parses JSON structured requests/responses (e.g., Vault Transit, AWS KMS, Luna REST, Azure).
 */
function parseJsonStructured(
  raw: string,
  normalized: ReturnType<typeof normalizeInput>,
  deviceSpec: DeviceSpec,
  versionKey: string,
  candidateCommands: readonly CommandSpec[],
  options?: ParseCommandOptions,
  _framingConfig?: StructuredFramingConfig
): ParseResult {
  const text = normalized.normalized;
  const diagnostics: ParseDiagnostic[] = [];
  const segments: FrameSegment[] = [];
  const fields: ParsedField[] = [];

  let jsonStr = text;
  let httpOffset = 0;

  // Handle optional HTTP header line like: POST /v1/transit/encrypt/key HTTP/1.1\n\n{...}
  const httpMatch = text.match(/^(?:(POST|GET|PUT|DELETE)\s+([^\s?#]+)[^\r\n]*\r?\n(?:[^\r\n]*\r?\n)*\r?\n)?([\s\S]*)$/i);
  let httpPath: string | null = null;
  let httpMethod: string | null = null;

  if (httpMatch && httpMatch[1] && httpMatch[2]) {
    httpMethod = httpMatch[1].toUpperCase();
    httpPath = httpMatch[2];
    const headerPart = text.slice(0, text.length - (httpMatch[3]?.length ?? 0));
    httpOffset = headerPart.length;
    jsonStr = httpMatch[3] ?? '';

    segments.push({
      id: 'seg_http_header',
      role: 'header',
      label: { es: `Cabecera HTTP (${httpMethod})`, en: `HTTP Header (${httpMethod})` },
      rawValue: headerPart,
      start: 0,
      end: httpOffset
    });
  }

  // Parse JSON object
  let parsedJson: Record<string, unknown> | null = null;
  try {
    parsedJson = JSON.parse(jsonStr.trim() || '{}') as Record<string, unknown>;
  } catch (e) {
    diagnostics.push({
      code: 'MALFORMED_FRAME',
      severity: 'error',
      message: {
        es: `Error de sintaxis JSON: ${(e as Error).message}`,
        en: `JSON syntax error: ${(e as Error).message}`
      }
    });
  }

  // Determine command code from HTTP path, Action, operation, command, or type
  let detectedCode: string | null = null;
  if (httpPath) {
    // E.g., /v1/transit/encrypt/my-key -> 'encrypt' or 'transit/encrypt'
    const cleanPath = httpPath.replace(/^\/api\/v\d+\/|^\/v\d+\/|^\/api\//, '');
    const segmentsList = cleanPath.split('/').filter(Boolean);
    if (segmentsList.length >= 2) {
      detectedCode = `${segmentsList[0]}/${segmentsList[1]}`;
    } else if (segmentsList.length === 1) {
      detectedCode = segmentsList[0] ?? null;
    }
  }

  if (!detectedCode && parsedJson) {
    detectedCode =
      (typeof parsedJson['Action'] === 'string' ? parsedJson['Action'] : null) ??
      (typeof parsedJson['operation'] === 'string' ? parsedJson['operation'] : null) ??
      (typeof parsedJson['command'] === 'string' ? parsedJson['command'] : null) ??
      (typeof parsedJson['type'] === 'string' ? parsedJson['type'] : null) ??
      (typeof parsedJson['method'] === 'string' ? parsedJson['method'] : null) ??
      null;
  }

  // Direction detection
  let detectedDirection: CommandDirection | 'unknown' = 'unknown';
  if (parsedJson) {
    if ('error' in parsedJson || 'Errors' in parsedJson || 'data' in parsedJson || 'CiphertextBlob' in parsedJson || 'KeyMetadata' in parsedJson) {
      detectedDirection = 'response';
    } else if (httpMethod === 'POST' || httpMethod === 'PUT' || 'Plaintext' in parsedJson || 'KeyId' in parsedJson) {
      detectedDirection = 'request';
    }
  }

  if (options?.expectedDirection && detectedDirection === 'unknown') {
    detectedDirection = options.expectedDirection;
  }

  // Match command
  let matchedCommand: CommandSpec | null = null;
  if (detectedCode) {
    const codeUpper = detectedCode.toUpperCase();
    matchedCommand =
      candidateCommands.find(
        (c) =>
          c.code.toUpperCase() === codeUpper &&
          (detectedDirection === 'unknown' || c.direction === detectedDirection)
      ) ??
      candidateCommands.find((c) => c.code.toUpperCase() === codeUpper) ??
      null;
  }

  // If no match found by explicit code, try matching first candidate whose fields overlap with JSON keys
  if (!matchedCommand && parsedJson && Object.keys(parsedJson).length > 0) {
    const jsonKeys = new Set(Object.keys(parsedJson).map((k) => k.toLowerCase()));
    let bestScore = 0;
    for (const cmd of candidateCommands) {
      if (detectedDirection !== 'unknown' && cmd.direction !== detectedDirection) continue;
      const matchCount = cmd.fields.filter((f) => jsonKeys.has(f.id.toLowerCase()) || jsonKeys.has(f.name.en.toLowerCase())).length;
      if (matchCount > bestScore) {
        bestScore = matchCount;
        matchedCommand = cmd;
      }
    }
  }

  if (matchedCommand) {
    detectedCode = matchedCommand.code;
    detectedDirection = matchedCommand.direction;
  }

  // Extract fields and segments from JSON properties
  if (parsedJson) {
    let fIdx = 0;
    for (const [key, value] of Object.entries(parsedJson)) {
      const valStr = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
      const fSpec = matchedCommand?.fields.find(
        (f) => f.id.toLowerCase() === key.toLowerCase() || f.name.en.toLowerCase() === key.toLowerCase()
      );

      // Locate key/value in raw JSON string for offset highlights
      const keyPattern = new RegExp(`"${escapeRegExp(key)}"\\s*:\\s*`, 'g');
      const match = keyPattern.exec(jsonStr);
      const valStart = match ? httpOffset + match.index + match[0].length : httpOffset;
      const valEnd = Math.min(valStart + valStr.length, text.length);

      const sensitive = !!fSpec?.sensitive || isSensitiveKey(key);
      const maskedValue = sensitive ? maskSensitiveValue(valStr) : valStr;

      let valid = true;
      if (fSpec) {
        if (!validateFieldLength(valStr, fSpec.length)) valid = false;
        if (!validateEncoding(valStr, fSpec.encoding)) valid = false;
      }

      fields.push({
        id: fSpec?.id ?? `field_${key}`,
        name: fSpec?.name ?? { es: key, en: key },
        description: fSpec?.description ?? { es: `Propiedad JSON "${key}"`, en: `JSON property "${key}"` },
        rawValue: valStr,
        decodedValue: valStr,
        maskedValue,
        start: valStart,
        end: valEnd,
        encoding: fSpec?.encoding ?? 'ascii',
        sensitive,
        valid,
        position: fIdx
      });

      segments.push({
        id: `seg_${key}`,
        role: fSpec?.sensitive ? 'field' : key.toLowerCase().includes('command') || key.toLowerCase().includes('action') ? 'command-code' : 'field',
        label: fSpec?.name ?? { es: key, en: key },
        rawValue: valStr,
        start: valStart,
        end: valEnd,
        fieldId: fSpec?.id ?? `field_${key}`
      });

      fIdx++;
    }
  }

  return {
    deviceId: deviceSpec.id,
    version: versionKey,
    interfaceId: options?.interfaceId,
    detectedInterfaceId: options?.interfaceId ?? 'rest-json',
    raw,
    normalized,
    framingType: 'structured',
    detectedDirection,
    expectedDirection: options?.expectedDirection,
    commandCode: detectedCode,
    matchedCommand,
    pairedCommand: null,
    isErrorResponse: parsedJson ? 'error' in parsedJson || 'Errors' in parsedJson : false,
    errorCode: parsedJson && typeof parsedJson['error'] === 'string' ? parsedJson['error'] : null,
    errorSpec: null,
    segments,
    fields,
    diagnostics,
    valid: diagnostics.every((d) => d.severity !== 'error')
  };
}

/**
 * Parses XML structured requests/responses (e.g., OASIS KMIP XML messages).
 */
function parseXmlStructured(
  raw: string,
  normalized: ReturnType<typeof normalizeInput>,
  deviceSpec: DeviceSpec,
  versionKey: string,
  candidateCommands: readonly CommandSpec[],
  options?: ParseCommandOptions,
  _framingConfig?: StructuredFramingConfig
): ParseResult {
  const text = normalized.normalized;
  const diagnostics: ParseDiagnostic[] = [];
  const segments: FrameSegment[] = [];
  const fields: ParsedField[] = [];

  // Determine direction from root tag
  let detectedDirection: CommandDirection | 'unknown' = 'unknown';
  if (/<RequestMessage/i.test(text)) {
    detectedDirection = 'request';
  } else if (/<ResponseMessage/i.test(text)) {
    detectedDirection = 'response';
  } else if (options?.expectedDirection) {
    detectedDirection = options.expectedDirection;
  }

  // Extract Operation tag or attribute
  let detectedCode: string | null = null;
  const opMatch = text.match(/<Operation[^>]*value="([^"]+)"/i) ?? text.match(/<Operation>([^<]+)<\/Operation>/i);
  if (opMatch && opMatch[1]) {
    detectedCode = opMatch[1].trim();
  } else {
    const rootMatch = text.match(/<([A-Za-z0-9_]+)[\s>]/);
    if (rootMatch && rootMatch[1] && !rootMatch[1].includes('Message')) {
      detectedCode = rootMatch[1];
    }
  }

  // Match command
  let matchedCommand: CommandSpec | null = null;
  if (detectedCode) {
    const codeUpper = detectedCode.toUpperCase();
    matchedCommand =
      candidateCommands.find(
        (c) =>
          c.code.toUpperCase() === codeUpper &&
          (detectedDirection === 'unknown' || c.direction === detectedDirection)
      ) ??
      candidateCommands.find((c) => c.code.toUpperCase() === codeUpper) ??
      null;
  }

  // Extract XML tags as fields (matching leaf tags or tags with attributes/text)
  const tagRegex = /<([A-Za-z0-9_:-]+)([^>]*?)(?:>([^<]*)<\/\1>|\/>)/g;
  let match: RegExpExecArray | null;
  let pIdx = 0;

  while ((match = tagRegex.exec(text)) !== null) {
    const tagName = match[1] ?? '';
    const tagAttrs = match[2] ?? '';
    const tagContent = match[3]?.trim() ?? '';
    if (!tagContent && !tagAttrs.includes('value=')) continue;

    const valStr = tagContent || (tagAttrs.match(/value="([^"]*)"/)?.[1] ?? '');
    const start = match.index;
    const end = match.index + match[0].length;

    const fSpec = matchedCommand?.fields.find(
      (f) => f.id.toLowerCase() === tagName.toLowerCase() || f.name.en.toLowerCase() === tagName.toLowerCase()
    );

    const sensitive = !!fSpec?.sensitive || isSensitiveKey(tagName);
    const maskedValue = sensitive ? maskSensitiveValue(valStr) : valStr;

    fields.push({
      id: fSpec?.id ?? `xml_${tagName}`,
      name: fSpec?.name ?? { es: tagName, en: tagName },
      description: fSpec?.description ?? { es: `Elemento XML <${tagName}>`, en: `XML element <${tagName}>` },
      rawValue: valStr,
      decodedValue: valStr,
      maskedValue,
      start,
      end,
      encoding: fSpec?.encoding ?? 'ascii',
      sensitive,
      valid: true,
      position: pIdx
    });

    segments.push({
      id: `seg_${tagName}_${pIdx}`,
      role: tagName.toLowerCase().includes('operation') ? 'command-code' : sensitive ? 'field' : 'field',
      label: fSpec?.name ?? { es: tagName, en: tagName },
      rawValue: valStr,
      start,
      end,
      fieldId: fSpec?.id ?? `xml_${tagName}`
    });

    pIdx++;
  }

  return {
    deviceId: deviceSpec.id,
    version: versionKey,
    interfaceId: options?.interfaceId,
    detectedInterfaceId: options?.interfaceId ?? 'kmip-xml',
    raw,
    normalized,
    framingType: 'structured',
    detectedDirection,
    expectedDirection: options?.expectedDirection,
    commandCode: detectedCode,
    matchedCommand,
    pairedCommand: null,
    isErrorResponse: /<ResultStatus[^>]*value="OperationFailed"/i.test(text),
    errorCode: text.match(/<ResultReason[^>]*value="([^"]+)"/i)?.[1] ?? null,
    errorSpec: null,
    segments,
    fields,
    diagnostics,
    valid: diagnostics.every((d) => d.severity !== 'error')
  };
}

/**
 * Parses C-style callable service function calls (e.g. `C_Encrypt(...)` or `CSNBENC(...)`).
 */
function parseCallableStructured(
  raw: string,
  normalized: ReturnType<typeof normalizeInput>,
  deviceSpec: DeviceSpec,
  versionKey: string,
  candidateCommands: readonly CommandSpec[],
  options?: ParseCommandOptions,
  _framingConfig?: StructuredFramingConfig
): ParseResult {
  const text = normalized.normalized;
  const diagnostics: ParseDiagnostic[] = [];
  const segments: FrameSegment[] = [];
  const fields: ParsedField[] = [];

  // Match FuncName(...)
  const callMatch = text.match(/^([A-Za-z0-9_]+)\s*\(([\s\S]*)\)\s*;?$/);
  if (!callMatch || !callMatch[1]) {
    diagnostics.push({
      code: 'MALFORMED_FRAME',
      severity: 'error',
      message: {
        es: 'Sintaxis de invocación no válida. Formato esperado: FUNCION(arg1, arg2, ...);',
        en: 'Invalid callable function syntax. Expected format: FUNCTION(arg1, arg2, ...);'
      }
    });

    return createEmptyStructuredResult(raw, normalized, deviceSpec, versionKey, options, diagnostics);
  }

  const funcName = callMatch[1].trim();
  const argsPayload = callMatch[2] ?? '';
  const argsStartOffset = text.indexOf('(') + 1;

  // Add function name segment
  segments.push({
    id: 'seg_func_name',
    role: 'command-code',
    label: { es: `Función C / Verbo (${funcName})`, en: `C Function / Verb (${funcName})` },
    rawValue: funcName,
    start: 0,
    end: funcName.length
  });

  // Match command
  const funcUpper = funcName.toUpperCase();
  const matchedCommand =
    (options?.expectedDirection
      ? candidateCommands.find(
          (c) => c.code.toUpperCase() === funcUpper && c.direction === options.expectedDirection
        )
      : null) ??
    candidateCommands.find((c) => c.code.toUpperCase() === funcUpper) ??
    null;

  const detectedDirection = matchedCommand?.direction ?? options?.expectedDirection ?? 'request';

  // Tokenize arguments inside parentheses
  const argTokens = splitArguments(argsPayload, argsStartOffset);

  let pIdx = 0;
  for (const tok of argTokens) {
    const fSpec = matchedCommand?.fields[pIdx];
    const sensitive = !!fSpec?.sensitive || isSensitiveKey(fSpec?.id ?? '') || isSensitiveKey(tok.key ?? '');
    const maskedValue = sensitive ? maskSensitiveValue(tok.value) : tok.value;

    let valid = true;
    if (fSpec && tok.value) {
      if (!validateFieldLength(tok.value, fSpec.length)) valid = false;
      if (!validateEncoding(tok.value, fSpec.encoding)) valid = false;
    }

    fields.push({
      id: fSpec?.id ?? (tok.key || `param_${pIdx + 1}`),
      name: fSpec?.name ?? { es: tok.key || `Parámetro ${pIdx + 1}`, en: tok.key || `Parameter ${pIdx + 1}` },
      description: fSpec?.description ?? { es: `Argumento posicional ${pIdx + 1}`, en: `Positional argument ${pIdx + 1}` },
      rawValue: tok.value,
      decodedValue: tok.value,
      maskedValue,
      start: tok.start,
      end: tok.end,
      encoding: fSpec?.encoding ?? 'ascii',
      sensitive,
      valid,
      position: pIdx
    });

    segments.push({
      id: `seg_arg_${pIdx}`,
      role: 'field',
      label: fSpec?.name ?? { es: tok.key || `Parámetro ${pIdx + 1}`, en: tok.key || `Parameter ${pIdx + 1}` },
      rawValue: tok.value,
      start: tok.start,
      end: tok.end,
      fieldId: fSpec?.id ?? (tok.key || `param_${pIdx + 1}`)
    });

    pIdx++;
  }

  return {
    deviceId: deviceSpec.id,
    version: versionKey,
    interfaceId: options?.interfaceId,
    detectedInterfaceId: options?.interfaceId ?? (funcUpper.startsWith('C_') ? 'pkcs11' : 'cca-verb'),
    raw,
    normalized,
    framingType: 'structured',
    detectedDirection,
    expectedDirection: options?.expectedDirection,
    commandCode: funcName,
    matchedCommand,
    pairedCommand: null,
    isErrorResponse: false,
    errorCode: null,
    errorSpec: null,
    segments,
    fields,
    diagnostics,
    valid: diagnostics.every((d) => d.severity !== 'error')
  };
}

/**
 * Parses CLI shell commands (e.g. `lunash:> hsm show`, `vault write transit/...`, `aws kms encrypt ...`).
 */
function parseCliStructured(
  raw: string,
  normalized: ReturnType<typeof normalizeInput>,
  deviceSpec: DeviceSpec,
  versionKey: string,
  candidateCommands: readonly CommandSpec[],
  options?: ParseCommandOptions,
  _framingConfig?: StructuredFramingConfig
): ParseResult {
  const text = normalized.normalized;
  const diagnostics: ParseDiagnostic[] = [];
  const segments: FrameSegment[] = [];
  const fields: ParsedField[] = [];

  // Strip prompt prefix like "lunash:> ", "yubihsm> ", "$ ", "admin# "
  const promptMatch = text.match(/^(?:[A-Za-z0-9_.-]+(?::>|[>$#])\s*|\$\s*)/);
  const promptOffset = promptMatch ? promptMatch[0].length : 0;
  const commandBody = text.slice(promptOffset).trim();

  const tokens = splitCliTokens(commandBody, promptOffset);

  if (tokens.length === 0) {
    return createEmptyStructuredResult(raw, normalized, deviceSpec, versionKey, options, diagnostics);
  }

  // First 1 or 2 tokens form the command code (e.g., 'hsm show', 'sign ecdsa', 'vault write')
  let detectedCode: string | null = null;
  let codeEndOffset = tokens[0]?.end ?? 0;
  let argStartIndex = 1;

  if (tokens.length >= 2) {
    const twoWordCandidate = `${tokens[0]?.value} ${tokens[1]?.value}`;
    if (candidateCommands.some((c) => c.code.toLowerCase() === twoWordCandidate.toLowerCase())) {
      detectedCode = twoWordCandidate;
      codeEndOffset = tokens[1]?.end ?? codeEndOffset;
      argStartIndex = 2;
    }
  }

  if (!detectedCode && tokens[0]) {
    detectedCode = tokens[0].value;
  }

  segments.push({
    id: 'seg_cli_command',
    role: 'command-code',
    label: { es: `Comando CLI (${detectedCode})`, en: `CLI Command (${detectedCode})` },
    rawValue: detectedCode ?? '',
    start: promptOffset,
    end: codeEndOffset
  });

  const matchedCommand =
    (options?.expectedDirection
      ? candidateCommands.find(
          (c) => c.code.toLowerCase() === detectedCode?.toLowerCase() && c.direction === options.expectedDirection
        )
      : null) ??
    candidateCommands.find((c) => c.code.toLowerCase() === detectedCode?.toLowerCase()) ??
    null;

  const detectedDirection = matchedCommand?.direction ?? options?.expectedDirection ?? 'request';

  // Process argument tokens
  const cliArgs = tokens.slice(argStartIndex);
  let pIdx = 0;
  for (const tok of cliArgs) {
    const isFlag = tok.value.startsWith('-');
    const fSpec = matchedCommand?.fields[pIdx];

    const sensitive = !!fSpec?.sensitive || isSensitiveKey(tok.value);
    const maskedValue = sensitive ? maskSensitiveValue(tok.value) : tok.value;

    fields.push({
      id: fSpec?.id ?? `arg_${pIdx + 1}`,
      name: fSpec?.name ?? { es: tok.value, en: tok.value },
      description: fSpec?.description ?? { es: `Argumento CLI ${pIdx + 1}`, en: `CLI argument ${pIdx + 1}` },
      rawValue: tok.value,
      decodedValue: tok.value,
      maskedValue,
      start: tok.start,
      end: tok.end,
      encoding: 'ascii',
      sensitive,
      valid: true,
      position: pIdx
    });

    segments.push({
      id: `seg_cli_arg_${pIdx}`,
      role: isFlag ? 'tag' : 'field',
      label: fSpec?.name ?? { es: tok.value, en: tok.value },
      rawValue: tok.value,
      start: tok.start,
      end: tok.end,
      fieldId: fSpec?.id ?? `arg_${pIdx + 1}`
    });

    pIdx++;
  }

  return {
    deviceId: deviceSpec.id,
    version: versionKey,
    interfaceId: options?.interfaceId,
    detectedInterfaceId: options?.interfaceId ?? 'cli',
    raw,
    normalized,
    framingType: 'structured',
    detectedDirection,
    expectedDirection: options?.expectedDirection,
    commandCode: detectedCode,
    matchedCommand,
    pairedCommand: null,
    isErrorResponse: commandBody.toLowerCase().includes('error:') || commandBody.toLowerCase().includes('failed:'),
    errorCode: null,
    errorSpec: null,
    segments,
    fields,
    diagnostics,
    valid: diagnostics.every((d) => d.severity !== 'error')
  };
}

/**
 * Splits comma-separated function argument list while honoring nested quotes/brackets.
 */
function splitArguments(argsStr: string, baseOffset: number): Array<{ key?: string; value: string; start: number; end: number }> {
  const result: Array<{ key?: string; value: string; start: number; end: number }> = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let tokenStart = baseOffset;

  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i] ?? '';
    if ((ch === '"' || ch === "'") && (i === 0 || argsStr[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = ch;
      } else if (ch === quoteChar) {
        inQuotes = false;
      }
      current += ch;
    } else if (ch === ',' && !inQuotes) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          result.push({
            key: trimmed.slice(0, eqIdx).trim(),
            value: trimmed.slice(eqIdx + 1).trim(),
            start: tokenStart,
            end: baseOffset + i
          });
        } else {
          result.push({
            value: trimmed,
            start: tokenStart,
            end: baseOffset + i
          });
        }
      }
      current = '';
      tokenStart = baseOffset + i + 1;
    } else {
      current += ch;
    }
  }

  const finalTrimmed = current.trim();
  if (finalTrimmed.length > 0) {
    const eqIdx = finalTrimmed.indexOf('=');
    if (eqIdx > 0) {
      result.push({
        key: finalTrimmed.slice(0, eqIdx).trim(),
        value: finalTrimmed.slice(eqIdx + 1).trim(),
        start: tokenStart,
        end: baseOffset + argsStr.length
      });
    } else {
      result.push({
        value: finalTrimmed,
        start: tokenStart,
        end: baseOffset + argsStr.length
      });
    }
  }

  return result;
}

/**
 * Splits CLI command into whitespace-separated tokens while respecting quoted strings.
 */
function splitCliTokens(cliStr: string, baseOffset: number): Array<{ value: string; start: number; end: number }> {
  const tokens: Array<{ value: string; start: number; end: number }> = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cliStr)) !== null) {
    const val = match[1] ?? match[2] ?? match[0];
    tokens.push({
      value: val,
      start: baseOffset + match.index,
      end: baseOffset + match.index + match[0].length
    });
  }

  return tokens;
}

/**
 * Detects whether a JSON key represents sensitive cryptographic material.
 */
function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  return (
    k.includes('plaintext') ||
    k.includes('keymaterial') ||
    k.includes('privatekey') ||
    k.includes('secret') ||
    k.includes('pin') ||
    k.includes('cvv') ||
    k.includes('cvc') ||
    k.includes('password')
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createEmptyStructuredResult(
  raw: string,
  normalized: ReturnType<typeof normalizeInput>,
  deviceSpec: DeviceSpec,
  versionKey: string,
  options: ParseCommandOptions | undefined,
  diagnostics: ParseDiagnostic[]
): ParseResult {
  return {
    deviceId: deviceSpec.id,
    version: versionKey,
    interfaceId: options?.interfaceId,
    raw,
    normalized,
    framingType: 'structured',
    detectedDirection: options?.expectedDirection ?? 'unknown',
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
