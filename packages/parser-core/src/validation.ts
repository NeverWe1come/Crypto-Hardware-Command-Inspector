/**
 * @packageDocumentation
 * Common validation and encoding utilities for `@chci/parser-core`.
 */

import type { FieldEncoding, FieldLengthSpec } from './types';

/**
 * Validates a field's raw value against its encoding specification.
 *
 * @param value - Raw string to validate.
 * @param encoding - Required character encoding.
 * @returns True if valid or empty, false otherwise.
 */
export function validateEncoding(value: string, encoding: FieldEncoding): boolean {
  if (value.length === 0) return true;
  switch (encoding) {
    case 'hex-ascii':
    case 'binary-hex':
      return /^[0-9A-Fa-f]+$/.test(value);
    case 'decimal':
      return /^[0-9]+$/.test(value);
    case 'alphanumeric':
      return /^[0-9A-Za-z]+$/.test(value);
    case 'ascii':
      return /^[\x20-\x7E\t\r\n\u2018\u2019\u201C\u201D\u2013\u2014]*$/.test(value);
    case 'base64':
      return /^[A-Za-z0-9+/=]+$/.test(value);
    default: {
      const _exhaustive: never = encoding;
      return true;
    }
  }
}

/**
 * Exhaustively validates a field's length against its length specification.
 *
 * @param value - Field value.
 * @param spec - Declared length specification.
 * @returns True if length conforms to spec, false otherwise.
 */
export function validateFieldLength(value: string, spec: FieldLengthSpec): boolean {
  switch (spec.kind) {
    case 'fixed':
      return value.length === spec.length;
    case 'range':
      return value.length >= spec.min && value.length <= spec.max;
    case 'set':
      return spec.values.includes(value.length);
    case 'variable':
      return (
        (spec.min === undefined || value.length >= spec.min) &&
        (spec.max === undefined || value.length <= spec.max)
      );
    case 'delimited':
      return true;
    case 'thales-key': {
      if (value.length === 0) return false;
      const first = value[0];
      if (first === 'S' || first === 'R') {
        if (value.length < 5) return false;
        const declared = parseInt(value.slice(1, 5), 10);
        return !isNaN(declared) && declared === value.length;
      }
      if (first === 'Z') return value.length === 17;
      if (first === 'U' || first === 'X') return value.length === 33;
      if (first === 'T' || first === 'Y') return value.length === 49;
      return value.length === 16 || value.length === 32;
    }
    default: {
      const _exhaustive: never = spec;
      return true;
    }
  }
}

/**
 * Checks whether a given string is a valid Atalla volatile table reference
 * (e.g., "#0", "#1", "#99", or "T01", "V01", "00" through "99").
 *
 * @param value - Value to check.
 */
export function isVolatileTableLocation(value: string): boolean {
  if (!value) return false;
  // Common volatile table formats described in Atalla AT1000 manual:
  // - single digit or 2 digits 0-99
  // - preceded by optional prefix like V or T
  return /^(?:[VT]?[0-9]{1,3}|#[0-9]{1,3})$/i.test(value.trim());
}
