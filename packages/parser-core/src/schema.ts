/**
 * @packageDocumentation
 * Runtime validation schemas using Zod for cryptographic hardware specifications.
 */

import { z } from 'zod';
import type { DeviceSpec, FieldSpec } from './types';

/**
 * Zod schema validating a bilingual string object (`es` and `en`).
 */
export const LocalizedStringSchema = z.object({
  es: z.string().trim().min(1, 'Spanish translation must not be empty'),
  en: z.string().trim().min(1, 'English translation must not be empty')
});

/**
 * Zod schema for delimited-positional framing configuration (e.g., Utimaco Atalla).
 */
export const DelimitedPositionalFramingConfigSchema = z.object({
  type: z.literal('delimited-positional'),
  startDelimiter: z.string().min(1),
  endDelimiter: z.string().min(1),
  fieldDelimiter: z.string().min(1),
  requireTrailingDelimiter: z.boolean().optional(),
  contextTagPrefix: z.string().optional()
});

/**
 * Zod schema for header-positional framing configuration (e.g., Thales payShield).
 */
export const HeaderPositionalFramingConfigSchema = z.object({
  type: z.literal('header-positional'),
  defaultHeaderLength: z.number().int().min(0),
  minHeaderLength: z.number().int().min(0).optional(),
  maxHeaderLength: z.number().int().min(0).optional(),
  commandCodeLength: z.number().int().min(1),
  responseErrorCodeLength: z.number().int().min(1),
  successErrorCode: z.string().min(1),
  endMessageDelimiter: z.string().optional(),
  lmkIdDelimiter: z.string().optional()
});

/**
 * Zod schema for field length specifications.
 */
export const FieldLengthSpecSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('fixed'),
    length: z.number().int().min(1, 'Fixed length must be positive')
  }),
  z
    .object({
      kind: z.literal('range'),
      min: z.number().int().min(0),
      max: z.number().int().min(0)
    })
    .refine((val) => val.min <= val.max, {
      message: 'Range min must be less than or equal to max'
    }),
  z.object({
    kind: z.literal('variable'),
    min: z.number().int().min(0).optional(),
    max: z.number().int().min(0).optional()
  }),
  z.object({
    kind: z.literal('delimited'),
    delimiter: z.string().min(1)
  }),
  z.object({
    kind: z.literal('thales-key')
  })
]);

/**
 * Zod schema for field character encoding.
 */
export const FieldEncodingSchema = z.enum([
  'ascii',
  'hex-ascii',
  'decimal',
  'base64',
  'alphanumeric',
  'binary-hex'
]);

/**
 * Zod schema for field enum options.
 */
export const FieldEnumOptionSchema = z.object({
  value: z.string(),
  label: LocalizedStringSchema,
  description: LocalizedStringSchema.optional()
});

/**
 * Zod schema for conditional field activation.
 */
export const FieldConditionSchema = z.object({
  fieldId: z.string().min(1),
  equals: z.union([z.string(), z.array(z.string())])
});

/**
 * Zod schema for individual command parameter specifications.
 */
export const FieldSpecSchema: z.ZodType<FieldSpec> = z.object({
  id: z.string().min(1),
  name: LocalizedStringSchema,
  description: LocalizedStringSchema,
  tag: z.string().optional(),
  position: z.number().int().min(0).optional(),
  length: FieldLengthSpecSchema,
  encoding: FieldEncodingSchema,
  required: z.boolean(),
  sensitive: z.boolean().optional(),
  prefixDelimiter: z.string().optional(),
  enumValues: z.array(FieldEnumOptionSchema).optional(),
  condition: FieldConditionSchema.optional(),
  notes: LocalizedStringSchema.optional(),
  example: z.string().optional()
});

/**
 * Zod schema for tag-value framing configuration (e.g., Futurex Excrypt).
 */
export const TagValueFramingConfigSchema = z.object({
  type: z.literal('tag-value'),
  startDelimiter: z.string().min(1),
  endDelimiter: z.string().min(1),
  pairDelimiter: z.string().min(1),
  commandTag: z.string().min(1),
  tagLength: z.number().int().min(1),
  errorCommandCode: z.string().optional(),
  errorCodeTag: z.string().optional(),
  offendingTagTag: z.string().optional(),
  errorMessageTag: z.string().optional(),
  universalTags: z.array(FieldSpecSchema).optional()
});

/**
 * Discriminated union of all framing configurations.
 */
export const FramingConfigSchema = z.discriminatedUnion('type', [
  DelimitedPositionalFramingConfigSchema,
  HeaderPositionalFramingConfigSchema,
  TagValueFramingConfigSchema
]);

/**
 * Zod schema for command examples.
 */
export const CommandExampleSpecSchema = z.object({
  title: LocalizedStringSchema,
  raw: z.string(),
  description: LocalizedStringSchema.optional()
});

/**
 * Zod schema for command specifications.
 */
export const CommandSpecSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  subCode: z.string().optional(),
  subCodeFieldIndex: z.number().int().min(0).optional(),
  direction: z.enum(['request', 'response']),
  pairedCode: z.string().optional(),
  name: LocalizedStringSchema,
  summary: LocalizedStringSchema,
  description: LocalizedStringSchema,
  category: LocalizedStringSchema,
  fields: z.array(FieldSpecSchema),
  source: z.string().min(1),
  notes: z.array(LocalizedStringSchema).optional(),
  examples: z.array(CommandExampleSpecSchema).optional()
});

/**
 * Zod schema for error code specifications.
 */
export const ErrorCodeSpecSchema = z.object({
  code: z.string().min(1),
  title: LocalizedStringSchema,
  description: LocalizedStringSchema,
  troubleshooting: LocalizedStringSchema.optional()
});

/**
 * Zod schema for device firmware version specifications.
 */
export const DeviceVersionSpecSchema = z.object({
  version: z.string().min(1),
  label: LocalizedStringSchema,
  releaseNotes: LocalizedStringSchema.optional(),
  extends: z.string().optional(),
  commands: z.array(CommandSpecSchema),
  errorCodes: z.record(z.string(), ErrorCodeSpecSchema)
});

/**
 * Root Zod schema for full cryptographic hardware specifications.
 */
export const DeviceSpecSchema: z.ZodType<DeviceSpec> = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    vendor: z.string().min(1),
    category: z.enum(['KMS', 'HSM_FINANCIAL', 'HSM_GP', 'HSMAAS']),
    status: z.enum(['supported', 'coming-soon']),
    icon: z.string().optional(),
    summary: LocalizedStringSchema,
    defaultVersion: z.string().min(1),
    framing: FramingConfigSchema,
    versions: z.record(z.string(), DeviceVersionSpecSchema)
  })
  .refine((data) => data.defaultVersion in data.versions, {
    message: 'defaultVersion must exist in the versions dictionary'
  })
  .refine(
    (data) =>
      Object.values(data.versions).every(
        (v) => !v.extends || v.extends in data.versions
      ),
    {
      message: 'Extended version must exist in the versions dictionary'
    }
  )
  .refine(
    (data) => {
      // Cycle detection in extends chain
      for (const [key, v] of Object.entries(data.versions)) {
        const visited = new Set<string>([key]);
        let curr = v.extends;
        while (curr) {
          if (visited.has(curr)) {
            return false;
          }
          visited.add(curr);
          curr = data.versions[curr]?.extends;
        }
      }
      return true;
    },
    {
      message: 'Cyclic version inheritance detected'
    }
  );

/**
 * Validates an arbitrary object against `DeviceSpecSchema` and returns the typed `DeviceSpec`.
 * Throws a ZodError if validation fails.
 *
 * @param spec - Unknown device spec payload.
 * @returns Validated typed DeviceSpec.
 */
export function validateDeviceSpec(spec: unknown): DeviceSpec {
  return DeviceSpecSchema.parse(spec);
}
