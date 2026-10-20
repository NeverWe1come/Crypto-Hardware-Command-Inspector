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

  describe('MVP Supported Devices Status', () => {
    it('marks Utimaco Atalla AT1000 as supported with HSM_FINANCIAL category', () => {
      const atalla = DEVICE_CATALOG.find((d) => d.id === 'utimaco-atalla-at1000');
      expect(atalla).toBeDefined();
      expect(atalla?.status).toBe('supported');
      expect(atalla?.category).toBe('HSM_FINANCIAL');
      expect(atalla?.vendor).toBe('Utimaco');
      expect(atalla?.defaultVersion).toBe('8.60');
    });

    it('marks Thales payShield 10K as supported with HSM_FINANCIAL category', () => {
      const thales = DEVICE_CATALOG.find((d) => d.id === 'thales-payshield-10k');
      expect(thales).toBeDefined();
      expect(thales?.status).toBe('supported');
      expect(thales?.category).toBe('HSM_FINANCIAL');
      expect(thales?.vendor).toBe('Thales');
      expect(thales?.defaultVersion).toBe('2.3');
    });

    it('marks Futurex Excrypt as supported with HSM_FINANCIAL category', () => {
      const futurex = DEVICE_CATALOG.find((d) => d.id === 'futurex-excrypt');
      expect(futurex).toBeDefined();
      expect(futurex?.status).toBe('supported');
      expect(futurex?.category).toBe('HSM_FINANCIAL');
      expect(futurex?.vendor).toBe('Futurex');
      expect(futurex?.defaultVersion).toBe('7.6.1');
    });
  });

  describe('Non-MVP Roadmap Devices Status ("coming-soon")', () => {
    const roadmapDevices = [
      { id: 'aws-kms', expectedCategory: 'KMS' },
      { id: 'hashicorp-vault', expectedCategory: 'KMS' },
      { id: 'thales-luna-7', expectedCategory: 'HSM_GP' },
      { id: 'marvell-liquid-security', expectedCategory: 'HSM_GP' },
      { id: 'azure-payment-hsm', expectedCategory: 'HSMAAS' }
    ] as const;

    for (const { id, expectedCategory } of roadmapDevices) {
      it(`confirms ${id} is cataloged as 'coming-soon' under ${expectedCategory}`, () => {
        const item = DEVICE_CATALOG.find((d) => d.id === id);
        expect(item).toBeDefined();
        expect(item?.status).toBe('coming-soon');
        expect(item?.category).toBe(expectedCategory);
      });
    }
  });

  describe('Helper Functions (`getAllDevices`, `getSupportedDevices`, `getDeviceSpec`)', () => {
    it('getAllDevices() returns the full catalog array', () => {
      const all = getAllDevices();
      expect(all).toEqual(DEVICE_CATALOG);
      expect(all.length).toBe(DEVICE_CATALOG.length);
    });

    it('getSupportedDevices() returns only devices with status "supported"', () => {
      const supported = getSupportedDevices();
      expect(supported.length).toBeGreaterThanOrEqual(3);

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

      // Ensure no coming-soon devices leak into supported list
      expect(supportedIds).not.toContain('aws-kms');
      expect(supportedIds).not.toContain('hashicorp-vault');
    });

    it('getDeviceSpec(id) returns the complete DeviceSpec for supported devices', () => {
      const atalla = getDeviceSpec('utimaco-atalla-at1000');
      expect(atalla).toBeDefined();
      expect(atalla?.id).toBe('utimaco-atalla-at1000');
      expect(atalla?.status).toBe('supported');

      const thales = getDeviceSpec('thales-payshield-10k');
      expect(thales).toBeDefined();
      expect(thales?.id).toBe('thales-payshield-10k');
      expect(thales?.status).toBe('supported');

      const futurex = getDeviceSpec('futurex-excrypt');
      expect(futurex).toBeDefined();
      expect(futurex?.id).toBe('futurex-excrypt');
      expect(futurex?.status).toBe('supported');
    });

    it('getDeviceSpec(id) returns undefined for coming-soon devices and invalid IDs', () => {
      expect(getDeviceSpec('aws-kms')).toBeUndefined();
      expect(getDeviceSpec('hashicorp-vault')).toBeUndefined();
      expect(getDeviceSpec('non-existent-device')).toBeUndefined();
      expect(getDeviceSpec('')).toBeUndefined();
      expect(getDeviceSpec('   ')).toBeUndefined();
    });
  });
});
