import { describe, expect, it } from 'vitest';
import { MASK_PLACEHOLDER, maskSensitiveValue, normalizeInput } from '../normalizer';

describe('normalizeInput', () => {
  it('returns empty normalized metrics for an empty string', () => {
    const result = normalizeInput('');
    expect(result).toEqual({
      original: '',
      normalized: '',
      leadingTrimmed: 0,
      trailingTrimmed: 0,
      byteLength: 0,
      charLength: 0,
      controlChars: []
    });
  });

  it('trims outer spaces, tabs, and line breaks while tracking trimmed counts', () => {
    const raw = '  \t <00#1234#> \r\n ';
    const result = normalizeInput(raw);

    expect(result.original).toBe(raw);
    expect(result.normalized).toBe('<00#1234#>');
    expect(result.leadingTrimmed).toBe(4);
    expect(result.trailingTrimmed).toBe(4);
    expect(result.charLength).toBe(10);
    expect(result.byteLength).toBe(10);
    expect(result.controlChars).toEqual([]);
  });

  it('handles whitespace-only input cleanly', () => {
    const raw = '   \r\n\t  ';
    const result = normalizeInput(raw);

    expect(result.normalized).toBe('');
    expect(result.charLength).toBe(0);
    expect(result.byteLength).toBe(0);
    expect(result.leadingTrimmed).toBe(raw.length);
    expect(result.trailingTrimmed).toBe(0);
    expect(result.controlChars).toEqual([]);
  });

  it('preserves framing control characters (0x02 STX, 0x03 ETX, 0x19 EM, 0x00 NUL) and records their metadata', () => {
    const raw = '\x020000NC\x19TRAILER\x00\x03';
    const result = normalizeInput(raw);

    expect(result.normalized).toBe(raw);
    expect(result.leadingTrimmed).toBe(0);
    expect(result.trailingTrimmed).toBe(0);
    expect(result.controlChars).toHaveLength(4);

    expect(result.controlChars[0]).toEqual({
      index: 0,
      code: 0x02,
      hex: '0x02',
      name: 'STX',
      symbol: '<STX>'
    });
    expect(result.controlChars[1]).toEqual({
      index: 7,
      code: 0x19,
      hex: '0x19',
      name: 'EM',
      symbol: '␙'
    });
    expect(result.controlChars[2]).toEqual({
      index: 15,
      code: 0x00,
      hex: '0x00',
      name: 'NUL',
      symbol: '<NUL>'
    });
    expect(result.controlChars[3]).toEqual({
      index: 16,
      code: 0x03,
      hex: '0x03',
      name: 'ETX',
      symbol: '<ETX>'
    });
  });

  it('detects inner CR (\\r) and LF (\\n) control characters inside a frame', () => {
    const raw = '  [AOECHO;AGLine1\r\nLine2;]  ';
    const result = normalizeInput(raw);

    expect(result.normalized).toBe('[AOECHO;AGLine1\r\nLine2;]');
    expect(result.leadingTrimmed).toBe(2);
    expect(result.trailingTrimmed).toBe(2);
    expect(result.controlChars).toEqual([
      {
        index: 15,
        code: 0x0d,
        hex: '0x0D',
        name: 'CR',
        symbol: '<CR>'
      },
      {
        index: 16,
        code: 0x0a,
        hex: '0x0A',
        name: 'LF',
        symbol: '<LF>'
      }
    ]);
  });

  it('computes accurate UTF-8 byteLength when multi-byte characters are present', () => {
    const raw = '[AOECHO;AGClavé€;]';
    const result = normalizeInput(raw);

    expect(result.charLength).toBe(18);
    // 'é' is 2 bytes in UTF-8, '€' is 3 bytes in UTF-8 -> 18 - 2 + 5 = 21 bytes
    expect(result.byteLength).toBe(21);
  });
});

describe('maskSensitiveValue', () => {
  it('masks non-empty sensitive strings with MASK_PLACEHOLDER (••••••••)', () => {
    expect(MASK_PLACEHOLDER).toBe('••••••••');
    expect(maskSensitiveValue('0123456789ABCDEF')).toBe('••••••••');
    expect(maskSensitiveValue('U0123456789ABCDEF0123456789ABCDEF')).toBe('••••••••');
    expect(maskSensitiveValue('1')).toBe('••••••••');
  });

  it('keeps empty strings empty when masking', () => {
    expect(maskSensitiveValue('')).toBe('');
  });
});
