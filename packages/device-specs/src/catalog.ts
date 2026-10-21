/**
 * @packageDocumentation
 * Cryptographic device catalog listing MVP supported hardware and coming-soon roadmap systems.
 */

import type { DeviceCatalogEntry } from './types';
import { atallaAt1000Spec } from './devices/utimaco-atalla-at1000';
import { thalesPayshield10kSpec } from './devices/thales-payshield-10k';
import { futurexExcryptSpec } from './devices/futurex-excrypt';

/**
 * Global catalog of cryptographic hardware modules, payment HSMs, general-purpose HSMs,
 * cloud HSMs as a service, and Key Management Systems (KMS).
 */
export const DEVICE_CATALOG: readonly DeviceCatalogEntry[] = [
  // 1. Supported MVP Devices (HSM_FINANCIAL)
  atallaAt1000Spec,
  thalesPayshield10kSpec,
  futurexExcryptSpec,

  // 2. Roadmap Devices (KMS)
  {
    id: 'aws-kms',
    name: 'AWS Key Management Service',
    vendor: 'Amazon Web Services',
    category: 'KMS',
    status: 'coming-soon',
    exampleCommand: 'kms:Encrypt',
    summary: {
      es: 'Servicio gestionado de gestión de claves y cifrado de sobres criptográficos en la nube de Amazon Web Services.',
      en: 'Managed key management service and envelope encryption in the Amazon Web Services cloud.'
    }
  },
  {
    id: 'hashicorp-vault',
    name: 'HashiCorp Vault Transit Engine',
    vendor: 'HashiCorp',
    category: 'KMS',
    status: 'coming-soon',
    exampleCommand: 'transit/encrypt',
    summary: {
      es: 'Motor de cifrado como servicio (Transit Secrets Engine) para gestión de claves, firma y hashing.',
      en: 'Encryption-as-a-service Transit Secrets Engine for key management, digital signatures, and hashing.'
    }
  },

  // 3. Roadmap Devices (HSM_GP - General Purpose)
  {
    id: 'thales-luna-7',
    name: 'Thales Luna PCIe / Network HSM 7',
    vendor: 'Thales',
    category: 'HSM_GP',
    status: 'coming-soon',
    exampleCommand: 'C_Initialize()',
    summary: {
      es: 'Módulo de seguridad de hardware de propósito general con soporte para API PKCS#11, Microsoft CAPI/CNG y JCE.',
      en: 'General-purpose Hardware Security Module supporting PKCS#11, Microsoft CAPI/CNG, and JCE interfaces.'
    }
  },
  {
    id: 'marvell-liquid-security',
    name: 'Marvell LiquidSecurity HSM',
    vendor: 'Marvell',
    category: 'HSM_GP',
    status: 'coming-soon',
    exampleCommand: 'KRN_STATUS',
    summary: {
      es: 'HSM de alta densidad para entornos de nube y centros de datos con múltiples particiones virtuales.',
      en: 'High-density cloud and data center Hardware Security Module with multi-tenant virtual partitions.'
    }
  },

  // 4. Roadmap Devices (HSMAAS - Cloud Payment HSM as a Service)
  {
    id: 'azure-payment-hsm',
    name: 'Azure Dedicated Payment HSM',
    vendor: 'Microsoft Azure',
    category: 'HSMAAS',
    status: 'coming-soon',
    exampleCommand: 'NC',
    summary: {
      es: 'Servicio de HSM de pagos dedicado en la nube de Azure basado en infraestructura física Thales payShield 10K.',
      en: 'Dedicated cloud payment HSM service in Microsoft Azure backed by Thales payShield 10K hardware.'
    }
  }
];
