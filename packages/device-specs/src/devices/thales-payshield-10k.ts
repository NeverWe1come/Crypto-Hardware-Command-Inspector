/**
 * @packageDocumentation
 * Device specification for Thales payShield 10K Payment HSM (Firmware v1.9 and v2.3).
 */

import type { DeviceSpec } from '@chci/parser-core';
import {
  thalesPayshieldCommandsV19,
  thalesPayshieldCommandsV23
} from './thales-payshield-commands';
import { thalesPayshieldDocs } from './thales-payshield-docs';
import { THALES_PAYSHIELD_V23_ERRORS } from './thales-payshield-v23-errors';

/**
 * Thales payShield 10K hardware specification.
 */
export const thalesPayshield10kSpec: DeviceSpec = {
  id: 'thales-payshield-10k',
  name: 'Thales payShield 10K',
  vendor: 'Thales',
  category: 'HSM_FINANCIAL',
  status: 'supported',
  summary: {
    es: 'Módulo de seguridad de hardware financiero Thales payShield 10K con soporte para encabezados posicionales, bloques de clave LMK, TR-31 y cifrado de PIN.',
    en: 'Thales payShield 10K Financial Hardware Security Module with positional header framing, LMK key blocks, TR-31, and PIN encryption.'
  },
  defaultVersion: '2.3',
  defaultInterface: 'payshield-host',
  exampleCommand: 'NC',
  interfaces: [
    {
      id: 'payshield-host',
      name: { es: 'Protocolo Host payShield', en: 'payShield Host Protocol' },
      shortLabel: 'payShield',
      kind: 'proprietary',
      wireFormat: 'ascii-frame',
      description: {
        es: 'Protocolo de tramas posicionales con cabecera [Header]CC...',
        en: 'Positional frame protocol with header [Header]CC...'
      },
      framing: {
        type: 'header-positional',
        defaultHeaderLength: 4,
        commandCodeLength: 2,
        responseErrorCodeLength: 2,
        successErrorCode: '00',
        endMessageDelimiter: '\x19',
        lmkIdDelimiter: '%'
      },
      exampleCommand: 'NC'
    }
  ],
  documentationSections: thalesPayshieldDocs,
  framing: {
    type: 'header-positional',
    defaultHeaderLength: 4,
    commandCodeLength: 2,
    responseErrorCodeLength: 2,
    successErrorCode: '00',
    endMessageDelimiter: '\x19',
    lmkIdDelimiter: '%'
  },
  versions: {
    '1.9': {
      version: '1.9',
      label: {
        es: 'Firmware v1.9 (Base)',
        en: 'Firmware v1.9 (Base)'
      },
      releaseNotes: {
        es: 'Soporte base para comandos de diagnóstico, generación de claves DES/3DES y traducción de PIN.',
        en: 'Base support for diagnostics, DES/3DES key generation, and PIN translation commands.'
      },
      commands: [
        {
          id: 'thales-nc-diag-req',
          code: 'NC',
          direction: 'request',
          pairedCode: 'ND',
          name: { es: 'Diagnóstico del HSM (Petición)', en: 'HSM Diagnostics (Request)' },
          summary: { es: 'Solicita el estado y la suma de comprobación del LMK', en: 'Requests HSM status and LMK check values' },
          description: {
            es: 'Comando de diagnóstico básico para verificar la operatividad del HSM y obtener el checksum del LMK actual.',
            en: 'Basic diagnostic command to verify HSM availability and obtain the current LMK check value.'
          },
          category: { es: 'Diagnóstico y Estado', en: 'Diagnostics & Status' },
          fields: [],
          source: 'Thales payShield 10K Host Command Reference Manual v1.9, Section 3.1, NC Command'
        },
        {
          id: 'thales-nd-diag-res',
          code: 'ND',
          direction: 'response',
          pairedCode: 'NC',
          name: { es: 'Diagnóstico del HSM (Respuesta)', en: 'HSM Diagnostics (Response)' },
          summary: { es: 'Devuelve el estado operativo, checksum LMK y versión de firmware', en: 'Returns operating status, LMK checksum, and firmware version' },
          description: {
            es: 'Respuesta con el código de error de 2 caracteres, el valor de comprobación del LMK y la versión de release del firmware.',
            en: 'Response containing 2-digit error code, LMK check value, and firmware release number.'
          },
          category: { es: 'Diagnóstico y Estado', en: 'Diagnostics & Status' },
          fields: [
            {
              id: 'lmk-check-value',
              name: { es: 'Valor de Comprobación LMK', en: 'LMK Check Value' },
              description: { es: '16 dígitos hexadecimales que representan el checksum del LMK activo.', en: '16 hexadecimal digits representing the active LMK checksum.' },
              position: 0,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true
            },
            {
              id: 'firmware-release',
              name: { es: 'Versión de Firmware', en: 'Firmware Release' },
              description: { es: 'Número de versión o release del firmware instalado (ej. 1347-0900).', en: 'Installed firmware release number (e.g. 1347-0900).' },
              position: 1,
              length: { kind: 'fixed', length: 9 },
              encoding: 'ascii',
              required: true
            }
          ],
          source: 'Thales payShield 10K Host Command Reference Manual v1.9, Section 3.1, ND Command'
        },
        {
          id: 'thales-a0-gen-key-req',
          code: 'A0',
          direction: 'request',
          pairedCode: 'A1',
          name: { es: 'Generación / Importación de Clave (Petición)', en: 'Generate / Import Key (Request)' },
          summary: { es: 'Solicita al HSM generar o importar una clave criptográfica', en: 'Requests the HSM to generate or import a cryptographic key' },
          description: {
            es: 'Genera una clave aleatoria o bajo componente bajo el LMK con el tipo y esquema especificados.',
            en: 'Generates a random key or key from components under LMK with the specified type and key scheme.'
          },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'mode',
              name: { es: 'Modo de Generación', en: 'Key Mode' },
              description: { es: '0: Generar nueva clave; 1: Importar clave bajo ZMK.', en: '0: Generate new key; 1: Import key under ZMK.' },
              position: 0,
              length: { kind: 'fixed', length: 1 },
              encoding: 'alphanumeric',
              required: true,
              enumValues: [
                { value: '0', label: { es: 'Generar Clave', en: 'Generate Key' } },
                { value: '1', label: { es: 'Importar Clave', en: 'Import Key' } }
              ]
            },
            {
              id: 'key-type',
              name: { es: 'Tipo de Clave', en: 'Key Type' },
              description: { es: 'Código numérico de 3 dígitos que define el uso (000: ZMK, 001: ZPK, 002: PVK/TMK, etc.).', en: '3-digit code specifying key usage (000: ZMK, 001: ZPK, 002: PVK/TMK, etc.).' },
              position: 1,
              length: { kind: 'fixed', length: 3 },
              encoding: 'alphanumeric',
              required: true
            },
            {
              id: 'key-scheme',
              name: { es: 'Esquema de Clave LMK', en: 'Key Scheme LMK' },
              description: { es: 'U: Doble longitud DES; T: Triple longitud DES; X/Y: Variantes ANSI; S/R: Key Block.', en: 'U: Double-length DES; T: Triple-length DES; X/Y: ANSI variants; S/R: Key Block.' },
              position: 2,
              length: { kind: 'fixed', length: 1 },
              encoding: 'alphanumeric',
              required: true,
              enumValues: [
                { value: 'U', label: { es: 'Doble Longitud (32 hex)', en: 'Double Length (32 hex)' } },
                { value: 'T', label: { es: 'Triple Longitud (48 hex)', en: 'Triple Length (48 hex)' } },
                { value: 'X', label: { es: 'Doble Variante ANSI', en: 'Double ANSI Variant' } },
                { value: 'S', label: { es: 'Thales Key Block', en: 'Thales Key Block' } },
                { value: 'R', label: { es: 'TR-31 Key Block', en: 'TR-31 Key Block' } }
              ]
            }
          ],
          source: 'Thales payShield 10K Host Command Reference Manual v1.9, Section 4.2, A0 Command'
        },
        {
          id: 'thales-a1-gen-key-res',
          code: 'A1',
          direction: 'response',
          pairedCode: 'A0',
          name: { es: 'Generación / Importación de Clave (Respuesta)', en: 'Generate / Import Key (Response)' },
          summary: { es: 'Devuelve la clave generada cifrada bajo LMK y su KCV', en: 'Returns the generated key encrypted under LMK and its KCV' },
          description: {
            es: 'Respuesta con la clave criptográfica cifrada bajo LMK (esquema autodescriptivo o Key Block) y el valor de verificación de clave (KCV).',
            en: 'Response containing key encrypted under LMK (self-describing scheme or Key Block) and key check value (KCV).'
          },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'key-under-lmk',
              name: { es: 'Clave bajo LMK', en: 'Key under LMK' },
              description: { es: 'Criptograma de clave cifrado bajo LMK (con prefijo U, T, S, R o hex sin prefijo).', en: 'Key cryptogram encrypted under LMK (with U, T, S, R prefix or bare hex).' },
              position: 0,
              length: { kind: 'thales-key' },
              encoding: 'alphanumeric',
              required: true,
              sensitive: true
            },
            {
              id: 'kcv',
              name: { es: 'Valor de Verificación de Clave (KCV)', en: 'Key Check Value (KCV)' },
              description: { es: '6 caracteres hexadecimales resultantes de cifrar un bloque de ceros.', en: '6 hexadecimal characters computed by encrypting zero block.' },
              position: 1,
              length: { kind: 'fixed', length: 6 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: false
            }
          ],
          source: 'Thales payShield 10K Host Command Reference Manual v1.9, Section 4.2, A1 Command'
        },
        {
          id: 'thales-ca-pin-translate-req',
          code: 'CA',
          direction: 'request',
          pairedCode: 'CB',
          name: { es: 'Traducción de PIN (Petición)', en: 'Translate PIN (Request)' },
          summary: { es: 'Traduce un PIN block de una clave a otra', en: 'Translates a PIN block from one key to another' },
          description: {
            es: 'Descifra un PIN block cifrado bajo una clave de entrada (TPK/ZPK) y lo vuelve a cifrar bajo una clave de salida (ZPK) cambiando opcionalmente el formato del PIN.',
            en: 'Decrypts a PIN block under an incoming key (TPK/ZPK) and re-encrypts it under an outgoing key (ZPK), optionally converting PIN format.'
          },
          category: { es: 'Traducción y Procesamiento de PIN', en: 'PIN Translation & Processing' },
          fields: [
            {
              id: 'source-tpk',
              name: { es: 'Clave de Origen (TPK/ZPK)', en: 'Source Key (TPK/ZPK)' },
              description: { es: 'Clave bajo LMK utilizada para descifrar el PIN block entrante.', en: 'Key under LMK used to decrypt the incoming PIN block.' },
              position: 0,
              length: { kind: 'thales-key' },
              encoding: 'alphanumeric',
              required: true,
              sensitive: true
            },
            {
              id: 'dest-zpk',
              name: { es: 'Clave de Destino (ZPK)', en: 'Destination Key (ZPK)' },
              description: { es: 'Clave bajo LMK utilizada para cifrar el PIN block saliente.', en: 'Key under LMK used to encrypt the outgoing PIN block.' },
              position: 1,
              length: { kind: 'thales-key' },
              encoding: 'alphanumeric',
              required: true,
              sensitive: true
            },
            {
              id: 'max-pin-length',
              name: { es: 'Longitud Máxima de PIN', en: 'Maximum PIN Length' },
              description: { es: '2 dígitos decimales que indican la longitud máxima permitida de PIN (ej. 12).', en: '2 decimal digits indicating maximum permitted PIN length (e.g. 12).' },
              position: 2,
              length: { kind: 'fixed', length: 2 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'source-pin-block',
              name: { es: 'PIN Block Entrante', en: 'Source PIN Block' },
              description: { es: '16 caracteres hexadecimales del PIN block cifrado con la clave de origen.', en: '16 hexadecimal characters of PIN block encrypted under source key.' },
              position: 3,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'source-pin-format',
              name: { es: 'Formato de PIN de Origen', en: 'Source PIN Block Format' },
              description: { es: '2 dígitos con el código del formato origen (01: ISO-0 / ANSI 9.8, 02: Docutel, 03: Diebold, etc.).', en: '2 digits indicating source format (01: ISO-0 / ANSI 9.8, 02: Docutel, 03: Diebold, etc.).' },
              position: 4,
              length: { kind: 'fixed', length: 2 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'dest-pin-format',
              name: { es: 'Formato de PIN de Destino', en: 'Destination PIN Block Format' },
              description: { es: '2 dígitos con el código del formato destino para el PIN block traducido.', en: '2 digits indicating destination format for translated PIN block.' },
              position: 5,
              length: { kind: 'fixed', length: 2 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'account-number',
              name: { es: 'Número de Cuenta (12 dígitos PAN)', en: 'Account Number (12 PAN digits)' },
              description: { es: 'Los 12 dígitos menos significativos del PAN (excluyendo el dígito de control).', en: '12 least significant digits of PAN (excluding check digit).' },
              position: 6,
              length: { kind: 'fixed', length: 12 },
              encoding: 'decimal',
              required: true
            }
          ],
          source: 'Thales payShield 10K Host Command Reference Manual v1.9, Section 5.3, CA Command'
        },
        {
          id: 'thales-cb-pin-translate-res',
          code: 'CB',
          direction: 'response',
          pairedCode: 'CA',
          name: { es: 'Traducción de PIN (Respuesta)', en: 'Translate PIN (Response)' },
          summary: { es: 'Devuelve el PIN block traducido cifrado bajo la clave de destino', en: 'Returns translated PIN block encrypted under destination key' },
          description: {
            es: 'Respuesta con la longitud del PIN, el nuevo PIN block cifrado bajo ZPK y el formato final aplicado.',
            en: 'Response containing PIN length, new PIN block encrypted under destination ZPK, and format.'
          },
          category: { es: 'Traducción y Procesamiento de PIN', en: 'PIN Translation & Processing' },
          fields: [
            {
              id: 'pin-length',
              name: { es: 'Longitud del PIN', en: 'PIN Length' },
              description: { es: '2 dígitos decimales con el número de dígitos del PIN.', en: '2 decimal digits with PIN digit count.' },
              position: 0,
              length: { kind: 'fixed', length: 2 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'translated-pin-block',
              name: { es: 'PIN Block Traducido', en: 'Translated PIN Block' },
              description: { es: '16 caracteres hexadecimales del PIN block cifrado con la clave destino.', en: '16 hexadecimal characters of translated PIN block.' },
              position: 1,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'dest-pin-format',
              name: { es: 'Formato de PIN Aplicado', en: 'Applied PIN Block Format' },
              description: { es: '2 dígitos con el código del formato aplicado.', en: '2 digits indicating the applied format.' },
              position: 2,
              length: { kind: 'fixed', length: 2 },
              encoding: 'decimal',
              required: true
            }
          ],
          source: 'Thales payShield 10K Host Command Reference Manual v1.9, Section 5.3, CB Command'
        },
        ...thalesPayshieldCommandsV19.filter(
          (c) => !['NC', 'ND', 'A0', 'A1', 'CA', 'CB'].includes(c.code)
        )
      ],
      errorCodes: THALES_PAYSHIELD_V23_ERRORS
    },
    '2.3': {
      version: '2.3',
      label: {
        es: 'Firmware v2.3 (Actual)',
        en: 'Firmware v2.3 (Current)'
      },
      releaseNotes: {
        es: 'Extiende v1.9 con soporte mandatorio para Key Blocks TR-31 (prefijo R y S), algoritmos AES y cifrado autenticado.',
        en: 'Extends v1.9 with mandatory support for TR-31 Key Blocks (prefixes R & S), AES algorithms, and authenticated encryption.'
      },
      extends: '1.9',
      commands: [
        ...thalesPayshieldCommandsV23.filter(
          (c) => !['NC', 'ND', 'A0', 'A1', 'CA', 'CB'].includes(c.code)
        )
      ],
      errorCodes: THALES_PAYSHIELD_V23_ERRORS
    }
  }
};
