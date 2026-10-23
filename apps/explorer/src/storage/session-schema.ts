/**
 * @packageDocumentation
 * Zod validation schemas and serialization utilities for workspace session export files (`chci-session-v1.json`).
 */

import { z } from 'zod';
import type { SavedSession, SessionExport } from './types';

/**
 * Zod schema validating a command inspection direction.
 */
export const CommandDirectionSchema = z.enum(['request', 'response']);

/**
 * Zod schema validating a hardware connection protocol.
 */
export const HardwareConnectionTypeSchema = z.enum(['TCP', 'TLS', 'mTLS']);

/**
 * Zod schema validating a hardware connection configuration.
 */
export const HardwareConnectionConfigSchema = z.object({
  id: z.string().min(1, 'El ID de conexión no puede estar vacío'),
  deviceId: z.string().min(1, 'El ID de dispositivo es obligatorio'),
  host: z.string().min(1, 'El host/IP es obligatorio'),
  port: z.number().int().min(1).max(65535, 'El puerto debe estar entre 1 y 65535'),
  connectionType: HardwareConnectionTypeSchema,
  caCertPem: z.string().optional(),
  clientCertPem: z.string().optional(),
  clientKeyPem: z.string().optional()
});

/**
 * Zod schema validating an inspected cryptographic command entry.
 */
export const CommandEntrySchema = z.object({
  id: z.string().min(1, 'El ID del comando no puede estar vacío'),
  raw: z.string(),
  version: z.string().min(1, 'La versión del comando es obligatoria'),
  direction: CommandDirectionSchema,
  linkedCommandId: z.string().nullable().optional(),
  headerLength: z.number().int().nonnegative('La longitud de cabecera debe ser un entero no negativo').optional(),
  interfaceId: z.string().optional(),
  liveExecutionEnabled: z.boolean().optional(),
  selectedConnectionId: z.string().optional(),
  liveResponseRaw: z.string().optional()
});

/**
 * Zod schema validating a hardware workspace tab.
 */
export const WorkspaceTabSchema = z.object({
  id: z.string().min(1, 'El ID de pestaña es obligatorio'),
  deviceId: z.string().min(1, 'El ID de dispositivo es obligatorio'),
  version: z.string().min(1, 'La versión de firmware es obligatoria'),
  headerLength: z.number().int().nonnegative('La longitud de cabecera debe ser un entero no negativo').optional(),
  interfaceId: z.string().optional(),
  commands: z.array(CommandEntrySchema),
  activeCommandId: z.string().nullable()
});

/**
 * Zod schema validating the entire immutable workspace state tree.
 */
export const WorkspaceStateSchema = z.object({
  locale: z.enum(['es', 'en', 'gl']),
  theme: z.enum(['dark', 'light', 'system']),
  activeTabId: z.string().nullable(),
  tabs: z.array(WorkspaceTabSchema),
  catalogSearchQuery: z.string(),
  selectedCategory: z.enum(['ALL', 'KMS', 'HSM_FINANCIAL', 'HSM_GP', 'HSMAAS']),
  hardwareConnections: z.array(HardwareConnectionConfigSchema).default([])
});

/**
 * Zod schema validating a saved session entity.
 */
export const SavedSessionSchema = z.object({
  id: z.string().min(1, 'El ID de sesión no puede estar vacío'),
  name: z.string().min(1, 'El nombre de sesión es obligatorio'),
  createdAt: z.string().min(1, 'Fecha de creación obligatoria'),
  updatedAt: z.string().min(1, 'Fecha de actualización obligatoria'),
  state: WorkspaceStateSchema
}).strict();

/**
 * Zod schema validating the complete exported JSON envelope (`chci-session-v1.json`).
 */
export const SessionExportSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string().min(1, 'Marca de tiempo de exportación obligatoria'),
  session: SavedSessionSchema
}).strict();

/** Inferred TypeScript type representing the complete exported session file envelope. */
export type SessionExportSchemaType = z.infer<typeof SessionExportSchema>;

/** Inferred TypeScript type representing an individual saved session record. */
export type SavedSessionSchemaType = z.infer<typeof SavedSessionSchema>;

/** Inferred TypeScript type validating the workspace state hierarchy. */
export type WorkspaceStateSchemaType = z.infer<typeof WorkspaceStateSchema>;

/** Inferred TypeScript type validating an individual workspace tab. */
export type WorkspaceTabSchemaType = z.infer<typeof WorkspaceTabSchema>;

/** Inferred TypeScript type validating an individual cryptographic command entry. */
export type CommandEntrySchemaType = z.infer<typeof CommandEntrySchema>;

/**
 * Serializes a saved session to a clean, formatted JSON string conforming to `SessionExportSchema`.
 *
 * @param session - Saved session to export.
 * @returns Indented JSON string ready for file download.
 */
export function exportSessionToJson(session: SavedSession): string {
  const exportPayload: SessionExport = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    session
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Validates and parses raw JSON text content from an imported session file.
 * Returns a typed success result or a descriptive failure error string.
 *
 * @param jsonString - Raw string read from the uploaded `.json` file.
 * @returns Result object with parsed `SessionExport` or validation error message.
 */
export function validateAndParseSessionJson(
  jsonString: string
): { success: true; data: SessionExport } | { success: false; error: string } {
  if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
    return { success: false, error: 'El archivo está vacío o no contiene datos válidos' };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sintaxis JSON no válida';
    return { success: false, error: `Error de sintaxis JSON: ${message}` };
  }

  const result = SessionExportSchema.safeParse(parsedJson);
  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => {
        const pathStr = issue.path.length > 0 ? `[${issue.path.join('.')}] ` : '';
        return `${pathStr}${issue.message}`;
      })
      .join('; ');
    return { success: false, error: `Validación fallida: ${formattedErrors}` };
  }

  return { success: true, data: result.data as unknown as SessionExport };
}
