/**
 * @packageDocumentation
 * Specification for IBM 4769 / 4767 PCIe Cryptographic Coprocessor (`@chci/device-specs`).
 * Features IBM Common Cryptographic Architecture (CCA) callable service verbs (CSNB* / CSND*)
 * and IBM Enterprise PKCS#11 (EP11) across CCA Release 8.1 and 7.5.
 */

import type { DeviceSpec } from '@chci/parser-core';

export const ibmCca4769Spec: DeviceSpec = {
  id: 'ibm-cca-4769',
  name: 'IBM 4769 / 4767 PCIe Cryptographic Coprocessor',
  vendor: 'IBM',
  category: 'HSM_FINANCIAL',
  status: 'coming-soon',
  icon: 'cpu',
  defaultVersion: '8.1',
  defaultInterface: 'cca-verb',
  exampleCommand: 'CSNBENC(return_code, reason_code, 0, "", "KEY_TOKEN_AES", 16, "SecretData123456", "INIT_VECTOR_HEX", 2, "INITIAL,CBC", " ", "CHAIN_VECTOR", "CIPHERTEXT_OUT");',
  summary: {
    es: 'Coprocesador criptográfico seguro de alta seguridad para servidores IBM Z y Linux con arquitectura CCA y EP11.',
    en: 'Ultra-secure PCIe cryptographic coprocessor for IBM Z mainframes and Linux servers supporting CCA and EP11.'
  },
  framing: {
    type: 'structured',
    format: 'callable'
  },
  interfaces: [
    {
      id: 'cca-verb',
      name: { es: 'Verbos CCA (Propietario IBM)', en: 'CCA Verbs (IBM Proprietary)' },
      shortLabel: 'CCA',
      kind: 'proprietary',
      wireFormat: 'callable',
      description: {
        es: 'Verbos de servicios invocables (Callable Services) de la arquitectura IBM CCA para pagos, PIN y cifrado.',
        en: 'IBM Common Cryptographic Architecture (CCA) callable service verb invocations for payments and keys.'
      },
      framing: { type: 'structured', format: 'callable' },
      exampleCommand: 'CSNBENC(return_code, reason_code, 0, "", "KEY_TOKEN", 16, "ClearDataBlock12", "INITIAL_VEC_8B", 1, "ONLY", " ", "CHAIN_VEC", "OUTPUT_CIPHER");'
    },
    {
      id: 'ep11',
      name: { es: 'Enterprise PKCS#11 (EP11)', en: 'Enterprise PKCS#11 (EP11)' },
      shortLabel: 'EP11',
      kind: 'standard',
      wireFormat: 'callable',
      description: {
        es: 'Modo Enterprise PKCS#11 para computación segura en la nube con soporte de claves seguras (Secure Keys).',
        en: 'IBM Enterprise PKCS#11 mode for secure cloud computing with hardware-bound secure key tokens.'
      },
      framing: { type: 'structured', format: 'callable' },
      exampleCommand: 'm_Encrypt(hSession=0x01, pData="TopSecretTransaction", ulDataLen=20);'
    }
  ],
  versions: {
    '7.5': {
      version: '7.5',
      label: { es: 'CCA Release 7.5', en: 'CCA Release 7.5' },
      releaseNotes: {
        es: 'Soporte completo para coprocesadores IBM 4767 / 4765 con algoritmos Triple-DES, AES-256 y PIN bloques ISO formatos 0, 1, 2, 3.',
        en: 'Comprehensive support for IBM 4767 coprocessor with Triple-DES, AES-256, and ISO PIN block formats 0, 1, 2, 3.'
      },
      commands: [
        {
          id: 'ibm-csnbenc',
          code: 'CSNBENC',
          interfaceId: 'cca-verb',
          direction: 'request',
          name: { es: 'Cifrado Simétrico (Encipher)', en: 'Symmetric Encipher' },
          summary: { es: 'Cifra datos en modo CBC utilizando clave DES o AES', en: 'Enciphers data in CBC mode using DES or AES key' },
          description: { es: 'Invocación del verbo CCA CSNBENC para cifrado simétrico mediante tokens de clave interna.', en: 'IBM CCA CSNBENC callable service for symmetric encryption with internal key tokens.' },
          category: { es: 'Servicios de Cifrado', en: 'Encryption Services' },
          source: 'IBM CCA Basic Services Reference SC33-8294 Section 3',
          fields: [
            {
              id: 'return_code',
              name: { es: 'Código de Retorno', en: 'Return Code' },
              description: { es: 'Variable entera de salida que recibe el código de retorno', en: 'Output integer receiving return code' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'reason_code',
              name: { es: 'Código de Razón', en: 'Reason Code' },
              description: { es: 'Variable entera de salida que recibe el código de razón', en: 'Output integer receiving reason code' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'exit_data_length',
              name: { es: 'Longitud Datos Salida', en: 'Exit Data Length' },
              description: { es: 'Longitud de datos pasados a la rutina de salida', en: 'Exit routine data length' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: false
            },
            {
              id: 'exit_data',
              name: { es: 'Datos de Salida', en: 'Exit Data' },
              description: { es: 'Parámetro pasado a la rutina de instalación', en: 'Parameter passed to installation exit' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: false
            },
            {
              id: 'key_identifier',
              name: { es: 'Identificador de Clave', en: 'Key Identifier' },
              description: { es: 'Token interno de clave de 64 bytes o etiqueta de clave', en: 'Internal 64-byte key token or key label' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'text_length',
              name: { es: 'Longitud de Texto', en: 'Text Length' },
              description: { es: 'Longitud del texto a cifrar en bytes', en: 'Length of plaintext in bytes' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'clear_text',
              name: { es: 'Texto en Claro', en: 'Clear Text' },
              description: { es: 'Texto plano a cifrar', en: 'Plaintext payload to encrypt' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'initialization_vector',
              name: { es: 'Vector de Inicialización (ICV)', en: 'Initialization Vector (ICV)' },
              description: { es: 'Bloque de 8 o 16 bytes para encadenamiento CBC', en: '8 or 16-byte CBC initialization vector' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'rule_array_count',
              name: { es: 'Contador de Reglas', en: 'Rule Array Count' },
              description: { es: 'Número de palabras clave en rule_array (1..3)', en: 'Number of keywords in rule_array' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'rule_array',
              name: { es: 'Matriz de Reglas (Rule Array)', en: 'Rule Array' },
              description: { es: 'Palabras clave de 8 caracteres: INITIAL, CONTINUE, ONLY, CBC', en: '8-character keywords: INITIAL, CONTINUE, ONLY, CBC' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'ibm-csnbptr',
          code: 'CSNBPTR',
          interfaceId: 'cca-verb',
          direction: 'request',
          name: { es: 'Traducción de Bloque de PIN (PIN Translate)', en: 'Encrypted PIN Translate' },
          summary: { es: 'Re-cifra un bloque de PIN entre dos claves de intercambio', en: 'Re-encrypts a PIN block between two key-encrypting keys' },
          description: { es: 'Traduce un bloque de PIN de la clave de entrada (IPINENC) a la clave de salida (OPINENC).', en: 'Translates a PIN block from inbound key to outbound key.' },
          category: { es: 'Transacciones Financieras y PIN', en: 'Financial PIN Services' },
          source: 'IBM CCA Basic Services Reference SC33-8294 Section 5',
          fields: [
            {
              id: 'return_code',
              name: { es: 'Código Retorno', en: 'Return Code' },
              description: { es: 'Código de retorno de la operación', en: 'Operation return code' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'reason_code',
              name: { es: 'Código Razón', en: 'Reason Code' },
              description: { es: 'Código de razón detallado', en: 'Detailed reason code' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'inbound_PIN_encrypting_key_identifier',
              name: { es: 'Clave PIN Entrada (IPINENC)', en: 'Inbound PIN Key Identifier' },
              description: { es: 'Token de clave de descifrado del bloque de entrada', en: 'Key token for inbound PIN decryption' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'outbound_PIN_encrypting_key_identifier',
              name: { es: 'Clave PIN Salida (OPINENC)', en: 'Outbound PIN Key Identifier' },
              description: { es: 'Token de clave para re-cifrar el bloque de salida', en: 'Key token for outbound PIN re-encryption' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'inbound_PIN_block',
              name: { es: 'Bloque de PIN Entrada', en: 'Inbound PIN Block' },
              description: { es: 'Bloque de PIN cifrado de 8 o 16 bytes', en: 'Encrypted 8 or 16-byte PIN block' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true,
              sensitive: true
            }
          ]
        },
        {
          id: 'ibm-csnbcsvg',
          code: 'CSNBCSG',
          interfaceId: 'cca-verb',
          direction: 'request',
          name: { es: 'Generación de Código CVV / CVC', en: 'VISA CVV / MasterCard CVC Generate' },
          summary: { es: 'Genera el valor de verificación de tarjeta de 3 o 4 dígitos', en: 'Generates 3 or 4-digit card verification code' },
          description: { es: 'Genera el valor CVV1, CVV2, iCVV o CVC a partir del PAN y fecha de expiración.', en: 'Generates CVV1, CVV2, iCVV or CVC value from PAN and expiration date.' },
          category: { es: 'Seguridad de Tarjetas', en: 'Card Security' },
          source: 'IBM CCA Basic Services Reference SC33-8294 Section 6',
          fields: [
            {
              id: 'return_code',
              name: { es: 'Código Retorno', en: 'Return Code' },
              description: { es: 'Código de retorno de la operación', en: 'Operation return code' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'pan_data',
              name: { es: 'Número de Tarjeta (PAN)', en: 'Card Number (PAN)' },
              description: { es: 'Dígitos de la tarjeta de crédito o débito', en: 'Payment card account number' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true,
              sensitive: true
            }
          ]
        }
      ],
      errorCodes: {
        'RC=00/RS=000': {
          code: 'RC=00/RS=000',
          title: { es: 'Operación Exitosa (Success)', en: 'Operation Successful' },
          description: { es: 'El servicio CCA se completó satisfactoriamente.', en: 'CCA service completed successfully.' }
        },
        'RC=08/RS=033': {
          code: 'RC=08/RS=033',
          title: { es: 'Palabra Clave de Rule Array Inválida', en: 'Invalid Rule Array Keyword' },
          description: { es: 'Una de las palabras clave especificadas en rule_array no es reconocida.', en: 'A keyword specified in rule_array is not recognized.' },
          troubleshooting: { es: 'Compruebe la ortografía y el relleno a 8 caracteres con espacios a la derecha.', en: 'Verify spelling and ensure 8-character right-padding with spaces.' }
        },
        'RC=08/RS=048': {
          code: 'RC=08/RS=048',
          title: { es: 'Violación de Control Vector', en: 'Control Vector Violation' },
          description: { es: 'El token de clave suministrado no está autorizado para esta operación.', en: 'Supplied key token is not authorized for this specific operation.' },
          troubleshooting: { es: 'Verifique los bits de autorización del Control Vector con CSNBCVG.', en: 'Verify Control Vector authorization bits using CSNBCVG.' }
        },
        'RC=12/RS=764': {
          code: 'RC=12/RS=764',
          title: { es: 'Clave Maestra No Activa', en: 'Master Key Not Active' },
          description: { es: 'La clave maestra requerida (SYM-MK, ASYM-MK o APKA-MK) no está cargada.', en: 'Required master key is not loaded or active in the coprocessor.' },
          troubleshooting: { es: 'Cargue y active las claves maestras usando la utilidad TKE o páneles ISPF.', en: 'Load and activate master keys using TKE workstation or ISPF panels.' }
        }
      }
    },
    '8.1': {
      version: '8.1',
      extends: '7.5',
      label: { es: 'CCA Release 8.1 (Actual)', en: 'CCA Release 8.1 (Current)' },
      releaseNotes: {
        es: 'Soporte para coprocesador IBM 4769 con claves variables AES HMAC, SHA-3 y acelerador cuántico.',
        en: 'Support for IBM 4769 coprocessor with variable-length AES HMAC keys, SHA-3, and quantum safety.'
      },
      commands: [
        {
          id: 'ibm-csnbkgn2',
          code: 'CSNBKGN2',
          interfaceId: 'cca-verb',
          direction: 'request',
          name: { es: 'Generación de Claves v2 (Key Generate2)', en: 'Key Generate2' },
          summary: { es: 'Genera claves simétricas de longitud variable (AES, HMAC)', en: 'Generates variable-length symmetric keys (AES, HMAC)' },
          description: { es: 'Genera claves simétricas en formato de token variable según estándares X9 TR-31.', en: 'Generates variable-length symmetric keys adhering to X9 TR-31 structures.' },
          category: { es: 'Gestión de Claves v2', en: 'Key Management v2' },
          source: 'IBM CCA Basic Services Reference SC33-8294 Release 8.1 Section 4',
          fields: [
            {
              id: 'key_type',
              name: { es: 'Tipo de Clave', en: 'Key Type' },
              description: { es: 'AES, DES, HMAC, CIPHER, MAC, PINPROT', en: 'AES, DES, HMAC, CIPHER, MAC, PINPROT' },
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
      id: 'ibm-cca-overview',
      title: { es: 'Arquitectura IBM CCA y Coprocesadores 4769', en: 'IBM CCA Architecture & 4769 Coprocessor' },
      category: 'overview',
      markdown: {
        es: `# Coprocesador Criptográfico IBM 4769 (CCA)\n\nEl IBM 4769 es el procesador criptográfico PCIe de mayor rendimiento y seguridad de IBM, integrado en mainframes z16 y servidores empresariales Linux on Z.\n\n### Conceptos Fundamentales\n- **Control Vectors (CV):** Técnica patentada de IBM que liga criptográficamente a la clave los usos permitidos (cifrado, exportación, PIN).\n- **Master Keys:** Claves maestras que residen en memoria volátil protegida por sensores físicos anti-manipulación (tamper-reactive).\n- **Rule Arrays:** Conjunto de palabras clave de 8 caracteres que modulan el comportamiento de cada verbo.`,
        en: `# IBM 4769 Cryptographic Coprocessor (CCA)\n\nThe IBM 4769 is IBM's highest-performing, tamper-responsive PCIe cryptographic coprocessor, deployed in IBM z16 mainframes and Linux on Z servers.\n\n### Core Architecture\n- **Control Vectors (CV):** IBM proprietary technology cryptographically binding allowed operations to each key token.\n- **Master Keys:** Hardware-bound keys stored in battery-backed zeroizing RAM.\n- **Rule Arrays:** 8-character keyword arrays controlling verb execution options.`
      }
    }
  ]
};
