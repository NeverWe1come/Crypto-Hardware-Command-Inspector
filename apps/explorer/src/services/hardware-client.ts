/**
 * @packageDocumentation
 * Hardware socket communication client executing commands over TCP, TLS, and mTLS via Tauri Rust backend (`@chci/explorer`).
 */

import type { HardwareConnectionConfig } from '../state/types';

export interface HardwareExecutionResult {
  readonly success: boolean;
  readonly response?: string;
  readonly error?: string;
  readonly elapsedMs?: number;
}

/**
 * Sends a cryptographic command to a remote hardware security module or KMS using the configured connection.
 *
 * @param connection - Target IP/port and security protocol (TCP/TLS/mTLS).
 * @param payload - Raw command string to send.
 * @param framingType - Device framing protocol (e.g. 'header-positional', 'delimited-positional').
 * @returns Result with response string or error.
 */
interface TauriInternals {
  invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
}

export async function sendHardwareCommand(
  connection: HardwareConnectionConfig,
  payload: string,
  framingType?: string
): Promise<HardwareExecutionResult> {
  const startTime = Date.now();

  // Check if running within Tauri desktop application
  const tauriWindow =
    typeof window !== 'undefined'
      ? (window as unknown as { __TAURI_INTERNALS__?: TauriInternals })
      : undefined;

  if (tauriWindow?.__TAURI_INTERNALS__?.invoke) {
    try {
      const res = await tauriWindow.__TAURI_INTERNALS__.invoke<HardwareExecutionResult>(
        'send_hardware_command',
        {
          request: {
            host: connection.host,
            port: connection.port,
            connection_type: connection.connectionType,
            payload,
            framing_type: framingType,
            timeout_ms: 5000,
            ca_cert_pem: connection.caCertPem,
            client_cert_pem: connection.clientCertPem,
            client_key_pem: connection.clientKeyPem
          }
        }
      );
      return {
        ...res,
        elapsedMs: Date.now() - startTime
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
      return {
        success: false,
        error: `Error de comunicación Tauri: ${message}`,
        elapsedMs: Date.now() - startTime
      };
    }
  }

  // Running in browser web sandbox (simulated or non-Tauri)
  return {
    success: false,
    error: `La ejecución directa contra sockets de red (TCP/TLS/mTLS) requiere la aplicación de escritorio CHCI (Tauri v2). En el navegador web el acceso a sockets raw está bloqueado por la política de seguridad del navegador.`,
    elapsedMs: Date.now() - startTime
  };
}
