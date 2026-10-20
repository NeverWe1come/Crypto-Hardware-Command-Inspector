import { describe, expect, it } from 'vitest';
import { validateEncoding, validateFieldLength } from '../validation';

describe('validateEncoding', () => {
  it('handles empty string cleanly as true', () => {
    expect(validateEncoding('', 'ascii')).toBe(true);
    expect(validateEncoding('', 'hex-ascii')).toBe(true);
  });

  it('validates hex-ascii and binary-hex', () => {
    expect(validateEncoding('0123456789ABCDEFabcdef', 'hex-ascii')).toBe(true);
    expect(validateEncoding('0123G', 'hex-ascii')).toBe(false);
    expect(validateEncoding('AABBCC', 'binary-hex')).toBe(true);
    expect(validateEncoding('AABBZZ', 'binary-hex')).toBe(false);
  });

  it('validates decimal', () => {
    expect(validateEncoding('1234567890', 'decimal')).toBe(true);
    expect(validateEncoding('123A', 'decimal')).toBe(false);
  });

  it('validates alphanumeric', () => {
    expect(validateEncoding('AlphaNumeric123', 'alphanumeric')).toBe(true);
    expect(validateEncoding('Alpha#123', 'alphanumeric')).toBe(false);
  });

  it('validates printable ascii and base64', () => {
    expect(validateEncoding('Hello World! 123', 'ascii')).toBe(true);
    expect(validateEncoding('SGVsbG8gV29ybGQ=', 'base64')).toBe(true);
    expect(validateEncoding('Not Base64 ***', 'base64')).toBe(false);
  });
});

describe('validateFieldLength', () => {
  it('validates fixed length', () => {
    expect(validateFieldLength('1234', { kind: 'fixed', length: 4 })).toBe(true);
    expect(validateFieldLength('123', { kind: 'fixed', length: 4 })).toBe(false);
  });

  it('validates range length', () => {
    expect(validateFieldLength('12', { kind: 'range', min: 2, max: 4 })).toBe(true);
    expect(validateFieldLength('1234', { kind: 'range', min: 2, max: 4 })).toBe(true);
    expect(validateFieldLength('1', { kind: 'range', min: 2, max: 4 })).toBe(false);
    expect(validateFieldLength('12345', { kind: 'range', min: 2, max: 4 })).toBe(false);
  });

  it('validates variable length with and without bounds', () => {
    expect(validateFieldLength('abc', { kind: 'variable' })).toBe(true);
    expect(validateFieldLength('ab', { kind: 'variable', min: 2, max: 5 })).toBe(true);
    expect(validateFieldLength('a', { kind: 'variable', min: 2, max: 5 })).toBe(false);
    expect(validateFieldLength('abcdef', { kind: 'variable', min: 2, max: 5 })).toBe(false);
  });

  it('validates delimited and thales-key', () => {
    expect(validateFieldLength('anyValue', { kind: 'delimited', delimiter: ';' })).toBe(true);
    expect(validateFieldLength('U0123456789ABCDEF0123456789ABCDEF', { kind: 'thales-key' })).toBe(true);
    expect(validateFieldLength('Z1122334455667788', { kind: 'thales-key' })).toBe(true);
    expect(validateFieldLength('0123456789ABCDEF', { kind: 'thales-key' })).toBe(true);
    expect(validateFieldLength('0123456789ABCDEF0123456789ABCDEF', { kind: 'thales-key' })).toBe(true);
    expect(validateFieldLength('S0005X', { kind: 'thales-key' })).toBe(false);
    expect(validateFieldLength('S0006XX', { kind: 'thales-key' })).toBe(false);
    expect(validateFieldLength('S0006X', { kind: 'thales-key' })).toBe(true);
    expect(validateFieldLength('Z123', { kind: 'thales-key' })).toBe(false);
    expect(validateFieldLength('', { kind: 'thales-key' })).toBe(false);
  });
});
