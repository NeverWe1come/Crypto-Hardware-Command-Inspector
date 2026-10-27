/**
 * @packageDocumentation
 * Unit tests for structured protocol framing parser (`structured-protocol.ts`).
 */

import { describe, expect, it } from 'vitest';
import { parseCommand } from '../engine';
import type { DeviceSpec } from '../types';

describe('Structured Framing Engine', () => {
  const mockMultiInterfaceHsm: DeviceSpec = {
    id: 'mock-enterprise-hsm',
    name: 'Mock Enterprise Multi-Interface HSM',
    vendor: 'Antigravity Cryptography',
    category: 'HSM_GP',
    status: 'supported',
    summary: {
      es: 'HSM simulado multi-interfaz para pruebas unitarias.',
      en: 'Mock multi-interface HSM for unit testing.'
    },
    defaultVersion: '1.0',
    defaultInterface: 'pkcs11',
    framing: {
      type: 'structured',
      format: 'callable'
    },
    interfaces: [
      {
        id: 'pkcs11',
        name: { es: 'PKCS#11 C-API', en: 'PKCS#11 C-API' },
        shortLabel: 'PKCS#11',
        kind: 'standard',
        wireFormat: 'callable',
        description: { es: 'Estándar OASIS PKCS#11 v2.40/v3.0', en: 'OASIS PKCS#11 Standard' },
        framing: { type: 'structured', format: 'callable' }
      },
      {
        id: 'kmip-xml',
        name: { es: 'KMIP XML', en: 'KMIP XML' },
        shortLabel: 'KMIP',
        kind: 'standard',
        wireFormat: 'xml',
        description: { es: 'Estándar OASIS KMIP 1.4/2.1 XML', en: 'OASIS KMIP XML Standard' },
        framing: { type: 'structured', format: 'xml' }
      },
      {
        id: 'rest-json',
        name: { es: 'REST API JSON', en: 'REST API JSON' },
        shortLabel: 'REST',
        kind: 'proprietary',
        wireFormat: 'json',
        description: { es: 'API REST JSON propietaria', en: 'Proprietary REST JSON API' },
        framing: { type: 'structured', format: 'json' }
      },
      {
        id: 'cli',
        name: { es: 'Consola CLI', en: 'Appliance CLI' },
        shortLabel: 'CLI',
        kind: 'proprietary',
        wireFormat: 'cli',
        description: { es: 'Línea de comandos de administración', en: 'Appliance administration CLI' },
        framing: { type: 'structured', format: 'cli' }
      }
    ],
    versions: {
      '1.0': {
        version: '1.0',
        label: { es: 'Firmware 1.0', en: 'Firmware 1.0' },
        commands: [
          // PKCS#11 callable
          {
            id: 'p11-encrypt',
            code: 'C_Encrypt',
            interfaceId: 'pkcs11',
            direction: 'request',
            name: { es: 'Cifrar Datos', en: 'Encrypt Data' },
            summary: { es: 'Cifra texto plano con una clave activa', en: 'Encrypts plaintext with active key' },
            description: { es: 'Función C_Encrypt de PKCS#11', en: 'PKCS#11 C_Encrypt function' },
            category: { es: 'Criptografía', en: 'Cryptography' },
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
                description: { es: 'Material sensible a cifrar', en: 'Sensitive plaintext to encrypt' },
                length: { kind: 'variable' },
                encoding: 'ascii',
                required: true,
                sensitive: true
              },
              {
                id: 'ulDataLen',
                name: { es: 'Longitud de Datos', en: 'Data Length' },
                description: { es: 'Longitud en bytes', en: 'Length in bytes' },
                length: { kind: 'variable' },
                encoding: 'ascii',
                required: true
              }
            ]
          },
          // REST JSON
          {
            id: 'rest-transit-encrypt',
            code: 'transit/encrypt',
            interfaceId: 'rest-json',
            direction: 'request',
            name: { es: 'Cifrado Transit REST', en: 'Transit Encrypt REST' },
            summary: { es: 'Cifra un payload codificado en Base64', en: 'Encrypts base64 encoded payload' },
            description: { es: 'Endpoint REST de cifrado', en: 'REST encryption endpoint' },
            category: { es: 'REST API', en: 'REST API' },
            source: 'REST API Reference',
            fields: [
              {
                id: 'plaintext',
                name: { es: 'Texto Plano Base64', en: 'Base64 Plaintext' },
                description: { es: 'Texto plano a cifrar', en: 'Plaintext to encrypt' },
                length: { kind: 'variable' },
                encoding: 'ascii',
                required: true,
                sensitive: true
              },
              {
                id: 'context',
                name: { es: 'Contexto de Derivación', en: 'Derivation Context' },
                description: { es: 'Contexto opcional', en: 'Optional context' },
                length: { kind: 'variable' },
                encoding: 'ascii',
                required: false
              }
            ]
          },
          // KMIP XML
          {
            id: 'kmip-create',
            code: 'Create',
            interfaceId: 'kmip-xml',
            direction: 'request',
            name: { es: 'Crear Objeto KMIP', en: 'KMIP Create Object' },
            summary: { es: 'Genera una clave simétrica o par de claves', en: 'Generates symmetric or key pair' },
            description: { es: 'Operación Create de KMIP', en: 'KMIP Create operation' },
            category: { es: 'KMIP', en: 'KMIP' },
            source: 'OASIS KMIP 1.4 Spec',
            fields: [
              {
                id: 'ObjectType',
                name: { es: 'Tipo de Objeto', en: 'Object Type' },
                description: { es: 'SymmetricKey, PublicKey, etc.', en: 'SymmetricKey, PublicKey, etc.' },
                length: { kind: 'variable' },
                encoding: 'ascii',
                required: true
              },
              {
                id: 'CryptographicAlgorithm',
                name: { es: 'Algoritmo Criptográfico', en: 'Cryptographic Algorithm' },
                description: { es: 'AES, RSA, etc.', en: 'AES, RSA, etc.' },
                length: { kind: 'variable' },
                encoding: 'ascii',
                required: true
              }
            ]
          },
          // CLI
          {
            id: 'cli-hsm-show',
            code: 'hsm show',
            interfaceId: 'cli',
            direction: 'request',
            name: { es: 'Mostrar Estado de HSM', en: 'Show HSM Status' },
            summary: { es: 'Muestra información de estado y hardware', en: 'Shows appliance status and hardware' },
            description: { es: 'Comando CLI de diagnóstico', en: 'Diagnostic CLI command' },
            category: { es: 'Administración', en: 'Administration' },
            source: 'CLI Command Reference',
            fields: []
          }
        ],
        errorCodes: {}
      }
    }
  };

  it('parses PKCS#11 C-API callable invocations and masks sensitive parameters', () => {
    const raw = 'C_Encrypt(0x0001, "TopSecretCardNumber123456", 26);';
    const result = parseCommand(raw, mockMultiInterfaceHsm, { interfaceId: 'pkcs11' });

    expect(result.valid).toBe(true);
    expect(result.commandCode).toBe('C_Encrypt');
    expect(result.matchedCommand?.id).toBe('p11-encrypt');
    expect(result.fields.length).toBe(3);

    // Verify sensitive masking on plaintext parameter
    const plaintextField = result.fields.find((f) => f.id === 'pData');
    expect(plaintextField).toBeDefined();
    expect(plaintextField?.sensitive).toBe(true);
    expect(plaintextField?.maskedValue).toBe('••••••••');
    expect(plaintextField?.rawValue).toBe('"TopSecretCardNumber123456"');
  });

  it('parses REST JSON requests with HTTP method and masks sensitive properties', () => {
    const raw = `POST /v1/transit/encrypt/payment-key HTTP/1.1\nHost: hsm.local\n\n{\n  "plaintext": "VGhpcyBJcyBBIFNlY3JldA==",\n  "context": "ZXhwbG9yZXI="\n}`;
    const result = parseCommand(raw, mockMultiInterfaceHsm, { interfaceId: 'rest-json' });

    expect(result.valid).toBe(true);
    expect(result.commandCode).toBe('transit/encrypt');
    expect(result.matchedCommand?.id).toBe('rest-transit-encrypt');
    expect(result.fields.length).toBe(2);

    const ptField = result.fields.find((f) => f.id === 'plaintext');
    expect(ptField).toBeDefined();
    expect(ptField?.sensitive).toBe(true);
    expect(ptField?.maskedValue).toBe('••••••••');
    expect(ptField?.rawValue).toBe('VGhpcyBJcyBBIFNlY3JldA==');
  });

  it('parses KMIP XML messages and decomposes tags into parsed fields', () => {
    const raw = `<RequestMessage>\n  <BatchItem>\n    <Operation value="Create"/>\n    <ObjectType value="SymmetricKey"/>\n    <CryptographicAlgorithm value="AES"/>\n  </BatchItem>\n</RequestMessage>`;
    const result = parseCommand(raw, mockMultiInterfaceHsm, { interfaceId: 'kmip-xml' });

    expect(result.valid).toBe(true);
    expect(result.commandCode).toBe('Create');
    expect(result.matchedCommand?.id).toBe('kmip-create');
    expect(result.detectedDirection).toBe('request');
    expect(result.fields.length).toBeGreaterThanOrEqual(2);
  });

  it('parses CLI shell commands with prompts and arguments', () => {
    const raw = 'lunash:> hsm show';
    const result = parseCommand(raw, mockMultiInterfaceHsm, { interfaceId: 'cli' });

    expect(result.valid).toBe(true);
    expect(result.commandCode).toBe('hsm show');
    expect(result.matchedCommand?.id).toBe('cli-hsm-show');
  });
});
