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
          pairedCode: 'KRN_STATUS',
          name: { es: 'Consultar Estado del Kernel HSM (Petición)', en: 'Get Kernel Status (Request)' },
          summary: { es: 'Verifica la integridad de memoria, sensores de temperatura y firmware', en: 'Verifies memory integrity, temperature sensors, and firmware health' },
          description: { es: 'Comando de diagnóstico central del kernel del HSM.', en: 'Core kernel diagnostic command for physical status.' },
          category: { es: 'Kernel y Diagnóstico', en: 'Kernel and Diagnostics' },
          source: 'Marvell LiquidSecurity Management Guide Section 2',
          fields: []
        },
        {
          id: 'cvm-krn-status-resp',
          code: 'KRN_STATUS',
          interfaceId: 'liquidsecurity-cli',
          direction: 'response',
          pairedCode: 'KRN_STATUS',
          name: { es: 'Estado del Kernel HSM (Respuesta)', en: 'Kernel Status Output (Response)' },
          summary: { es: 'Respuesta con telemetría física y versión de firmware', en: 'Response with physical telemetry and firmware version' },
          description: { es: 'Devuelve métricas operativas del hardware NitroX.', en: 'Returns operational telemetry of the NitroX hardware.' },
          category: { es: 'Kernel y Diagnóstico', en: 'Kernel and Diagnostics' },
          source: 'Marvell LiquidSecurity Management Guide Section 2',
          fields: [
            {
              id: 'status',
              name: { es: 'Código de Estado', en: 'Status Code' },
              description: { es: 'Código de ejecución del kernel', en: 'Kernel execution code' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'cvm-part-create',
          code: 'PART_CREATE',
          interfaceId: 'liquidsecurity-cli',
          direction: 'request',
          pairedCode: 'PART_CREATE',
          name: { es: 'Crear Partición Virtual (Petición)', en: 'Create Virtual Partition (Request)' },
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
        },
        {
          id: 'cvm-part-create-resp',
          code: 'PART_CREATE',
          interfaceId: 'liquidsecurity-cli',
          direction: 'response',
          pairedCode: 'PART_CREATE',
          name: { es: 'Crear Partición Virtual (Respuesta)', en: 'Create Virtual Partition (Response)' },
          summary: { es: 'Confirmación de partición virtual creada', en: 'Virtual partition allocation confirmation' },
          description: { es: 'Devuelve el estado de aprovisionamiento de la partición.', en: 'Returns virtual partition provisioning status.' },
          category: { es: 'Particionado y Tenants', en: 'Partitioning and Tenants' },
          source: 'Marvell LiquidSecurity Management Guide Section 4',
          fields: [
            {
              id: 'status',
              name: { es: 'Estado', en: 'Status' },
              description: { es: 'Resultado de la creación', en: 'Creation result' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'p11-initialize',
          code: 'C_Initialize',
          interfaceId: 'pkcs11',
          direction: 'request',
          pairedCode: 'C_Initialize',
          name: { es: 'Inicializar Proveedor PKCS#11 (Petición)', en: 'Initialize PKCS#11 Provider (Request)' },
          summary: { es: 'Inicializa la biblioteca criptográfica OASIS PKCS#11', en: 'Initializes the OASIS PKCS#11 cryptographic library' },
          description: { es: 'Prepara el subsistema criptográfico para operar con las particiones virtuales.', en: 'Prepares cryptographic subsystem for partition operations.' },
          category: { es: 'Gestión de Sesión PKCS#11', en: 'PKCS#11 Session Management' },
          source: 'OASIS PKCS#11 v2.40 Section 5.4',
          fields: []
        },
        {
          id: 'p11-initialize-resp',
          code: 'C_Initialize',
          interfaceId: 'pkcs11',
          direction: 'response',
          pairedCode: 'C_Initialize',
          name: { es: 'Inicializar Proveedor PKCS#11 (Respuesta)', en: 'Initialize PKCS#11 Provider (Response)' },
          summary: { es: 'Código de retorno de inicialización CKR_OK', en: 'Return code for initialization CKR_OK' },
          description: { es: 'Retorno de estado de la función C_Initialize.', en: 'Return value of C_Initialize function.' },
          category: { es: 'Gestión de Sesión PKCS#11', en: 'PKCS#11 Session Management' },
          source: 'OASIS PKCS#11 v2.40 Section 5.4',
          fields: [
            {
              id: 'rv',
              name: { es: 'Valor de Retorno', en: 'Return Value' },
              description: { es: 'Código de retorno CKR', en: 'CKR return code' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'p11-generate-key',
          code: 'C_GenerateKey',
          interfaceId: 'pkcs11',
          direction: 'request',
          pairedCode: 'C_GenerateKey',
          name: { es: 'Generar Clave Simétrica (Petición)', en: 'Generate Secret Key (Request)' },
          summary: { es: 'Genera una clave simétrica dentro de la partición del HSM', en: 'Generates a secret key inside the HSM partition' },
          description: { es: 'Crea una clave criptográfica (AES/DES) protegida por hardware.', en: 'Generates hardware-protected cryptographic key (AES/DES).' },
          category: { es: 'Gestión de Claves PKCS#11', en: 'PKCS#11 Key Management' },
          source: 'OASIS PKCS#11 v2.40 Section 5.13',
          fields: [
            {
              id: 'hSession',
              name: { es: 'Manejador de Sesión', en: 'Session Handle' },
              description: { es: 'Identificador de la sesión abierta', en: 'Open session handle' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'mechanism',
              name: { es: 'Mecanismo Criptográfico', en: 'Mechanism' },
              description: { es: 'Algoritmo de generación (e.g. CKM_AES_KEY_GEN)', en: 'Generation algorithm (e.g. CKM_AES_KEY_GEN)' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'p11-generate-key-resp',
          code: 'C_GenerateKey',
          interfaceId: 'pkcs11',
          direction: 'response',
          pairedCode: 'C_GenerateKey',
          name: { es: 'Generar Clave Simétrica (Respuesta)', en: 'Generate Secret Key (Response)' },
          summary: { es: 'Manejador de la clave generada y código CKR_OK', en: 'Handle of generated key and CKR_OK return' },
          description: { es: 'Retorna el identificador de la nueva clave en la partición.', en: 'Returns handle of created key in partition.' },
          category: { es: 'Gestión de Claves PKCS#11', en: 'PKCS#11 Key Management' },
          source: 'OASIS PKCS#11 v2.40 Section 5.13',
          fields: [
            {
              id: 'phKey',
              name: { es: 'Manejador de Clave', en: 'Key Handle' },
              description: { es: 'Identificador de la clave en el HSM', en: 'Key identifier inside HSM' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true,
              sensitive: true
            }
          ]
        },
        {
          id: 'p11-encrypt',
          code: 'C_Encrypt',
          interfaceId: 'pkcs11',
          direction: 'request',
          pairedCode: 'C_Encrypt',
          name: { es: 'Cifrar Datos C_Encrypt (Petición)', en: 'Encrypt Data C_Encrypt (Request)' },
          summary: { es: 'Cifra un bloque de datos usando la clave activa', en: 'Encrypts single-part data with active key' },
          description: { es: 'Operación criptográfica de cifrado dentro del coprocesador NitroX.', en: 'Single-part encryption operation inside NitroX accelerator.' },
          category: { es: 'Criptografía PKCS#11', en: 'PKCS#11 Cryptography' },
          source: 'OASIS PKCS#11 v2.40 Section 5.11',
          fields: [
            {
              id: 'hSession',
              name: { es: 'Manejador de Sesión', en: 'Session Handle' },
              description: { es: 'Identificador de la sesión abierta', en: 'Open session handle' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'pData',
              name: { es: 'Datos en Claro', en: 'Plaintext Data' },
              description: { es: 'Material confidencial a cifrar', en: 'Sensitive data to encrypt' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true,
              sensitive: true
            }
          ]
        },
        {
          id: 'p11-encrypt-resp',
          code: 'C_Encrypt',
          interfaceId: 'pkcs11',
          direction: 'response',
          pairedCode: 'C_Encrypt',
          name: { es: 'Cifrar Datos C_Encrypt (Respuesta)', en: 'Encrypt Data C_Encrypt (Response)' },
          summary: { es: 'Criptograma cifrado resultante', en: 'Resulting encrypted ciphertext' },
          description: { es: 'Devuelve los datos cifrados protegidos por el HSM.', en: 'Returns ciphertext produced by HSM.' },
          category: { es: 'Criptografía PKCS#11', en: 'PKCS#11 Cryptography' },
          source: 'OASIS PKCS#11 v2.40 Section 5.11',
          fields: [
            {
              id: 'pEncryptedData',
              name: { es: 'Criptograma', en: 'Ciphertext' },
              description: { es: 'Datos cifrados', en: 'Encrypted ciphertext data' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true,
              sensitive: true
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
          pairedCode: 'CLUSTER_SYNC',
          name: { es: 'Sincronizar Cluster HSM (Petición)', en: 'Synchronize HSM Cluster (Request)' },
          summary: { es: 'Replicación de particiones y claves entre nodos del cluster', en: 'Partition and key replication across cluster nodes' },
          description: { es: 'Sincroniza el estado de las particiones cifradas en tiempo real.', en: 'Synchronizes encrypted partition states in real time.' },
          category: { es: 'Alta Disponibilidad', en: 'High Availability' },
          source: 'Marvell LiquidSecurity Management Guide Section 8',
          fields: []
        },
        {
          id: 'cvm-cluster-sync-resp',
          code: 'CLUSTER_SYNC',
          interfaceId: 'liquidsecurity-cli',
          direction: 'response',
          pairedCode: 'CLUSTER_SYNC',
          name: { es: 'Sincronizar Cluster HSM (Respuesta)', en: 'Synchronize HSM Cluster (Response)' },
          summary: { es: 'Confirmación de sincronización del cluster', en: 'Cluster sync confirmation' },
          description: { es: 'Devuelve el estado de sincronización entre peers.', en: 'Returns sync status across cluster peers.' },
          category: { es: 'Alta Disponibilidad', en: 'High Availability' },
          source: 'Marvell LiquidSecurity Management Guide Section 8',
          fields: [
            {
              id: 'status',
              name: { es: 'Estado', en: 'Status' },
              description: { es: 'Resultado de la sincronización', en: 'Sync result' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
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
