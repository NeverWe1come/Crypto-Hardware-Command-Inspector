import { describe, expect, it } from 'vitest';
import { PARSER_CORE_VERSION } from './index';

describe('@chci/parser-core bootstrap', () => {
  it('exports the package version', () => {
    expect(PARSER_CORE_VERSION).toBe('0.1.0');
  });
});
