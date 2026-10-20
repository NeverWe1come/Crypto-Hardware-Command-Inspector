/**
 * @packageDocumentation
 * Declarative hardware cryptographic command specifications (`@chci/device-specs`).
 */

import type { DeviceSpec } from '@chci/parser-core';
import type { DeviceCatalogEntry, DeviceCatalogItem } from './types';
import { DEVICE_CATALOG } from './catalog';

/**
 * Current release version of `@chci/device-specs`.
 */
export const DEVICE_SPECS_VERSION = '0.1.0';

export * from './types';
export { DEVICE_CATALOG } from './catalog';
export { atallaAt1000Spec } from './devices/utimaco-atalla-at1000';
export { thalesPayshield10kSpec } from './devices/thales-payshield-10k';
export { futurexExcryptSpec } from './devices/futurex-excrypt';

/**
 * Type guard verifying if a catalog entry is a fully modeled `DeviceSpec`.
 *
 * @param entry - Catalog entry or item to inspect.
 * @returns True if entry has status 'supported' with versions and framing schemas.
 */
export function isDeviceSpec(entry: DeviceCatalogEntry): entry is DeviceSpec {
  return entry.status === 'supported' && 'versions' in entry && 'framing' in entry;
}

/**
 * Returns all devices present in the catalog across all categories and statuses.
 *
 * @returns Readonly array of all catalog entries including supported and coming-soon devices.
 */
export function getAllDevices(): readonly DeviceCatalogItem[] {
  return DEVICE_CATALOG;
}

/**
 * Returns only devices with full specification modeling (`status: 'supported'`).
 *
 * @returns Readonly array of fully parsed DeviceSpec objects.
 */
export function getSupportedDevices(): readonly DeviceSpec[] {
  return DEVICE_CATALOG.filter(isDeviceSpec);
}

/**
 * Retrieves the full specification of a supported cryptographic device by identifier.
 *
 * @param id - Device unique identifier (e.g. `'utimaco-atalla-at1000'`).
 * @returns Fully modeled `DeviceSpec` if supported, or `undefined`.
 */
export function getDeviceSpec(id: string): DeviceSpec | undefined {
  if (!id || typeof id !== 'string' || !id.trim()) {
    return undefined;
  }
  const match = DEVICE_CATALOG.find((d) => d.id === id.trim());
  if (!match || !isDeviceSpec(match)) {
    return undefined;
  }
  return match;
}
