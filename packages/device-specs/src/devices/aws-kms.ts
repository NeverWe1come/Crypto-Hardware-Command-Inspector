/**
 * @packageDocumentation
 * Specification for AWS Key Management Service (AWS KMS) (`@chci/device-specs`).
 * Features AWS JSON-RPC REST API and AWS KMS CLI across API versions 2014-11-01 and 2012-09-01.
 */

import type { DeviceSpec } from '@chci/parser-core';

export const awsKmsSpec: DeviceSpec = {
  id: 'aws-kms',
  name: 'AWS Key Management Service',
  vendor: 'Amazon Web Services',
  category: 'KMS',
  status: 'coming-soon',
  icon: 'cloud',
  defaultVersion: '2014-11-01',
  defaultInterface: 'aws-json',
  exampleCommand: 'POST / HTTP/1.1\nHost: kms.us-east-1.amazonaws.com\nX-Amz-Target: TrentService.Encrypt\nContent-Type: application/x-amz-json-1.1\n\n{\n  "KeyId": "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012",\n  "Plaintext": "VGhpcyBJcyBBIFRlc3QgU2VjcmV0"\n}',
  summary: {
    es: 'Servicio gestionado de gestión de claves y cifrado de sobres criptográficos en la nube de Amazon Web Services.',
    en: 'Managed key management service and envelope encryption in the Amazon Web Services cloud.'
  },
  framing: {
    type: 'structured',
    format: 'json'
  },
  interfaces: [
    {
      id: 'aws-json',
      name: { es: 'AWS KMS JSON-RPC (API Oficial)', en: 'AWS KMS JSON-RPC (Official API)' },
      shortLabel: 'JSON-RPC',
      kind: 'proprietary',
      wireFormat: 'json',
      description: {
        es: 'Protocolo de bajo nivel HTTP JSON-RPC 1.1 utilizado por los SDKs de AWS (TrentService.*).',
        en: 'Low-level HTTP JSON-RPC 1.1 protocol used by AWS SDKs (TrentService.*).'
      },
      framing: { type: 'structured', format: 'json' },
      exampleCommand: '{\n  "Action": "Encrypt",\n  "KeyId": "alias/my-app-key",\n  "Plaintext": "SGVsbG8gV29ybGQ="\n}'
    },
    {
      id: 'aws-cli',
      name: { es: 'Línea de Comandos AWS CLI', en: 'AWS CLI Console' },
      shortLabel: 'AWS CLI',
      kind: 'proprietary',
      wireFormat: 'cli',
      description: {
        es: 'Comandos oficiales del cliente de consola aws kms.',
        en: 'Official command syntax of the aws kms CLI client.'
      },
      framing: { type: 'structured', format: 'cli' },
      exampleCommand: 'aws kms encrypt --key-id alias/my-key --plaintext "SGVsbG8="'
    }
  ],
  versions: {
    '2012-09-01': {
      version: '2012-09-01',
      label: { es: 'KMS API 2012-09-01', en: 'KMS API 2012-09-01' },
      releaseNotes: {
        es: 'Versión inicial de AWS KMS con claves simétricas maestras administradas (CMK).',
        en: 'Initial release of AWS KMS with symmetric Customer Master Keys (CMKs).'
      },
      commands: [
        {
          id: 'kms-encrypt',
          code: 'Encrypt',
          interfaceId: 'aws-json',
          direction: 'request',
          name: { es: 'Cifrado de Datos (Encrypt)', en: 'Encrypt Data' },
          summary: { es: 'Cifra texto plano de hasta 4 KB bajo una KMS Key', en: 'Encrypts plaintext up to 4 KB under a KMS Key' },
          description: { es: 'Cifra texto plano utilizando HSMs certificados FIPS 140-2/3 en centros de datos de AWS.', en: 'Encrypts plaintext using FIPS 140-2/3 validated HSMs in AWS data centers.' },
          category: { es: 'Criptografía', en: 'Cryptography' },
          source: 'AWS KMS API Reference: Encrypt Action',
          fields: [
            {
              id: 'KeyId',
              name: { es: 'Identificador de Clave (ARN / Alias)', en: 'Key Identifier (ARN / Alias)' },
              description: { es: 'ARN de clave, alias o ID único', en: 'Key ARN, alias, or unique key ID' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'Plaintext',
              name: { es: 'Texto Plano en Base64', en: 'Base64 Plaintext' },
              description: { es: 'Datos confidenciales a cifrar en Base64', en: 'Confidential data to encrypt in base64' },
              length: { kind: 'variable' },
              encoding: 'base64',
              required: true,
              sensitive: true
            },
            {
              id: 'EncryptionContext',
              name: { es: 'Contexto de Cifrado (AAD)', en: 'Encryption Context (AAD)' },
              description: { es: 'Par clave-valor de datos autenticados adicionales', en: 'Key-value pairs of Additional Authenticated Data' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: false
            }
          ]
        },
        {
          id: 'kms-decrypt',
          code: 'Decrypt',
          interfaceId: 'aws-json',
          direction: 'request',
          name: { es: 'Descifrado de Datos (Decrypt)', en: 'Decrypt Data' },
          summary: { es: 'Descifra un criptograma generado previamente por KMS', en: 'Decrypts ciphertext previously encrypted by KMS' },
          description: { es: 'Descifra el blob de criptograma y devuelve el texto plano en Base64.', en: 'Decrypts ciphertext blob and returns base64 plaintext.' },
          category: { es: 'Criptografía', en: 'Cryptography' },
          source: 'AWS KMS API Reference: Decrypt Action',
          fields: [
            {
              id: 'CiphertextBlob',
              name: { es: 'Criptograma en Base64', en: 'Base64 Ciphertext' },
              description: { es: 'Blob de datos cifrados con metadatos de clave', en: 'Encrypted ciphertext blob with embedded key metadata' },
              length: { kind: 'variable' },
              encoding: 'base64',
              required: true
            }
          ]
        },
        {
          id: 'kms-cli-encrypt',
          code: 'aws kms encrypt',
          interfaceId: 'aws-cli',
          direction: 'request',
          name: { es: 'Cifrado por CLI', en: 'CLI Encrypt' },
          summary: { es: 'Comando CLI para cifrar material de datos', en: 'CLI command to encrypt data payload' },
          description: { es: 'Invoca aws kms encrypt en la terminal.', en: 'Invokes aws kms encrypt on shell.' },
          category: { es: 'Comandos CLI', en: 'CLI Commands' },
          source: 'AWS CLI Reference: kms encrypt',
          fields: []
        }
      ],
      errorCodes: {
        'AccessDeniedException': {
          code: 'AccessDeniedException',
          title: { es: 'Acceso Denegado por IAM o Key Policy', en: 'Access Denied by IAM or Key Policy' },
          description: { es: 'El principal que realiza la llamada no tiene permisos kms:Encrypt en la política de clave.', en: 'Calling principal lacks kms:Encrypt permissions in key policy.' }
        },
        'InvalidCiphertextException': {
          code: 'InvalidCiphertextException',
          title: { es: 'Criptograma Corrupto o Inválido', en: 'Invalid Ciphertext Blob' },
          description: { es: 'El blob de datos cifrados no coincide con el algoritmo o ha sido alterado.', en: 'Ciphertext blob does not match key algorithm or has been tampered with.' }
        },
        'NotFoundException': {
          code: 'NotFoundException',
          title: { es: 'Clave KMS No Encontrada', en: 'KMS Key Not Found' },
          description: { es: 'El ARN o Alias especificado no existe en la región de AWS.', en: 'Target Key ARN or Alias does not exist in target AWS region.' }
        }
      }
    },
    '2014-11-01': {
      version: '2014-11-01',
      extends: '2012-09-01',
      label: { es: 'KMS API 2014-11-01 (Actual)', en: 'KMS API 2014-11-01 (Current)' },
      releaseNotes: {
        es: 'Soporte para claves asimétricas RSA/ECC, claves multirregión y almacenamiento en almacenes de claves personalizados (Custom Key Stores en CloudHSM).',
        en: 'Support for asymmetric RSA/ECC keys, multi-region keys, and CloudHSM custom key stores.'
      },
      commands: [
        {
          id: 'kms-gen-datakey',
          code: 'GenerateDataKey',
          interfaceId: 'aws-json',
          direction: 'request',
          name: { es: 'Generar Clave de Datos (Envelope Encryption)', en: 'Generate Data Key' },
          summary: { es: 'Genera una clave simétrica única en claro y cifrada para Envelope Encryption', en: 'Generates unique symmetric key in clear and encrypted form' },
          description: { es: 'Produce una clave de datos para cifrar volúmenes grandes localmente en el cliente.', en: 'Produces a data key to encrypt large datasets client-side.' },
          category: { es: 'Criptografía', en: 'Cryptography' },
          source: 'AWS KMS API Reference: GenerateDataKey',
          fields: [
            {
              id: 'KeyId',
              name: { es: 'Clave Maestra KMS', en: 'KMS Master Key' },
              description: { es: 'Clave KMS para cifrar la clave de datos', en: 'KMS Key to encrypt data key' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'KeySpec',
              name: { es: 'Especificación de Clave', en: 'Key Specification' },
              description: { es: 'AES_256 o AES_128', en: 'AES_256 or AES_128' },
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
      id: 'kms-overview',
      title: { es: 'Arquitectura de AWS KMS y Envelope Encryption', en: 'AWS KMS Architecture and Envelope Encryption' },
      category: 'overview',
      markdown: {
        es: `# AWS Key Management Service (AWS KMS)\n\nAWS KMS es un servicio de gestión de claves criptográficas respaldado por módulos de seguridad hardware (HSM) dedicados de AWS certificados bajo FIPS 140-2 / FIPS 140-3 Nivel 3.\n\n### Envelope Encryption\nDebido a que KMS impone un límite de 4 KB por comando \`Encrypt\`, las cargas de trabajo grandes utilizan el patrón **Envelope Encryption**:\n1. Se llama a \`GenerateDataKey\` para obtener una clave simétrica AES de 256 bits.\n2. El cliente cifra los datos masivos con la clave en claro.\n3. Se destruye la clave en claro de la memoria y se almacena la copia cifrada (\`CiphertextBlob\`) junto a los datos.`,
        en: `# AWS Key Management Service (AWS KMS)\n\nAWS KMS is a cryptographic key management service backed by dedicated FIPS 140-2/3 Level 3 Hardware Security Modules.\n\n### Envelope Encryption\nBecause direct \`Encrypt\` calls are capped at 4 KB, large workloads employ **Envelope Encryption**:\n1. Call \`GenerateDataKey\` to obtain an AES-256 data key.\n2. Encrypt large datasets locally with cleartext key.\n3. Zeroize cleartext key in memory and persist encrypted blob alongside ciphertext.`
      }
    }
  ]
};
