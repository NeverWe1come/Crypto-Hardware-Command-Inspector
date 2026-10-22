/**
 * @packageDocumentation
 * Test suite for the cryptographic hardware catalog and lookup functions.
 *
 * Enforces catalog completeness across KMS, HSM_FINANCIAL, HSM_GP, and HSMAAS,
 * verifies MVP vs Coming-Soon device statuses, and validates catalog query utilities.
 */

import { describe, expect, it } from 'vitest';
import type { DeviceCategory } from '@chci/parser-core';
import {
  DEVICE_CATALOG,
  getAllDevices,
  getDeviceSpec,
  getSupportedDevices
} from '../index';

describe('Hardware Catalog & Device Discovery (`DEVICE_CATALOG`)', () => {
  it('exports a non-empty catalog of cryptographic hardware and KMS entries', () => {
    expect(Array.isArray(DEVICE_CATALOG)).toBe(true);
    expect(DEVICE_CATALOG.length).toBeGreaterThanOrEqual(8);
  });

  it('guarantees unique identifiers across all catalog entries', () => {
    const ids = DEVICE_CATALOG.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('contains devices covering all 4 architectural categories (KMS, HSM_FINANCIAL, HSM_GP, HSMAAS)', () => {
    const categories = new Set(DEVICE_CATALOG.map((d) => d.category));
    const requiredCategories: DeviceCategory[] = [
      'KMS',
      'HSM_FINANCIAL',
      'HSM_GP',
      'HSMAAS'
    ];

    for (const cat of requiredCategories) {
      expect(categories.has(cat)).toBe(true);
      const devicesInCat = DEVICE_CATALOG.filter((d) => d.category === cat);
      expect(devicesInCat.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('validates structural integrity of every catalog entry', () => {
    for (const device of DEVICE_CATALOG) {
      expect(typeof device.id).toBe('string');
      expect(device.id.trim().length).toBeGreaterThan(0);
      expect(device.id).toMatch(/^[a-z0-9-]+$/);

      expect(typeof device.name).toBe('string');
      expect(device.name.trim().length).toBeGreaterThan(0);

      expect(typeof device.vendor).toBe('string');
      expect(device.vendor.trim().length).toBeGreaterThan(0);

      expect(['KMS', 'HSM_FINANCIAL', 'HSM_GP', 'HSMAAS']).toContain(
        device.category
      );
      expect(['supported', 'coming-soon']).toContain(device.status);

      expect(device.summary).toBeDefined();
      expect(typeof device.summary.es).toBe('string');
      expect(device.summary.es.trim().length).toBeGreaterThan(0);
      expect(typeof device.summary.en).toBe('string');
      expect(device.summary.en.trim().length).toBeGreaterThan(0);
    }
  });

  describe('Supported Hardware Devices Status', () => {
    it('marks all 10 devices in catalog as supported', () => {
      expect(DEVICE_CATALOG.length).toBe(10);
      for (const device of DEVICE_CATALOG) {
        expect(device.status).toBe('supported');
        if (device.status === 'supported') {
          expect(device.defaultVersion).toBeDefined();
          expect(device.framing).toBeDefined();
          expect(device.versions).toBeDefined();
        }
      }
    });

    const expectedDevices = [
      { id: 'utimaco-atalla-at1000', vendor: 'Utimaco', category: 'HSM_FINANCIAL', version: '8.60' },
      { id: 'thales-payshield-10k', vendor: 'Thales', category: 'HSM_FINANCIAL', version: '2.3' },
      { id: 'futurex-excrypt', vendor: 'Futurex', category: 'HSM_FINANCIAL', version: '7.6.1' },
      { id: 'ibm-cca-4769', vendor: 'IBM', category: 'HSM_FINANCIAL', version: '8.1' },
      { id: 'thales-luna-7', vendor: 'Thales', category: 'HSM_GP', version: '7.8.0' },
      { id: 'yubico-yubihsm-2', vendor: 'Yubico', category: 'HSM_GP', version: '2.4.0' },
      { id: 'marvell-liquid-security', vendor: 'Marvell', category: 'HSM_GP', version: '3.4.0' },
      { id: 'aws-kms', vendor: 'Amazon Web Services', category: 'KMS', version: '2014-11-01' },
      { id: 'hashicorp-vault', vendor: 'HashiCorp', category: 'KMS', version: '1.18' },
      { id: 'azure-payment-hsm', vendor: 'Microsoft Azure', category: 'HSMAAS', version: '2024-02-01' }
    ] as const;

    for (const { id, vendor, category, version } of expectedDevices) {
      it(`verifies ${id} cataloged under ${category} (${vendor}, v${version})`, () => {
        const item = DEVICE_CATALOG.find((d) => d.id === id);
        expect(item).toBeDefined();
        expect(item?.status).toBe('supported');
        expect(item?.vendor).toBe(vendor);
        expect(item?.category).toBe(category);
        expect(item?.defaultVersion).toBe(version);
      });
    }
  });

  describe('Helper Functions (`getAllDevices`, `getSupportedDevices`, `getDeviceSpec`)', () => {
    it('getAllDevices() returns the full catalog array', () => {
      const all = getAllDevices();
      expect(all).toEqual(DEVICE_CATALOG);
      expect(all.length).toBe(10);
    });

    it('getSupportedDevices() returns all 10 supported devices', () => {
      const supported = getSupportedDevices();
      expect(supported.length).toBe(10);

      for (const dev of supported) {
        expect(dev.status).toBe('supported');
        expect(dev.defaultVersion).toBeDefined();
        expect(dev.framing).toBeDefined();
        expect(dev.versions).toBeDefined();
      }

      const supportedIds = supported.map((d) => d.id);
      expect(supportedIds).toContain('utimaco-atalla-at1000');
      expect(supportedIds).toContain('thales-payshield-10k');
      expect(supportedIds).toContain('futurex-excrypt');
      expect(supportedIds).toContain('thales-luna-7');
      expect(supportedIds).toContain('ibm-cca-4769');
      expect(supportedIds).toContain('yubico-yubihsm-2');
      expect(supportedIds).toContain('aws-kms');
      expect(supportedIds).toContain('hashicorp-vault');
      expect(supportedIds).toContain('marvell-liquid-security');
      expect(supportedIds).toContain('azure-payment-hsm');
    });

    it('getDeviceSpec(id) returns the complete DeviceSpec for supported devices', () => {
      for (const item of DEVICE_CATALOG) {
        const spec = getDeviceSpec(item.id);
        expect(spec).toBeDefined();
        expect(spec?.id).toBe(item.id);
        expect(spec?.status).toBe('supported');
        expect(spec?.interfaces).toBeDefined();
        expect(spec?.interfaces?.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('getDeviceSpec(id) returns undefined for invalid IDs', () => {
      expect(getDeviceSpec('non-existent-device')).toBeUndefined();
      expect(getDeviceSpec('')).toBeUndefined();
      expect(getDeviceSpec('   ')).toBeUndefined();
    });
  });
});
