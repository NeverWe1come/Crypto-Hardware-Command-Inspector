/**
 * @packageDocumentation
 * Specification for HashiCorp Vault Transit & KMIP Secrets Engine (`@chci/device-specs`).
 * Features REST API (JSON), Vault CLI, and KMIP across Vault 1.18 and 1.16.
 */

import type { DeviceSpec } from '@chci/parser-core';

export const hashicorpVaultSpec: DeviceSpec = {
  id: 'hashicorp-vault',
  name: 'HashiCorp Vault Transit Engine',
  vendor: 'HashiCorp',
  category: 'KMS',
  status: 'supported',
  icon: 'shield',
  defaultVersion: '1.18',
  defaultInterface: 'vault-rest',
  exampleCommand: 'POST /v1/transit/encrypt/app-key HTTP/1.1\nHost: vault.local:8200\nX-Vault-Token: s.sampletoken123456\nContent-Type: application/json\n\n{\n  "plaintext": "VGhpcyBJcyBBIFRlc3QgU2VjcmV0"\n}',
  summary: {
    es: 'Motor de cifrado como servicio (Transit Secrets Engine) para gestión de claves, firma y hashing.',
    en: 'Encryption-as-a-service Transit Secrets Engine for key management, digital signatures, and hashing.'
  },
  framing: {
    type: 'structured',
    format: 'json'
  },
  interfaces: [
    {
      id: 'vault-rest',
      name: { es: 'Vault REST API (JSON)', en: 'Vault REST API (JSON)' },
      shortLabel: 'REST',
      kind: 'proprietary',
      wireFormat: 'json',
      description: {
        es: 'API HTTP REST oficial para el motor de cifrado transit (/v1/transit/*).',
        en: 'Official HTTP REST API for transit secrets engine (/v1/transit/*).'
      },
      framing: { type: 'structured', format: 'json' },
      exampleCommand: 'POST /v1/transit/encrypt/payment-key\n\n{\n  "plaintext": "VGhpcyBJcyBGYWtlUGF5bG9hZA=="\n}'
    },
    {
      id: 'vault-cli',
      name: { es: 'Consola Vault CLI', en: 'Vault CLI Console' },
      shortLabel: 'CLI',
      kind: 'proprietary',
      wireFormat: 'cli',
      description: {
        es: 'Comandos de línea de comandos del cliente oficial de Vault.',
        en: 'Official Vault CLI client commands.'
      },
      framing: { type: 'structured', format: 'cli' },
      exampleCommand: 'vault write transit/encrypt/my-key plaintext="SGVsbG8="'
    },
    {
      id: 'kmip-xml',
      name: { es: 'KMIP Enterprise Engine', en: 'KMIP Enterprise Engine' },
      shortLabel: 'KMIP',
      kind: 'standard',
      wireFormat: 'xml',
      description: {
        es: 'Motor de secretos KMIP estándar para Vault Enterprise.',
        en: 'Standard KMIP secrets engine for Vault Enterprise.'
      },
      framing: { type: 'structured', format: 'xml' },
      exampleCommand: '<RequestMessage><BatchItem><Operation value="Create"/></BatchItem></RequestMessage>'
    }
  ],
  versions: {
    '1.16': {
      version: '1.16',
      label: { es: 'Vault 1.16 LTS', en: 'Vault 1.16 LTS' },
      releaseNotes: {
        es: 'Soporte completo para transit keys AES-GCM, convergent encryption y firma Ed25519.',
        en: 'Full support for AES-GCM transit keys, convergent encryption, and Ed25519 signing.'
      },
      commands: [
        {
          id: 'vault-transit-encrypt',
          code: 'transit/encrypt',
          interfaceId: 'vault-rest',
          direction: 'request',
          name: { es: 'Cifrado Transit (Encrypt)', en: 'Transit Encrypt' },
          summary: { es: 'Cifra datos en Base64 utilizando una clave gestionada en Vault', en: 'Encrypts base64 data using a Vault-managed key' },
          description: { es: 'Cifra texto plano y devuelve un criptograma con prefijo vault:v1:...', en: 'Encrypts plaintext and returns ciphertext with vault:v1:... prefix.' },
          category: { es: 'Operaciones Transit', en: 'Transit Operations' },
          source: 'Vault Transit Secrets Engine HTTP API',
          fields: [
            {
              id: 'plaintext',
              name: { es: 'Texto Plano en Base64', en: 'Base64 Plaintext' },
              description: { es: 'Payload en Base64 que será cifrado', en: 'Base64 payload to be encrypted' },
              length: { kind: 'variable' },
              encoding: 'base64',
              required: true,
              sensitive: true
            },
            {
              id: 'context',
              name: { es: 'Contexto de Derivación', en: 'Derivation Context' },
              description: { es: 'Contexto requerido si convergent_encryption o derived están activos', en: 'Context required if convergent encryption is active' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: false
            }
          ]
        },
        {
          id: 'vault-transit-decrypt',
          code: 'transit/decrypt',
          interfaceId: 'vault-rest',
          direction: 'request',
          name: { es: 'Descifrado Transit (Decrypt)', en: 'Transit Decrypt' },
          summary: { es: 'Descifra criptograma con formato vault:vX:...', en: 'Decrypts ciphertext formatted as vault:vX:...' },
          description: { es: 'Descifra el criptograma y retorna el texto plano en Base64.', en: 'Decrypts ciphertext and returns base64 plaintext.' },
          category: { es: 'Operaciones Transit', en: 'Transit Operations' },
          source: 'Vault Transit Secrets Engine HTTP API',
          fields: [
            {
              id: 'ciphertext',
              name: { es: 'Criptograma de Vault', en: 'Vault Ciphertext' },
              description: { es: 'Cadena con formato vault:v1:base64...', en: 'Formatted string vault:v1:base64...' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'vault-cli-write-encrypt',
          code: 'vault write transit/encrypt',
          interfaceId: 'vault-cli',
          direction: 'request',
          name: { es: 'Cifrado mediante CLI', en: 'CLI Encrypt' },
          summary: { es: 'Ejecuta cifrado de transit en terminal', en: 'Runs transit encrypt on terminal' },
          description: { es: 'Sintaxis de consola vault write.', en: 'Vault write console syntax.' },
          category: { es: 'Comandos CLI', en: 'CLI Commands' },
          source: 'Vault CLI documentation',
          fields: []
        }
      ],
      errorCodes: {
        '400': {
          code: '400',
          title: { es: 'Bad Request (Parámetros Inválidos)', en: 'Bad Request' },
          description: { es: 'El payload JSON está malformado o el texto plano no es Base64 válido.', en: 'Malformed JSON payload or invalid base64 encoding.' }
        },
        '403': {
          code: '403',
          title: { es: 'Permission Denied (Acceso Denegado)', en: 'Permission Denied' },
          description: { es: 'El token de Vault no tiene capacidad update en transit/encrypt/{key}.', en: 'Vault token lacks update capability on path.' }
        },
        '404': {
          code: '404',
          title: { es: 'Key Not Found (Clave No Existe)', en: 'Key Not Found' },
          description: { es: 'El nombre de clave especificado en la ruta no existe en el motor transit.', en: 'Key name specified in URL path does not exist.' }
        }
      }
    },
    '1.18': {
      version: '1.18',
      extends: '1.16',
      label: { es: 'Vault 1.18 (Actual)', en: 'Vault 1.18 (Current)' },
      releaseNotes: {
        es: 'Soporte para rotación automática de claves basada en tiempo y respaldo cifrado directo.',
        en: 'Support for scheduled automatic key rotation and direct encrypted backup.'
      },
      commands: [
        {
          id: 'vault-transit-rotate',
          code: 'transit/keys/rotate',
          interfaceId: 'vault-rest',
          direction: 'request',
          name: { es: 'Rotar Clave de Cifrado', en: 'Rotate Transit Key' },
          summary: { es: 'Genera una nueva versión de clave en el anillo de claves (Keyring)', en: 'Generates new key version in the keyring' },
          description: { es: 'Incrementa la versión activa (ej. de v1 a v2) sin invalidar descifrado previo.', en: 'Increments active key version without breaking prior decryption.' },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          source: 'Vault Transit Secrets Engine HTTP API',
          fields: []
        }
      ],
      errorCodes: {}
    }
  },
  documentationSections: [
    {
      id: 'vault-transit-overview',
      title: { es: 'Arquitectura del Motor Transit de Vault', en: 'Vault Transit Secrets Engine Architecture' },
      category: 'overview',
      markdown: {
        es: `# Motor de Secretos Transit de HashiCorp Vault\n\nEl motor de secretos Transit maneja funciones criptográficas como servicio (Cryptography-as-a-Service). Vault genera y almacena las claves en su almacenamiento sellado (o HSM respaldante) y nunca expone el material de clave en claro al cliente.\n\n### Características Principales\n- **Keyring Versioning:** Múltiples versiones de clave (\`vault:v1:\`, \`vault:v2:\`) bajo un mismo nombre de clave.\n- **Convergent Encryption:** Mismo texto plano produce mismo criptograma cuando se proporciona el mismo contexto.\n- **Key Rewrapping:** Permite actualizar criptogramas antiguos a la versión de clave más moderna sin descifrar el contenido hacia la aplicación cliente.`,
        en: `# HashiCorp Vault Transit Secrets Engine\n\nThe Transit secrets engine handles cryptographic functions as a service (Cryptography-as-a-Service). Vault manages the key material in its encrypted barrier and never discloses raw keys.\n\n### Key Features\n- **Keyring Versioning:** Multiple key versions (\`vault:v1:\`, \`vault:v2:\`) maintained concurrently.\n- **Convergent Encryption:** Identical plaintexts produce identical ciphertexts using a unique context.\n- **Key Rewrapping:** Transparently re-encrypts older ciphertexts under current key versions.`
      }
    }
  ]
};
