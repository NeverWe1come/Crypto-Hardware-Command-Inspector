/**
 * @packageDocumentation
 * Device specification for Utimaco Atalla AT1000 Payment HSM (Firmware v8.50 and v8.60).
 */

import type { DeviceSpec } from '@chci/parser-core';

/**
 * Utimaco Atalla AT1000 specification.
 */
export const atallaAt1000Spec: DeviceSpec = {
  id: 'utimaco-atalla-at1000',
  name: 'Utimaco Atalla AT1000',
  vendor: 'Utimaco',
  category: 'HSM_FINANCIAL',
  status: 'supported',
  summary: {
    es: 'Módulo de seguridad de hardware financiero Atalla AT1000 de Utimaco con soporte para tramas delimitadas y bloques AKB.',
    en: 'Utimaco Atalla AT1000 Financial Hardware Security Module with delimited frame architecture and AKB key blocks.'
  },
  defaultVersion: '8.60',
  framing: {
    type: 'delimited-positional',
    startDelimiter: '<',
    endDelimiter: '>',
    fieldDelimiter: '#',
    requireTrailingDelimiter: true,
    contextTagPrefix: '^'
  },
  versions: {
    '8.50': {
      version: '8.50',
      label: {
        es: 'Firmware v8.50 (Base)',
        en: 'Firmware v8.50 (Base)'
      },
      releaseNotes: {
        es: 'Soporte completo para comandos de gestión de claves AKB, traducción de PIN ANSI y pruebas de conectividad.',
        en: 'Full support for AKB key management, ANSI PIN translation, and connectivity testing.'
      },
      commands: [
        {
          id: 'atalla-00-echo-req',
          code: '00',
          direction: 'request',
          pairedCode: '00',
          name: { es: 'Prueba de Eco (Petición)', en: 'Echo Test Message (Request)' },
          summary: { es: 'Envía un mensaje de prueba al HSM', en: 'Sends echo test payload to the HSM' },
          description: {
            es: 'Verifica la conectividad y el canal de comunicaciones enviando datos que el HSM devuelve intactos en su respuesta.',
            en: 'Verifies host-to-HSM communications channel integrity by echoing data back unchanged.'
          },
          category: { es: 'Diagnóstico y Comunicaciones', en: 'Diagnostics & Communications' },
          fields: [
            {
              id: 'echo-data',
              name: { es: 'Mensaje de Eco', en: 'Echo Message' },
              description: { es: 'Cadena de datos arbitrarios devueltos por el HSM.', en: 'Arbitrary data payload echoed by the HSM.' },
              position: 0,
              length: { kind: 'range', min: 1, max: 256 },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Atalla AT1000 Host Command Reference Manual v8.50, Section 4.1, Echo Test'
        },
        {
          id: 'atalla-00-echo-res',
          code: '00',
          direction: 'response',
          pairedCode: '00',
          name: { es: 'Prueba de Eco (Respuesta)', en: 'Echo Test Message (Response)' },
          summary: { es: 'Respuesta de eco con palabra de estado del HSM', en: 'Echo response returning HSM status word' },
          description: {
            es: 'Retorna la palabra de estado EEFFVV (código de error, campo offending y versión de firmware) y los datos de eco.',
            en: 'Returns EEFFVV status word (error code, offending field, firmware version) and echoed payload.'
          },
          category: { es: 'Diagnóstico y Comunicaciones', en: 'Diagnostics & Communications' },
          fields: [
            {
              id: 'status-word',
              name: { es: 'Palabra de Estado (EEFFVV)', en: 'Status Word (EEFFVV)' },
              description: { es: '6 dígitos decimales que codifican Error (EE), Campo (FF) y Versión (VV).', en: '6 decimal digits encoding Error (EE), Field (FF), and Version (VV).' },
              position: 0,
              length: { kind: 'fixed', length: 6 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'echo-data',
              name: { es: 'Mensaje de Eco Devuelto', en: 'Echoed Message' },
              description: { es: 'Datos de eco idénticos a los enviados en la petición.', en: 'Echo data identical to request payload.' },
              position: 1,
              length: { kind: 'range', min: 1, max: 256 },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Atalla AT1000 Host Command Reference Manual v8.50, Section 4.1, Echo Test Response'
        },
        {
          id: 'atalla-10-gen-key-req',
          code: '10',
          direction: 'request',
          pairedCode: '20',
          name: { es: 'Generar Clave de Trabajo (Petición)', en: 'Generate Working Key (Request)' },
          summary: { es: 'Genera una clave simétrica de trabajo bajo una clave maestra AKB', en: 'Generates a symmetric working key under a master AKB' },
          description: {
            es: 'Genera criptogramas de claves para PIN (PEK), datos (DEK) o MAC bajo la clave maestra especificada.',
            en: 'Generates working key cryptograms for PIN (PEK), data (DEK), or MAC under the specified master key.'
          },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'key-usage',
              name: { es: 'Uso de la Clave', en: 'Key Usage' },
              description: { es: 'Tipo de clave a generar (1=PEK, 2=DEK, 3=MAC).', en: 'Type of key to generate (1=PEK, 2=DEK, 3=MAC).' },
              position: 0,
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true,
              enumValues: [
                { value: '1', label: { es: 'Clave de Cifrado de PIN (PEK)', en: 'PIN Encryption Key (PEK)' } },
                { value: '2', label: { es: 'Clave de Cifrado de Datos (DEK)', en: 'Data Encryption Key (DEK)' } },
                { value: '3', label: { es: 'Clave de Verificación de MAC (MEK)', en: 'Message Authentication Key (MEK)' } }
              ]
            },
            {
              id: 'master-key',
              name: { es: 'Clave Maestra (AKB)', en: 'Master Key (AKB)' },
              description: { es: 'Criptograma de clave maestra bajo la cual se cifrará la nueva clave.', en: 'Master key cryptogram under which the new key is encrypted.' },
              position: 1,
              length: { kind: 'range', min: 4, max: 256 },
              encoding: 'ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'key-length',
              name: { es: 'Longitud de Clave', en: 'Key Length' },
              description: { es: 'Longitud en caracteres hexadecimales (16=DES, 32=2TDES, 48=3TDES).', en: 'Length in hex characters (16=DES, 32=2TDES, 48=3TDES).' },
              position: 2,
              length: { kind: 'fixed', length: 2 },
              encoding: 'decimal',
              required: true,
              enumValues: [
                { value: '16', label: { es: 'Longitud Simple (DES, 64 bits)', en: 'Single Length (DES, 64-bit)' } },
                { value: '32', label: { es: 'Doble Longitud (2TDES, 128 bits)', en: 'Double Length (2TDES, 128-bit)' } },
                { value: '48', label: { es: 'Triple Longitud (3TDES, 192 bits)', en: 'Triple Length (3TDES, 192-bit)' } }
              ]
            }
          ],
          source: 'Atalla AT1000 Host Command Reference Manual v8.50, Section 5.2, Command 10'
        },
        {
          id: 'atalla-20-gen-key-res',
          code: '20',
          direction: 'response',
          pairedCode: '10',
          name: { es: 'Generar Clave de Trabajo (Respuesta)', en: 'Generate Working Key (Response)' },
          summary: { es: 'Devuelve la nueva clave generada y su valor de control KCV', en: 'Returns the generated key cryptogram and KCV' },
          description: {
            es: 'Retorna el criptograma de la clave de trabajo bajo AKB junto con los 4 caracteres hexadecimales de control de clave.',
            en: 'Returns the generated working key under AKB and its 4-hex-digit key check value.'
          },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'generated-key',
              name: { es: 'Clave Generada (AKB)', en: 'Generated Key (AKB)' },
              description: { es: 'Criptograma de la nueva clave de trabajo.', en: 'Cryptogram of the generated working key.' },
              position: 0,
              length: { kind: 'range', min: 4, max: 256 },
              encoding: 'ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'check-digits',
              name: { es: 'Dígitos de Control (KCV)', en: 'Key Check Value (KCV)' },
              description: { es: '4 caracteres hexadecimales de verificación de clave.', en: '4 hexadecimal key check digits.' },
              position: 1,
              length: { kind: 'fixed', length: 4 },
              encoding: 'hex-ascii',
              required: true
            }
          ],
          source: 'Atalla AT1000 Host Command Reference Manual v8.50, Section 5.2, Command 20'
        },
        {
          id: 'atalla-31-sub1-req',
          code: '31',
          subCode: '1',
          subCodeFieldIndex: 0,
          direction: 'request',
          pairedCode: '41',
          name: { es: 'Traducir PIN Formato ANSI X9.8 (Sub 1)', en: 'Translate PIN ANSI X9.8 Format (Sub 1)' },
          summary: { es: 'Traduce un PIN block de una clave PEK a otra bajo formato ANSI', en: 'Translates a PIN block from source PEK to destination PEK under ANSI format' },
          description: {
            es: 'Descifra el PIN block con la clave entrante y lo vuelve a cifrar con la clave saliente.',
            en: 'Decrypts incoming PIN block with incoming PEK and re-encrypts with outgoing PEK.'
          },
          category: { es: 'Traducción y Procesamiento de PIN', en: 'PIN Translation & Processing' },
          fields: [
            {
              id: 'pin-format',
              name: { es: 'Formato de PIN', en: 'PIN Format' },
              description: { es: 'Subcódigo 1 para formato ANSI X9.8 / ISO 9564 Formato 0.', en: 'Subcode 1 for ANSI X9.8 / ISO 9564 Format 0.' },
              position: 0,
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'source-pek',
              name: { es: 'Clave PEK Entrante', en: 'Incoming PEK' },
              description: { es: 'Criptograma de clave PEK de origen.', en: 'Source PEK cryptogram.' },
              position: 1,
              length: { kind: 'range', min: 4, max: 128 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'dest-pek',
              name: { es: 'Clave PEK Saliente', en: 'Outgoing PEK' },
              description: { es: 'Criptograma de clave PEK de destino.', en: 'Destination PEK cryptogram.' },
              position: 2,
              length: { kind: 'range', min: 4, max: 128 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'incoming-pin-block',
              name: { es: 'PIN Block Entrante', en: 'Incoming PIN Block' },
              description: { es: 'PIN block de 16 caracteres hexadecimales cifrado bajo PEK origen.', en: '16 hex characters PIN block encrypted under source PEK.' },
              position: 3,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'account-number',
              name: { es: 'Número de Cuenta (PAN)', en: 'Primary Account Number (PAN)' },
              description: { es: '12 dígitos de la cuenta para des-enmascarar el PIN.', en: '12 account digits used for PIN de-masking.' },
              position: 4,
              length: { kind: 'fixed', length: 12 },
              encoding: 'decimal',
              required: true
            }
          ],
          source: 'Atalla AT1000 Host Command Reference Manual v8.50, Section 6.1, Command 31 Sub 1'
        },
        {
          id: 'atalla-31-sub7-req',
          code: '31',
          subCode: '7',
          subCodeFieldIndex: 0,
          direction: 'request',
          pairedCode: '41',
          name: { es: 'Traducir PIN DUKPT a PEK Fija (Sub 7)', en: 'Translate PIN DUKPT to Fixed PEK (Sub 7)' },
          summary: { es: 'Traduce un PIN derivado mediante DUKPT a una clave fija', en: 'Translates a DUKPT-derived PIN block to a fixed PEK' },
          description: {
            es: 'Deriva la clave de sesión utilizando el KSN y traduce el PIN block a la clave de destino.',
            en: 'Derives session key using the terminal KSN and translates PIN block to destination PEK.'
          },
          category: { es: 'Traducción y Procesamiento de PIN', en: 'PIN Translation & Processing' },
          fields: [
            {
              id: 'pin-format',
              name: { es: 'Formato de PIN', en: 'PIN Format' },
              description: { es: 'Subcódigo 7 para DUKPT.', en: 'Subcode 7 for DUKPT.' },
              position: 0,
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'bdk-key',
              name: { es: 'Clave BDK / IPEK', en: 'BDK / IPEK Key' },
              description: { es: 'Clave base de derivación.', en: 'Base derivation key.' },
              position: 1,
              length: { kind: 'range', min: 4, max: 128 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'dest-pek',
              name: { es: 'Clave PEK Saliente', en: 'Outgoing PEK' },
              description: { es: 'Clave destino para el PIN block traducido.', en: 'Destination key for translated PIN block.' },
              position: 2,
              length: { kind: 'range', min: 4, max: 128 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'incoming-pin-block',
              name: { es: 'PIN Block Entrante', en: 'Incoming PIN Block' },
              description: { es: 'PIN block cifrado bajo DUKPT.', en: 'Incoming DUKPT encrypted PIN block.' },
              position: 3,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'account-number',
              name: { es: 'Número de Cuenta (PAN)', en: 'Primary Account Number (PAN)' },
              description: { es: '12 dígitos del PAN.', en: '12 digits of PAN.' },
              position: 4,
              length: { kind: 'fixed', length: 12 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'ksn',
              name: { es: 'Número de Serie de Clave (KSN)', en: 'Key Serial Number (KSN)' },
              description: { es: 'Identificador del contador DUKPT del terminal.', en: 'Terminal DUKPT transaction counter.' },
              position: 5,
              length: { kind: 'range', min: 16, max: 20 },
              encoding: 'hex-ascii',
              required: true
            },
            {
              id: 'dukpt-type',
              name: { es: 'Tipo de Algoritmo DUKPT', en: 'DUKPT Algorithm Type' },
              description: { es: '1=DES/2TDES DUKPT.', en: '1=DES/2TDES DUKPT.' },
              position: 6,
              length: { kind: 'fixed', length: 1 },
              encoding: 'decimal',
              required: true
            }
          ],
          source: 'Atalla AT1000 Host Command Reference Manual v8.50, Section 6.1, Command 31 Sub 7'
        },
        {
          id: 'atalla-41-pin-res',
          code: '41',
          direction: 'response',
          pairedCode: '31',
          name: { es: 'Respuesta de Traducción de PIN', en: 'PIN Translation Response' },
          summary: { es: 'Devuelve el PIN block traducido y la bandera de verificación', en: 'Returns translated PIN block and sanity check indicator' },
          description: {
            es: 'Retorna el PIN block cifrado bajo la clave PEK de destino.',
            en: 'Returns the PIN block encrypted under the destination PEK.'
          },
          category: { es: 'Traducción y Procesamiento de PIN', en: 'PIN Translation & Processing' },
          fields: [
            {
              id: 'translated-pin-block',
              name: { es: 'PIN Block Traducido', en: 'Translated PIN Block' },
              description: { es: '16 caracteres hexadecimales con el PIN cifrado.', en: '16 hex characters of translated PIN block.' },
              position: 0,
              length: { kind: 'fixed', length: 16 },
              encoding: 'hex-ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'sanity-check',
              name: { es: 'Indicador de Verificación', en: 'Sanity Check Indicator' },
              description: { es: 'Y si el PIN block superó la prueba de cordura.', en: 'Y if PIN block passed sanity validation.' },
              position: 1,
              length: { kind: 'fixed', length: 1 },
              encoding: 'alphanumeric',
              required: true
            }
          ],
          source: 'Atalla AT1000 Host Command Reference Manual v8.50, Section 6.1, Command 41'
        }
      ],
      errorCodes: {
        '00': {
          code: '00',
          title: { es: 'Comando Ejecutado con Éxito', en: 'Command Successful' },
          description: { es: 'La operación solicitada finalizó sin errores.', en: 'The requested cryptographic operation completed successfully.' },
          troubleshooting: { es: 'No se requiere acción correctiva.', en: 'No troubleshooting required.' }
        },
        '01': {
          code: '01',
          title: { es: 'Error de Paridad en Clave', en: 'Key Parity Error' },
          description: { es: 'Una de las claves suministradas tiene paridad incorrecta.', en: 'One of the supplied cryptographic keys has invalid parity.' },
          troubleshooting: { es: 'Verifique la clave maestra y vuelva a importar el componente con paridad impar.', en: 'Verify master key component and re-import with odd parity.' }
        },
        '02': {
          code: '02',
          title: { es: 'Carácter o Longitud Inválida', en: 'Invalid Character or Bad Length' },
          description: { es: 'Uno de los campos contiene caracteres no válidos o longitud fuera de rango.', en: 'One of the parameters contains invalid characters or bad length.' },
          troubleshooting: { es: 'Revise el campo indicado en la posición FF de la palabra de estado EEFFVV.', en: 'Inspect the field position indicated by FF in the EEFFVV status word.' }
        },
        '03': {
          code: '03',
          title: { es: 'Error de Verificación de PIN', en: 'PIN Verification Failure' },
          description: { es: 'El PIN block no coincide con el valor esperado.', en: 'Supplied PIN block does not match expected value.' }
        },
        '04': {
          code: '04',
          title: { es: 'Error de Criptograma AKB', en: 'AKB Cryptogram Error' },
          description: { es: 'El bloque AKB no pudo ser descifrado o su encabezado es inválido.', en: 'AKB block could not be decrypted or header is invalid.' }
        },
        '05': {
          code: '05',
          title: { es: 'Comando o Subcomando Desconocido', en: 'Unknown Command or Subcommand' },
          description: { es: 'El código de comando o subcódigo no es soportado por el firmware.', en: 'Command code or subcode is unsupported in current firmware mode.' }
        },
        '10': {
          code: '10',
          title: { es: 'Desbordamiento de Memoria / Cola', en: 'Buffer / Queue Overflow' },
          description: { es: 'El buffer de comandos del HSM está saturado.', en: 'HSM command queue buffer has overflowed.' }
        },
        '15': {
          code: '15',
          title: { es: 'Fallo de Verificación de MAC', en: 'MAC Verification Failure' },
          description: { es: 'El código de autenticación de mensaje MAC no coincide.', en: 'Calculated MAC does not match supplied MAC.' }
        },
        '20': {
          code: '20',
          title: { es: 'Batería o Estado de Alarma Activa', en: 'Battery or Tamper Alarm Active' },
          description: { es: 'Alarma de seguridad o batería baja en el HSM.', en: 'Hardware tamper alarm or low battery condition.' }
        },
        '99': {
          code: '99',
          title: { es: 'Error Interno del HSM', en: 'Internal HSM Error' },
          description: { es: 'Fallo no recuperable en el módulo criptográfico.', en: 'Unrecoverable cryptographic coprocessor failure.' }
        }
      }
    },
    '8.60': {
      version: '8.60',
      label: {
        es: 'Firmware v8.60 (Actual)',
        en: 'Firmware v8.60 (Current)'
      },
      releaseNotes: {
        es: 'Extiende v8.50 con soporte adicional para algoritmos AES en bloques AKB y nuevos subcomandos de PIN ISO-4.',
        en: 'Extends v8.50 with AES support in AKB blocks and new ISO-4 PIN subcommands.'
      },
      extends: '8.50',
      commands: [],
      errorCodes: {
        '21': {
          code: '21',
          title: { es: 'Formato de Bloque AKB Inválido', en: 'Invalid AKB Block Format' },
          description: { es: 'El bloque AKB versión 8.60 no contiene los parámetros requeridos.', en: 'AKB block does not contain required v8.60 parameters.' }
        }
      }
    }
  }
};
