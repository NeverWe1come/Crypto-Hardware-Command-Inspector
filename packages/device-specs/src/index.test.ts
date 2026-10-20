import { describe, expect, it } from 'vitest';
import { DEVICE_SPECS_VERSION } from './index';

describe('@chci/device-specs bootstrap', () => {
  it('exports the package version', () => {
    expect(DEVICE_SPECS_VERSION).toBe('0.1.0');
  });
});
