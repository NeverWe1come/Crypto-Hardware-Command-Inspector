/**
 * @packageDocumentation
 * Specification for Marvell LiquidSecurity HSM (`@chci/device-specs`).
 * Features multi-tenant virtualization, LiquidSecurity CLI management,
 * and OASIS PKCS#11 across firmware 3.4.0 and 2.3.0.
 */

import type { DeviceSpec } from '@chci/parser-core';

export const marvellLiquidSecuritySpec: DeviceSpec = {
  id: 'marvell-liquid-security',
  name: 'Marvell LiquidSecurity HSM',
  vendor: 'Marvell',
  category: 'HSM_GP',
  status: 'supported',
  icon: 'cpu',
  defaultVersion: '3.4.0',
  defaultInterface: 'liquidsecurity-cli',
  exampleCommand: 'KRN_STATUS',
  summary: {
    es: 'HSM de alta densidad para entornos de nube y centros de datos con múltiples particiones virtuales.',
    en: 'High-density cloud and data center Hardware Security Module with multi-tenant virtual partitions.'
  },
  framing: {
    type: 'structured',
    format: 'cli'
  },
  interfaces: [
    {
      id: 'liquidsecurity-cli',
      name: { es: 'Consola LiquidSecurity CLI', en: 'LiquidSecurity Management CLI' },
      shortLabel: 'CVM CLI',
      kind: 'proprietary',
      wireFormat: 'cli',
      description: {
        es: 'Comandos de consola de bajo nivel para administración de particiones y kernel Marvell Cavium.',
        en: 'Low-level shell commands for Marvell Cavium kernel and partition management.'
      },
      framing: { type: 'structured', format: 'cli' },
      exampleCommand: 'KRN_STATUS'
    },
    {
      id: 'pkcs11',
      name: { es: 'Marvell PKCS#11 Provider', en: 'Marvell PKCS#11 Provider' },
      shortLabel: 'PKCS#11',
      kind: 'standard',
      wireFormat: 'callable',
      description: {
        es: 'Implementación OASIS PKCS#11 v2.40 de alto rendimiento para particiones virtuales.',
        en: 'High-performance OASIS PKCS#11 v2.40 implementation for virtual partitions.'
      },
      framing: { type: 'structured', format: 'callable' },
      exampleCommand: 'C_GenerateKey(hSession=0x01, mechanism=CKM_AES_KEY_GEN);'
    }
  ],
  versions: {
    '2.3.0': {
      version: '2.3.0',
      label: { es: 'LiquidSecurity Firmware 2.3.0', en: 'LiquidSecurity Firmware 2.3.0' },
      releaseNotes: {
        es: 'Versión base para tarjetas PCIe NITROX III/V con hasta 32 particiones virtuales aisladas.',
        en: 'Baseline release for NITROX PCIe cards with up to 32 isolated virtual partitions.'
      },
      commands: [
        {
          id: 'cvm-krn-status',
          code: 'KRN_STATUS',
          interfaceId: 'liquidsecurity-cli',
          direction: 'request',
          name: { es: 'Consultar Estado del Kernel HSM', en: 'Get Kernel Status' },
          summary: { es: 'Verifica la integridad de memoria, sensores de temperatura y firmware', en: 'Verifies memory integrity, temperature sensors, and firmware health' },
          description: { es: 'Comando de diagnóstico central del kernel del HSM.', en: 'Core kernel diagnostic command for physical status.' },
          category: { es: 'Kernel y Diagnóstico', en: 'Kernel and Diagnostics' },
          source: 'Marvell LiquidSecurity Management Guide Section 2',
          fields: []
        },
        {
          id: 'cvm-part-create',
          code: 'PART_CREATE',
          interfaceId: 'liquidsecurity-cli',
          direction: 'request',
          name: { es: 'Crear Partición Virtual', en: 'Create Virtual Partition' },
          summary: { es: 'Asigna recursos criptográficos dedicados a un nuevo tenant', en: 'Allocates dedicated cryptographic resources to a new tenant' },
          description: { es: 'Crea una partición aislada con su propia memoria no volátil y cuota de claves.', en: 'Creates an isolated partition with dedicated NVRAM and key quota.' },
          category: { es: 'Particionado y Tenants', en: 'Partitioning and Tenants' },
          source: 'Marvell LiquidSecurity Management Guide Section 4',
          fields: [
            {
              id: 'partition_id',
              name: { es: 'ID de Partición', en: 'Partition ID' },
              description: { es: 'Identificador numérico de 1 a 64', en: 'Numeric identifier 1 to 64' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'key_quota',
              name: { es: 'Cuota de Claves', en: 'Key Quota' },
              description: { es: 'Número máximo de claves almacenables', en: 'Maximum storable keys' },
              length: { kind: 'variable' },
              encoding: 'decimal',
              required: true
            }
          ]
        }
      ],
      errorCodes: {
        '0': {
          code: '0',
          title: { es: 'SUCCESS (Operación Exitosa)', en: 'SUCCESS' },
          description: { es: 'El comando se completó satisfactoriamente.', en: 'Command completed successfully.' }
        },
        '1': {
          code: '1',
          title: { es: 'GENERAL_ERROR', en: 'GENERAL_ERROR' },
          description: { es: 'Error interno en la tarjeta aceleradora o bus PCIe.', en: 'Internal error on PCIe accelerator card.' }
        },
        '5': {
          code: '5',
          title: { es: 'PARTITION_FULL', en: 'PARTITION_FULL' },
          description: { es: 'La cuota de memoria o almacenamiento de claves de la partición se ha agotado.', en: 'Partition key storage quota or NVRAM space exhausted.' }
        }
      }
    },
    '3.4.0': {
      version: '3.4.0',
      extends: '2.3.0',
      label: { es: 'LiquidSecurity Firmware 3.4.0 (Actual)', en: 'LiquidSecurity Firmware 3.4.0 (Current)' },
      releaseNotes: {
        es: 'Soporte para NITROX XL con hasta 128 particiones, sincronización de cluster sin desconexión y curvas post-cuánticas.',
        en: 'Support for NITROX XL with up to 128 partitions, zero-downtime cluster sync, and post-quantum algorithms.'
      },
      commands: [
        {
          id: 'cvm-cluster-sync',
          code: 'CLUSTER_SYNC',
          interfaceId: 'liquidsecurity-cli',
          direction: 'request',
          name: { es: 'Sincronizar Cluster HSM', en: 'Synchronize HSM Cluster' },
          summary: { es: 'Replication de particiones y claves entre nodos del cluster', en: 'Partition and key replication across cluster nodes' },
          description: { es: 'Sincroniza el estado de las particiones cifradas en tiempo real.', en: 'Synchronizes encrypted partition states in real time.' },
          category: { es: 'Alta Disponibilidad', en: 'High Availability' },
          source: 'Marvell LiquidSecurity Management Guide Section 8',
          fields: []
        }
      ],
      errorCodes: {}
    }
  },
  documentationSections: [
    {
      id: 'liquid-overview',
      title: { es: 'Arquitectura Multi-Inquilino Marvell LiquidSecurity', en: 'Marvell LiquidSecurity Multi-Tenant Architecture' },
      category: 'overview',
      markdown: {
        es: `# Marvell LiquidSecurity HSM\n\nLiquidSecurity es una plataforma de hardware criptográfico basada en microchips NITROX de Marvell, diseñada para proveedores de nube pública, telecomunicaciones y centros de datos que requieren miles de particiones virtuales independientes con aislamiento total de memoria y rendimiento superior a 100.000 operaciones RSA por segundo.`,
        en: `# Marvell LiquidSecurity HSM\n\nLiquidSecurity is a hardware cryptographic platform powered by Marvell NITROX processors, architected for cloud service providers and hyperscalers requiring thousands of independent virtual partitions with strict hardware boundary isolation.`
      }
    }
  ]
};
