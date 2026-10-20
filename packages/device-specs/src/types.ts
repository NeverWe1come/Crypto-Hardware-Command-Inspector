/**
 * @packageDocumentation
 * Catalog and device specification type contracts for `@chci/device-specs`.
 */

import type {
  CatalogStatus,
  DeviceCategory,
  DeviceSpec,
  LocalizedString
} from '@chci/parser-core';

/**
 * Lightweight representation of a cryptographic hardware device or KMS
 * in the application sidebar catalog.
 */
export interface DeviceCatalogItem {
  readonly id: string;
  readonly name: string;
  readonly vendor: string;
  readonly category: DeviceCategory;
  readonly status: CatalogStatus;
  readonly icon?: string;
  readonly summary: LocalizedString;
  readonly defaultVersion?: string;
}

/**
 * Catalog entry for non-MVP or roadmap devices not yet fully modeled.
 */
export interface ComingSoonDevice extends DeviceCatalogItem {
  readonly status: 'coming-soon';
}

/**
 * Union type for any catalog entry (supported full spec or coming-soon entry).
 */
export type DeviceCatalogEntry = DeviceSpec | ComingSoonDevice;
