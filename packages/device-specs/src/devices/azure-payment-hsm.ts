/**
 * @packageDocumentation
 * Specification for Azure Dedicated Payment & Managed HSM (`@chci/device-specs`).
 * Features Thales payShield 10K host commands over Azure VNet (FastPath)
 * and Azure Key Vault Managed HSM REST JSON API across 2024-02-01 and 2021-11-30.
 */

import type { DeviceSpec } from '@chci/parser-core';

export const azurePaymentHsmSpec: DeviceSpec = {
  id: 'azure-payment-hsm',
  name: 'Azure Dedicated Payment HSM',
  vendor: 'Microsoft Azure',
  category: 'HSMAAS',
  status: 'supported',
  icon: 'cloud',
  defaultVersion: '2024-02-01',
  defaultInterface: 'payshield-host',
  exampleCommand: '0000NC',
  summary: {
    es: 'Servicio de HSM de pagos dedicado en la nube de Azure basado en infraestructura física Thales payShield 10K.',
    en: 'Dedicated cloud payment HSM service in Microsoft Azure backed by Thales payShield 10K hardware.'
  },
  framing: {
    type: 'header-positional',
    defaultHeaderLength: 4,
    commandCodeLength: 2,
    responseErrorCodeLength: 2,
    successErrorCode: '00'
  },
  interfaces: [
    {
      id: 'payshield-host',
      name: { es: 'payShield 10K Host (VNet Dedicada)', en: 'payShield 10K Host (Dedicated VNet)' },
      shortLabel: 'Host VNet',
      kind: 'proprietary',
      wireFormat: 'ascii-frame',
      description: {
        es: 'Comandos nativos payShield 10K transmitidos directamente por TCP/IP sobre interfaz de red virtual (FastPath VNet).',
        en: 'Native payShield 10K commands transmitted directly over TCP/IP FastPath VNet.'
      },
      framing: {
        type: 'header-positional',
        defaultHeaderLength: 4,
        commandCodeLength: 2,
        responseErrorCodeLength: 2,
        successErrorCode: '00'
      },
      exampleCommand: '0000NC'
    },
    {
      id: 'azure-rest',
      name: { es: 'Azure Managed HSM REST API (JSON)', en: 'Azure Managed HSM REST API (JSON)' },
      shortLabel: 'Azure REST',
      kind: 'proprietary',
      wireFormat: 'json',
      description: {
        es: 'API REST JSON para aprovisionamiento de recursos y operaciones en Azure Key Vault Managed HSM.',
        en: 'Official JSON REST API for resource provisioning and Azure Managed HSM key operations.'
      },
      framing: { type: 'structured', format: 'json' },
      exampleCommand: 'POST /keys/payment-kek/create?api-version=7.4 HTTP/1.1\nHost: myhsm.managedhsm.azure.net\nContent-Type: application/json\n\n{\n  "kty": "RSA-HSM",\n  "key_size": 3072\n}'
    }
  ],
  versions: {
    '2021-11-30': {
      version: '2021-11-30',
      label: { es: 'Azure Payment HSM v1.0', en: 'Azure Payment HSM v1.0' },
      releaseNotes: {
        es: 'Lanzamiento inicial de Azure Dedicated HSM para pagos con firmware payShield base.',
        en: 'Initial release of Azure Dedicated Payment HSM backed by payShield firmware.'
      },
      commands: [
        {
          id: 'az-ps-nc-echo',
          code: 'NC',
          interfaceId: 'payshield-host',
          direction: 'request',
          pairedCode: 'ND',
          name: { es: 'Comprobación de Diagnóstico (Diagnostics)', en: 'Diagnostics Check' },
          summary: { es: 'Verifica la conectividad TCP/IP con el HSM payShield en la VNet de Azure', en: 'Verifies TCP/IP connectivity to payShield HSM in Azure VNet' },
          description: { es: 'Petición de diagnóstico de host que devuelve información de firmware y estado de LMK.', en: 'Host diagnostic request returning firmware details and LMK state.' },
          category: { es: 'Diagnóstico', en: 'Diagnostics' },
          source: 'Microsoft Azure Dedicated HSM Integration Guide',
          fields: []
        },
        {
          id: 'az-ps-a0-genkey',
          code: 'A0',
          interfaceId: 'payshield-host',
          direction: 'request',
          pairedCode: 'A1',
          name: { es: 'Generar Clave de Pago (Generate Key)', en: 'Generate Key' },
          summary: { es: 'Genera una clave DES/TDES/AES bajo el LMK del HSM de Azure', en: 'Generates DES/TDES/AES key under Azure HSM LMK' },
          description: { es: 'Genera una clave cifrada bajo LMK y opcionalmente bajo ZMK.', en: 'Generates key encrypted under LMK and optional ZMK.' },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          source: 'Microsoft Azure Dedicated HSM Integration Guide',
          fields: [
            {
              id: 'mode',
              name: { es: 'Modo de Generación', en: 'Generation Mode' },
              description: { es: '0 (Generar clave)', en: '0 (Generate key)' },
              length: { kind: 'fixed', length: 1 },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'key_type',
              name: { es: 'Tipo de Clave', en: 'Key Type' },
              description: { es: '001 (ZPK), 002 (ZMK), 003 (TMK)', en: '001 (ZPK), 002 (ZMK), 003 (TMK)' },
              length: { kind: 'fixed', length: 3 },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'key_scheme',
              name: { es: 'Esquema de Clave', en: 'Key Scheme' },
              description: { es: 'U (Doble longitud), T (Triple longitud), S (Key Block)', en: 'U (Double), T (Triple), S (Key Block)' },
              length: { kind: 'fixed', length: 1 },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'az-rest-create-key',
          code: 'createKey',
          interfaceId: 'azure-rest',
          direction: 'request',
          name: { es: 'Crear Clave en Managed HSM REST', en: 'Create Key in Managed HSM REST' },
          summary: { es: 'Crea una clave respaldada por hardware mediante REST', en: 'Creates hardware-backed key via REST API' },
          description: { es: 'Endpoint REST de Azure Key Vault Managed HSM.', en: 'Azure Key Vault Managed HSM REST endpoint.' },
          category: { es: 'Operaciones REST', en: 'REST Operations' },
          source: 'Azure Key Vault Managed HSM REST Reference',
          fields: []
        }
      ],
      errorCodes: {
        '00': {
          code: '00',
          title: { es: 'Éxito (No Error)', en: 'Success (No Error)' },
          description: { es: 'La operación se ejecutó correctamente en el HSM de Azure.', en: 'Operation completed successfully on Azure HSM.' }
        },
        '01': {
          code: '01',
          title: { es: 'Fallo de Verificación o Paridad', en: 'Verification Failure' },
          description: { es: 'La comprobación de paridad de clave o autenticación falló.', en: 'Key parity check or authentication failed.' }
        },
        '10': {
          code: '10',
          title: { es: 'Datos de Entrada No Válidos', en: 'Source Data Invalid' },
          description: { es: 'El formato de comando o los campos suministrados no son válidos.', en: 'Command format or supplied fields are invalid.' }
        }
      }
    },
    '2024-02-01': {
      version: '2024-02-01',
      extends: '2021-11-30',
      label: { es: 'Azure Payment HSM v2.0 (Actual)', en: 'Azure Payment HSM v2.0 (Current)' },
      releaseNotes: {
        es: 'Soporte ampliado para payShield 10K con firmware v2.3, FastPath ExpressRoute y monitoreo Azure Monitor.',
        en: 'Expanded support for payShield 10K firmware v2.3, FastPath ExpressRoute, and Azure Monitor metrics.'
      },
      commands: [],
      errorCodes: {}
    }
  },
  documentationSections: [
    {
      id: 'azure-hsm-overview',
      title: { es: 'Arquitectura de Azure Dedicated Payment HSM', en: 'Azure Dedicated Payment HSM Architecture' },
      category: 'overview',
      markdown: {
        es: `# Azure Dedicated Payment HSM\n\nAzure Dedicated Payment HSM es un servicio bare-metal de infraestructura como servicio que proporciona módulos de seguridad hardware Thales payShield 10K dedicados físicamente para cada cliente en centros de datos de Microsoft Azure.\n\n### Conectividad y Red\n- **FastPath VNet Peering:** Los HSMs se conectan directamente a la red virtual del cliente con latencias inferiores a 2 milisegundos.\n- **Aislamiento Total:** Microsoft no tiene acceso a las claves ni a la administración del dispositivo; el cliente tiene control exclusivo mediante consolas locales o terminales remotas.`,
        en: `# Azure Dedicated Payment HSM\n\nAzure Dedicated Payment HSM is a bare-metal IaaS offering providing physically dedicated Thales payShield 10K HSM appliances for each customer within Microsoft Azure regions.\n\n### Networking and Latency\n- **FastPath VNet Peering:** HSMs connect directly into customer private VNets achieving sub-2ms network latencies.\n- **Single Tenant Isolation:** Zero Microsoft access to customer keys or appliance management.`
      }
    }
  ]
};
