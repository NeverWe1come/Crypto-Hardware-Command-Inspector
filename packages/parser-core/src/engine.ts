/**
 * @packageDocumentation
 * Main parser entry point and command correlation engine for `@chci/parser-core`.
 */

import { parseDelimitedPositional } from './delimited-positional';
import { parseHeaderPositional } from './header-positional';
import { normalizeInput } from './normalizer';
import { parseTagValue } from './tag-value';
import type {
  CommandSpec,
  CorrelationCheck,
  CorrelationResult,
  DeviceSpec,
  DeviceVersionSpec,
  ParseCommandOptions,
  ParseDiagnostic,
  ParseResult
} from './types';

/**
 * Resolves a device version specification, merging inherited commands and error codes
 * through the `extends` chain.
 *
 * @param spec - Device specification containing version definitions.
 * @param version - Optional version identifier (defaults to `spec.defaultVersion`).
 * @param visited - Recursion tracking set used to detect circular dependency loops.
 * @returns Fully resolved DeviceVersionSpec with flattened commands and error codes.
 * @throws {Error} If version does not exist in the specification or cyclic inheritance is detected.
 */
export function resolveDeviceVersion(
  spec: DeviceSpec,
  version?: string,
  visited = new Set<string>()
): DeviceVersionSpec {
  const versionKey = version ?? spec.defaultVersion;
  if (visited.has(versionKey)) {
    throw new Error(
      `Cyclic version inheritance detected in device "${spec.id}" at version "${versionKey}"`
    );
  }
  visited.add(versionKey);

  const current = spec.versions[versionKey];
  if (!current) {
    throw new Error(
      `Version "${versionKey}" does not exist in device "${spec.id}"`
    );
  }

  if (!current.extends) {
    return current;
  }

  const base = resolveDeviceVersion(spec, current.extends, visited);
  const commandMap = new Map<string, CommandSpec>();

  for (const cmd of base.commands) {
    commandMap.set(cmd.id, cmd);
  }
  for (const cmd of current.commands) {
    commandMap.set(cmd.id, cmd);
  }

  return {
    version: current.version,
    label: current.label,
    releaseNotes: current.releaseNotes ?? base.releaseNotes,
    commands: Array.from(commandMap.values()),
    errorCodes: { ...base.errorCodes, ...current.errorCodes }
  };
}

/**
 * Parses any supported cryptographic command string against a device specification.
 * Automatically dispatches to the corresponding protocol framing parser.
 *
 * @param raw - Raw ASCII or hexadecimal command string.
 * @param deviceSpec - Target cryptographic device specification.
 * @param options - Optional runtime parsing overrides (version, expectedDirection, headerLength).
 * @returns Complete immutable ParseResult.
 *
 * @example
 * ```typescript
 * const parsed = parseCommand('A00000U0123456789ABCDEF0123456789ABCDEF', thalesSpec);
 * console.log(parsed.commandCode); // "A0"
 * console.log(parsed.fields.length); // 3
 * ```
 */
export function parseCommand(
  raw: string,
  deviceSpec: DeviceSpec,
  options?: ParseCommandOptions
): ParseResult {
  const normalized = normalizeInput(raw);

  if (normalized.normalized.length === 0) {
    const versionKey = options?.version ?? deviceSpec.defaultVersion;
    return {
      deviceId: deviceSpec.id,
      version: versionKey,
      raw,
      normalized,
      framingType: deviceSpec.framing.type,
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
            es: 'El comando introducido está vacío o solo contiene espacios.',
            en: 'The provided command input is empty or whitespace only.'
          }
        }
      ],
      valid: false
    };
  }

  let result: ParseResult;

  switch (deviceSpec.framing.type) {
    case 'delimited-positional':
      result = parseDelimitedPositional(raw, deviceSpec, options);
      break;
    case 'header-positional':
      result = parseHeaderPositional(raw, deviceSpec, options);
      break;
    case 'tag-value':
      result = parseTagValue(raw, deviceSpec, options);
      break;
    default: {
      const _exhaustive: never = deviceSpec.framing;
      throw new Error(`Unsupported framing type: ${JSON.stringify(_exhaustive)}`);
    }
  }

  // Check direction mismatch warning
  if (
    options?.expectedDirection &&
    result.detectedDirection !== 'unknown' &&
    result.detectedDirection !== options.expectedDirection
  ) {
    const mismatchDiagnostic: ParseDiagnostic = {
      code: 'DIRECTION_MISMATCH',
      severity: 'warning',
      message: {
        es: `La dirección seleccionada (${options.expectedDirection === 'request' ? 'Petición' : 'Respuesta'}) no coincide con la dirección detectada (${result.detectedDirection === 'request' ? 'Petición' : 'Respuesta'}).`,
        en: `Selected direction (${options.expectedDirection}) does not match detected direction (${result.detectedDirection}).`
      }
    };

    result = {
      ...result,
      diagnostics: [...result.diagnostics, mismatchDiagnostic]
    };
  }

  return result;
}

/**
 * Correlates a parsed request command with a parsed response command,
 * verifying command codes, header echo matching, context echo matching, and error statuses.
 *
 * @param requestResult - ParseResult of the request command.
 * @param responseResult - ParseResult of the candidate response command.
 * @param _deviceSpec - Cryptographic device specification.
 * @returns CorrelationResult with granular check results.
 *
 * @example
 * ```typescript
 * const correlation = correlateCommands(reqResult, resResult, spec);
 * console.log(correlation.isCorrelated); // true
 * ```
 */
export function correlateCommands(
  requestResult: ParseResult,
  responseResult: ParseResult,
  _deviceSpec: DeviceSpec
): CorrelationResult {
  const reqCmd = requestResult.matchedCommand;

  const expectedResponseCode = reqCmd?.pairedCode ?? null;
  const responseCode = responseResult.commandCode;

  // Command pair matching
  let commandPairMatches = false;
  if (expectedResponseCode && responseCode) {
    commandPairMatches = expectedResponseCode === responseCode;
  }

  // Echo token matching (header, Futurex AG tag, or Atalla ^Context)
  let echoMatches = true;
  if (requestResult.echoToken || responseResult.echoToken) {
    echoMatches = requestResult.echoToken === responseResult.echoToken;
  }

  const isErrorResponse = responseResult.isErrorResponse;
  const errorCode = responseResult.errorCode;
  const errorSpec = responseResult.errorSpec;

  const isCorrelated = commandPairMatches && echoMatches;

  const checks: CorrelationCheck[] = [
    {
      id: 'direction-order',
      passed:
        requestResult.detectedDirection === 'request' &&
        responseResult.detectedDirection === 'response',
      label: { es: 'Orden de Dirección', en: 'Direction Ordering' },
      details: {
        es: 'Comprueba que el primer comando sea una petición y el segundo una respuesta.',
        en: 'Verifies that the first command is a request and the second is a response.'
      }
    },
    {
      id: 'command-pair',
      passed: commandPairMatches,
      label: { es: 'Par de Comandos', en: 'Command Pair' },
      details: {
        es: `Petición ${requestResult.commandCode ?? 'desconocida'} emparejada con respuesta ${responseCode ?? 'desconocida'} (esperado ${expectedResponseCode ?? 'N/A'}).`,
        en: `Request ${requestResult.commandCode ?? 'unknown'} paired with response ${responseCode ?? 'unknown'} (expected ${expectedResponseCode ?? 'N/A'}).`
      }
    },
    {
      id: 'header-echo',
      passed: echoMatches,
      label: { es: 'Verificación de Eco', en: 'Echo / Header Match' },
      details: {
        es: echoMatches
          ? 'El token de eco o cabecera coincide exactamente entre la petición y la respuesta.'
          : 'El token de eco o cabecera difiere entre la petición y la respuesta.',
        en: echoMatches
          ? 'Echo token or message header matches between request and response.'
          : 'Echo token or message header does not match between request and response.'
      }
    },
    {
      id: 'response-status',
      passed: !isErrorResponse,
      label: { es: 'Estado de Respuesta', en: 'Response Status' },
      details: {
        es: isErrorResponse
          ? `La respuesta reporta un código de error: ${errorCode ?? 'N/A'}`
          : 'La respuesta reporta éxito sin errores.',
        en: isErrorResponse
          ? `Response reports an error code: ${errorCode ?? 'N/A'}`
          : 'Response reports success with no errors.'
      }
    }
  ];

  return {
    isCorrelated,
    requestCommandCode: requestResult.commandCode,
    responseCommandCode: responseCode,
    expectedResponseCode,
    commandPairMatches,
    echoMatches,
    isErrorResponse,
    errorCode,
    errorSpec,
    checks
  };
}
