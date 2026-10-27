/**
 * @packageDocumentation
 * Specification for Yubico YubiHSM 2 (`@chci/device-specs`).
 * Features native binary wire protocol [Tc:1B][Lc:2B][Payload], YubiHSM Shell CLI,
 * and OASIS PKCS#11 across firmware 2.4.0 and 2.3.1.
 */

import type { DeviceSpec } from '@chci/parser-core';

export const yubicoYubihsm2Spec: DeviceSpec = {
  id: 'yubico-yubihsm-2',
  name: 'Yubico YubiHSM 2',
  vendor: 'Yubico',
  category: 'HSM_GP',
  status: 'coming-soon',
  icon: 'cpu',
  defaultVersion: '2.4.0',
  defaultInterface: 'yubihsm-wire',
  exampleCommand: '01000448656C6C6F',
  summary: {
    es: 'Módulo de seguridad de hardware compacto en formato USB para servidores, autoridades de certificación (CA) y firma de código.',
    en: 'Ultra-compact USB form-factor Hardware Security Module for servers, Certificate Authorities (CA), and code signing.'
  },
  framing: {
    type: 'header-positional',
    defaultHeaderLength: 0,
    commandCodeLength: 2,
    responseErrorCodeLength: 2,
    successErrorCode: '81'
  },
  interfaces: [
    {
      id: 'yubihsm-wire',
      name: { es: 'Protocolo Binario Nativo (Hex)', en: 'Native Binary Wire Protocol (Hex)' },
      shortLabel: 'Wire Hex',
      kind: 'proprietary',
      wireFormat: 'binary-hex',
      description: {
        es: 'Protocolo de bajo nivel por trama: [Comando: 1 byte][Longitud: 2 bytes][Carga de datos: N bytes].',
        en: 'Low-level byte-oriented wire protocol: [Command: 1 byte][Length: 2 bytes][Payload: N bytes].'
      },
      framing: {
        type: 'header-positional',
        defaultHeaderLength: 0,
        commandCodeLength: 2,
        responseErrorCodeLength: 2,
        successErrorCode: '81'
      },
      exampleCommand: '01000454657374'
    },
    {
      id: 'yubihsm-shell',
      name: { es: 'Consola yubihsm-shell CLI', en: 'yubihsm-shell CLI Console' },
      shortLabel: 'Shell CLI',
      kind: 'proprietary',
      wireFormat: 'cli',
      description: {
        es: 'Comandos de la herramienta de consola interactiva y scriptable yubihsm-shell.',
        en: 'Interactive scriptable command line interface tool yubihsm-shell.'
      },
      framing: { type: 'structured', format: 'cli' },
      exampleCommand: 'yubihsm> get deviceinfo'
    },
    {
      id: 'pkcs11',
      name: { es: 'PKCS#11 Cryptoki', en: 'PKCS#11 Cryptoki' },
      shortLabel: 'PKCS#11',
      kind: 'standard',
      wireFormat: 'callable',
      description: {
        es: 'Módulo dinámico PKCS#11 para integración con OpenSSL, EJBCA y Windows CNG.',
        en: 'Dynamic PKCS#11 library module for OpenSSL, EJBCA, and Windows CNG.'
      },
      framing: { type: 'structured', format: 'callable' },
      exampleCommand: 'C_Sign(hSession=0x01, pData="HashPayload", ulDataLen=32);'
    }
  ],
  versions: {
    '2.3.1': {
      version: '2.3.1',
      label: { es: 'YubiHSM Firmware 2.3.1', en: 'YubiHSM Firmware 2.3.1' },
      releaseNotes: {
        es: 'Firmware certificado FIPS con algoritmos RSA 2048/3072/4096, ECC P-256, Ed25519 y HMAC.',
        en: 'FIPS-validated firmware release with RSA, ECC P-256, Ed25519, and HMAC capabilities.'
      },
      commands: [
        {
          id: 'yh-01-echo',
          code: '01',
          interfaceId: 'yubihsm-wire',
          direction: 'request',
          pairedCode: '81',
          name: { es: 'Eco de Diagnóstico (Echo)', en: 'Diagnostic Echo' },
          summary: { es: 'Envía datos al dispositivo y verifica la respuesta idéntica', en: 'Sends data to device and verifies identical response' },
          description: { es: 'Comando de diagnóstico para verificar conectividad y canal de comunicación USB.', en: 'Diagnostic command verifying USB connectivity and device responsiveness.' },
          category: { es: 'Diagnóstico y Sistema', en: 'Diagnostic and System' },
          source: 'YubiHSM 2 Protocol Reference Section 3.1',
          fields: [
            {
              id: 'length',
              name: { es: 'Longitud de Carga', en: 'Payload Length' },
              description: { es: '2 bytes hexadecimales indicando longitud en bytes', en: '2 hex bytes indicating payload length' },
              length: { kind: 'fixed', length: 4 },
              encoding: 'hex-ascii',
              required: true
            },
            {
              id: 'payload',
              name: { es: 'Datos de Eco', en: 'Echo Payload' },
              description: { es: 'Bytes arbitrarios que el dispositivo devolverá', en: 'Arbitrary bytes returned by device' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: false
            }
          ]
        },
        {
          id: 'yh-06-device-info',
          code: '06',
          interfaceId: 'yubihsm-wire',
          direction: 'request',
          pairedCode: '86',
          name: { es: 'Información del Dispositivo', en: 'Get Device Information' },
          summary: { es: 'Obtiene versión de firmware, número de serie y algoritmos', en: 'Gets firmware version, serial number, and supported algorithms' },
          description: { es: 'Devuelve información completa de hardware, número de serie y capacidades criptográficas.', en: 'Returns complete hardware specifications, serial number, and crypto capabilities.' },
          category: { es: 'Diagnóstico y Sistema', en: 'Diagnostic and System' },
          source: 'YubiHSM 2 Protocol Reference Section 3.2',
          fields: [
            {
              id: 'length',
              name: { es: 'Longitud (Cero)', en: 'Length (Zero)' },
              description: { es: 'Longitud de carga vacía (0000)', en: 'Zero payload length (0000)' },
              length: { kind: 'fixed', length: 4 },
              encoding: 'hex-ascii',
              required: true
            }
          ]
        },
        {
          id: 'yh-47-sign-pkcs1',
          code: '47',
          interfaceId: 'yubihsm-wire',
          direction: 'request',
          pairedCode: 'C7',
          name: { es: 'Firma RSA PKCS#1 v1.5', en: 'Sign Data PKCS#1 v1.5' },
          summary: { es: 'Genera una firma RSA con clave almacenada en el HSM', en: 'Generates RSA signature using key stored in the HSM' },
          description: { es: 'Firma un resumen SHA-256/384/512 utilizando una clave privada RSA residente.', en: 'Signs a SHA digest using a resident RSA private key.' },
          category: { es: 'Operaciones Asimétricas', en: 'Asymmetric Operations' },
          source: 'YubiHSM 2 Protocol Reference Section 4.3',
          fields: [
            {
              id: 'length',
              name: { es: 'Longitud de Parámetros', en: 'Parameters Length' },
              description: { es: '2 bytes hex con la longitud total de la carga', en: '2 hex bytes indicating payload length' },
              length: { kind: 'fixed', length: 4 },
              encoding: 'hex-ascii',
              required: true
            },
            {
              id: 'key_id',
              name: { es: 'ID de Clave RSA', en: 'RSA Key ID' },
              description: { es: 'Identificador del objeto clave privada (2 bytes hex)', en: 'Target RSA private key object ID' },
              length: { kind: 'fixed', length: 4 },
              encoding: 'hex-ascii',
              required: true
            },
            {
              id: 'digest',
              name: { es: 'Resumen Criptográfico (Digest)', en: 'Cryptographic Digest' },
              description: { es: 'Hash SHA a firmar en hexadecimal', en: 'SHA hash digest to sign in hex' },
              length: { kind: 'variable' },
              encoding: 'hex-ascii',
              required: true
            }
          ]
        },
        {
          id: 'yh-shell-deviceinfo',
          code: 'get deviceinfo',
          interfaceId: 'yubihsm-shell',
          direction: 'request',
          name: { es: 'Consultar Info en Shell', en: 'Get Device Info Shell' },
          summary: { es: 'Comando de consola para ver datos de hardware', en: 'CLI command to inspect hardware data' },
          description: { es: 'Ejecuta consulta de dispositivo a través del conector yubihsm-connector.', en: 'Queries device status via yubihsm-connector.' },
          category: { es: 'Comandos Shell', en: 'Shell Commands' },
          source: 'yubihsm-shell manual page',
          fields: []
        }
      ],
      errorCodes: {
        '02': {
          code: '02',
          title: { es: 'INVALID_COMMAND (Comando Inválido)', en: 'INVALID_COMMAND' },
          description: { es: 'El código de comando suministrado no es reconocido por este firmware.', en: 'Command byte not recognized by active firmware.' }
        },
        '04': {
          code: '04',
          title: { es: 'INVALID_SESSION (Sesión Inválida)', en: 'INVALID_SESSION' },
          description: { es: 'El identificador de sesión SCP03 no existe o ha expirado.', en: 'SCP03 session identifier does not exist or has expired.' }
        },
        '0A': {
          code: '0A',
          title: { es: 'INSUFFICIENT_PERMISSIONS (Permisos Insuficientes)', en: 'INSUFFICIENT_PERMISSIONS' },
          description: { es: 'La clave de autenticación activa no posee permisos para esta acción en el dominio.', en: 'Active auth key lacks required capability permissions in domain.' }
        },
        '0C': {
          code: '0C',
          title: { es: 'OBJECT_NOT_FOUND (Objeto No Encontrado)', en: 'OBJECT_NOT_FOUND' },
          description: { es: 'El ID de objeto especificado no existe en la memoria del HSM.', en: 'Target object ID was not found in HSM memory.' }
        }
      }
    },
    '2.4.0': {
      version: '2.4.0',
      extends: '2.3.1',
      label: { es: 'YubiHSM Firmware 2.4.0 (Actual)', en: 'YubiHSM Firmware 2.4.0 (Current)' },
      releaseNotes: {
        es: 'Soporte para algoritmo Ed25519/Ed448 mejorado y almacenamiento de hasta 256 objetos criptográficos.',
        en: 'Enhanced Ed25519/Ed448 support and expanded storage for up to 256 cryptographic objects.'
      },
      commands: [
        {
          id: 'yh-55-sign-eddsa',
          code: '55',
          interfaceId: 'yubihsm-wire',
          direction: 'request',
          pairedCode: 'D5',
          name: { es: 'Firma Digital EdDSA', en: 'Sign Data EdDSA' },
          summary: { es: 'Genera firma Ed25519 de alta velocidad', en: 'Generates high-speed Ed25519 digital signature' },
          description: { es: 'Firma datos arbitrarios con curva Ed25519 Edwards según RFC 8032.', en: 'Signs payload using Ed25519 Edwards curve per RFC 8032.' },
          category: { es: 'Operaciones Asimétricas', en: 'Asymmetric Operations' },
          source: 'YubiHSM 2 Protocol Reference Section 4.5',
          fields: [
            {
              id: 'length',
              name: { es: 'Longitud de Carga', en: 'Payload Length' },
              description: { es: 'Longitud total de parámetros', en: 'Total payload length' },
              length: { kind: 'fixed', length: 4 },
              encoding: 'hex-ascii',
              required: true
            },
            {
              id: 'key_id',
              name: { es: 'ID de Clave EdDSA', en: 'EdDSA Key ID' },
              description: { es: 'ID de la clave privada Ed25519', en: 'Ed25519 private key object ID' },
              length: { kind: 'fixed', length: 4 },
              encoding: 'hex-ascii',
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
      id: 'yubihsm-overview',
      title: { es: 'Arquitectura y Protocolo de YubiHSM 2', en: 'YubiHSM 2 Architecture and Wire Protocol' },
      category: 'overview',
      markdown: {
        es: `# Módulo Criptográfico YubiHSM 2\n\nEl YubiHSM 2 de Yubico es un módulo de hardware criptográfico miniaturizado en formato nano USB, diseñado para proteger secretos de aplicaciones web, certificados TLS, firmas de paquetes de software y llaves maestras de autoridades certificadoras.\n\n### Estructura de Trama Binaria (Wire)\n- **Tc (1 Byte):** Código de comando.\n- **Lc (2 Bytes):** Longitud de datos (Big Endian).\n- **Vc (N Bytes):** Parámetros y datos del comando.\n- **Tr (1 Byte):** Código de respuesta (\`Tr = Tc | 0x80\`) o \`0x7F\` en caso de error.`,
        en: `# YubiHSM 2 Cryptographic Hardware\n\nThe YubiHSM 2 is an ultra-compact USB HSM designed to secure Certificate Authorities, code signing servers, and web applications.\n\n### Wire Protocol Structure\n- **Tc (1 Byte):** Command code.\n- **Lc (2 Bytes):** Big-endian payload length.\n- **Vc (N Bytes):** Command payload.\n- **Tr (1 Byte):** Response code (\`Tr = Tc | 0x80\`) or \`0x7F\` on failure.`
      }
    }
  ]
};
