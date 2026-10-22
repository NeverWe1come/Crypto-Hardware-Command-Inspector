/**
 * @packageDocumentation
 * Device specification for Futurex Excrypt Payment HSM (Firmware v7.6.1).
 */

import type { DeviceSpec } from '@chci/parser-core';
import { futurexExcryptCommands } from './futurex-excrypt-commands';
import { futurexExcryptDocs } from './futurex-excrypt-docs';

/**
 * Futurex Excrypt hardware specification.
 */
export const futurexExcryptSpec: DeviceSpec = {
  id: 'futurex-excrypt',
  name: 'Futurex Excrypt',
  vendor: 'Futurex',
  category: 'HSM_FINANCIAL',
  status: 'supported',
  summary: {
    es: 'Módulo de seguridad de hardware financiero Futurex Excrypt con arquitectura de tramas delimitadas etiqueta-valor [TAGVAL;] y cifrado de claves financieras.',
    en: 'Futurex Excrypt Financial Hardware Security Module with tag-value [TAGVAL;] delimited framing architecture and financial key cryptography.'
  },
  defaultVersion: '7.6.1',
  defaultInterface: 'excrypt-tag',
  exampleCommand: '[A:ECHO]',
  interfaces: [
    {
      id: 'excrypt-tag',
      name: { es: 'Protocolo Etiqueta-Valor Excrypt', en: 'Excrypt Tag-Value Protocol' },
      shortLabel: 'Excrypt',
      kind: 'proprietary',
      wireFormat: 'ascii-frame',
      description: {
        es: 'Protocolo delimitado por corchetes y punto y coma [AO...;TAGval;]',
        en: 'Bracket and semicolon delimited protocol [AO...;TAGval;]'
      },
      framing: {
        type: 'tag-value',
        startDelimiter: '[',
        endDelimiter: ']',
        pairDelimiter: ';',
        commandTag: 'AO',
        tagLength: 2,
        errorCommandCode: 'ERRO',
        errorCodeTag: 'AM',
        offendingTagTag: 'AN',
        errorMessageTag: 'BB'
      },
      exampleCommand: '[A:ECHO]'
    }
  ],
  documentationSections: futurexExcryptDocs,
  framing: {
    type: 'tag-value',
    startDelimiter: '[',
    endDelimiter: ']',
    pairDelimiter: ';',
    commandTag: 'AO',
    tagLength: 2,
    errorCommandCode: 'ERRO',
    errorCodeTag: 'AM',
    offendingTagTag: 'AN',
    errorMessageTag: 'BB'
  },
  versions: {
    '7.6.1': {
      version: '7.6.1',
      label: {
        es: 'Firmware v7.6.1 (Actual)',
        en: 'Firmware v7.6.1 (Current)'
      },
      releaseNotes: {
        es: 'Soporte completo para comandos de eco, estadísticas de hardware, generación de claves PEK y códigos de error dedicados ERRO.',
        en: 'Full support for echo, hardware statistics, PEK key generation, and dedicated ERRO error frames.'
      },
      commands: [
        {
          id: 'futurex-echo-req',
          code: 'ECHO',
          direction: 'request',
          pairedCode: 'ECHO',
          name: { es: 'Prueba de Conectividad (Petición)', en: 'Echo Test Message (Request)' },
          summary: { es: 'Envía un token de eco al HSM', en: 'Sends an echo token to the HSM' },
          description: {
            es: 'Verifica la disponibilidad del HSM Futurex y la integridad del canal enviando un token de contexto en la etiqueta AG.',
            en: 'Verifies Futurex HSM availability and channel communication by sending a context token in tag AG.'
          },
          category: { es: 'Diagnóstico y Comunicaciones', en: 'Diagnostics & Communications' },
          fields: [
            {
              id: 'echo-token',
              tag: 'AG',
              name: { es: 'Token de Contexto / Eco', en: 'Context / Echo Token' },
              description: { es: 'Cadena arbitraria devuelta intacta por el HSM para correlación de tramas.', en: 'Arbitrary string echoed intact by the HSM for correlation.' },
              length: { kind: 'range', min: 0, max: 256 },
              encoding: 'ascii',
              required: false
            }
          ],
          source: 'Futurex Excrypt Host Command Reference Manual v7.6.1, Section 2.1, ECHO Command'
        },
        {
          id: 'futurex-echo-res',
          code: 'ECHO',
          direction: 'response',
          pairedCode: 'ECHO',
          name: { es: 'Prueba de Conectividad (Respuesta)', en: 'Echo Test Message (Response)' },
          summary: { es: 'Respuesta de eco con token correlacionado y mensaje de estado', en: 'Echo response returning correlated token and status message' },
          description: {
            es: 'Devuelve el token AG original y el mensaje de estado del firmware en la etiqueta BB.',
            en: 'Returns original AG token and firmware operational status in tag BB.'
          },
          category: { es: 'Diagnóstico y Comunicaciones', en: 'Diagnostics & Communications' },
          fields: [
            {
              id: 'echo-token',
              tag: 'AG',
              name: { es: 'Token de Contexto Correlacionado', en: 'Correlated Echo Token' },
              description: { es: 'Token devuelto idéntico al de la petición.', en: 'Token returned matching request payload.' },
              length: { kind: 'range', min: 0, max: 256 },
              encoding: 'ascii',
              required: false
            },
            {
              id: 'status-msg',
              tag: 'BB',
              name: { es: 'Mensaje de Estado / Firmware', en: 'Status / Firmware Message' },
              description: { es: 'Código o mensaje de estado del firmware (ej. 4000).', en: 'Firmware status code or message (e.g. 4000).' },
              length: { kind: 'range', min: 0, max: 256 },
              encoding: 'ascii',
              required: false
            }
          ],
          source: 'Futurex Excrypt Host Command Reference Manual v7.6.1, Section 2.1, ECHO Response'
        },
        {
          id: 'futurex-stat-req',
          code: 'STAT',
          direction: 'request',
          pairedCode: 'STAT',
          name: { es: 'Consultar Estadísticas (Petición)', en: 'Extract Statistics (Request)' },
          summary: { es: 'Solicita métricas internas y contadores de transacciones', en: 'Requests internal metrics and transaction counters' },
          description: {
            es: 'Permite consultar contadores operativos enviando banderas booleanas como etiquetas vacías (ej. ZA, ZB).',
            en: 'Extracts performance and operational metrics using empty flag tags (e.g. ZA, ZB).'
          },
          category: { es: 'Diagnóstico y Rendimiento', en: 'Diagnostics & Performance' },
          fields: [
            {
              id: 'flag-za',
              tag: 'ZA',
              name: { es: 'Bandera de Estadísticas Generales (ZA)', en: 'General Statistics Flag (ZA)' },
              description: { es: 'Etiqueta booleana para solicitar contadores generales de operaciones.', en: 'Boolean flag tag requesting general operation counters.' },
              length: { kind: 'range', min: 0, max: 256 },
              encoding: 'ascii',
              required: false
            },
            {
              id: 'flag-zb',
              tag: 'ZB',
              name: { es: 'Bandera de Estadísticas Criptográficas (ZB)', en: 'Crypto Statistics Flag (ZB)' },
              description: { es: 'Etiqueta booleana para solicitar estadísticas del coprocesador criptográfico.', en: 'Boolean flag tag requesting cryptographic coprocessor stats.' },
              length: { kind: 'range', min: 0, max: 256 },
              encoding: 'ascii',
              required: false
            }
          ],
          source: 'Futurex Excrypt Host Command Reference Manual v7.6.1, Section 2.4, STAT Command'
        },
        {
          id: 'futurex-stat-res',
          code: 'STAT',
          direction: 'response',
          pairedCode: 'STAT',
          name: { es: 'Consultar Estadísticas (Respuesta)', en: 'Extract Statistics (Response)' },
          summary: { es: 'Devuelve métricas operativas y estadísticas del HSM', en: 'Returns operational metrics and HSM performance statistics' },
          description: {
            es: 'Respuesta con las estadísticas solicitadas en el campo de datos BB.',
            en: 'Response containing requested statistical counters in tag BB.'
          },
          category: { es: 'Diagnóstico y Rendimiento', en: 'Diagnostics & Performance' },
          fields: [
            {
              id: 'stats-payload',
              tag: 'BB',
              name: { es: 'Datos de Estadísticas', en: 'Statistics Payload' },
              description: { es: 'Contadores y métricas en formato texto delimitado.', en: 'Counters and metrics in delimited string format.' },
              length: { kind: 'range', min: 0, max: 1024 },
              encoding: 'ascii',
              required: false
            },
            {
              id: 'echo-token',
              tag: 'AG',
              name: { es: 'Token de Contexto', en: 'Context Token' },
              description: { es: 'Token devuelto idéntico al de la petición si fue provisto.', en: 'Echo token if provided in request.' },
              length: { kind: 'range', min: 0, max: 256 },
              encoding: 'ascii',
              required: false
            }
          ],
          source: 'Futurex Excrypt Host Command Reference Manual v7.6.1, Section 2.4, STAT Response'
        },
        {
          id: 'futurex-gpek-req',
          code: 'GPEK',
          direction: 'request',
          pairedCode: 'GPEK',
          name: { es: 'Generar Clave de Cifrado de PIN (Petición)', en: 'Generate PIN Encryption Key (Request)' },
          summary: { es: 'Solicita la generación de una clave PEK para cajeros o TPVs', en: 'Requests generation of a PEK for ATMs or POS terminals' },
          description: {
            es: 'Genera una clave de cifrado de PIN (PEK) bajo la clave maestra de terminales o ZMK especificada.',
            en: 'Generates a PIN Encryption Key (PEK) under the specified terminal master key or ZMK.'
          },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'modifier-fs',
              tag: 'FS',
              name: { es: 'Modificador de Función (FS)', en: 'Function Select Modifier (FS)' },
              description: { es: '1: Generar clave aleatoria; 2: Derivar clave desde vector.', en: '1: Generate random key; 2: Derive key from vector.' },
              length: { kind: 'range', min: 1, max: 10 },
              encoding: 'alphanumeric',
              required: false
            },
            {
              id: 'echo-token',
              tag: 'AG',
              name: { es: 'Token de Contexto', en: 'Context Token' },
              description: { es: 'Identificador de transacción para correlación.', en: 'Transaction identifier for request correlation.' },
              length: { kind: 'range', min: 0, max: 256 },
              encoding: 'ascii',
              required: false
            }
          ],
          source: 'Futurex Excrypt Host Command Reference Manual v7.6.1, Section 3.2, GPEK Command'
        },
        {
          id: 'futurex-gpek-res',
          code: 'GPEK',
          direction: 'response',
          pairedCode: 'GPEK',
          name: { es: 'Generar Clave de Cifrado de PIN (Respuesta)', en: 'Generate PIN Encryption Key (Response)' },
          summary: { es: 'Devuelve la clave PEK generada y su valor KCV', en: 'Returns the generated PEK key cryptogram and its KCV' },
          description: {
            es: 'Retorna el criptograma de la clave PEK en la etiqueta GP (enmascarado como sensible) y su KCV en AE.',
            en: 'Returns generated PEK cryptogram in tag GP (masked as sensitive) and its KCV in tag AE.'
          },
          category: { es: 'Gestión de Claves', en: 'Key Management' },
          fields: [
            {
              id: 'key-cryptogram',
              tag: 'GP',
              name: { es: 'Criptograma de Clave PEK', en: 'PEK Key Cryptogram' },
              description: { es: 'Clave cifrada devuelta por el HSM.', en: 'Encrypted key payload returned by HSM.' },
              length: { kind: 'range', min: 16, max: 96 },
              encoding: 'hex-ascii',
              required: false,
              sensitive: true
            },
            {
              id: 'kcv',
              tag: 'AE',
              name: { es: 'Valor de Verificación de Clave (KCV)', en: 'Key Check Value (KCV)' },
              description: { es: 'Checksum de verificación de clave en hexadecimal.', en: 'Key checksum in hexadecimal.' },
              length: { kind: 'range', min: 4, max: 16 },
              encoding: 'hex-ascii',
              required: false,
              sensitive: false
            },
            {
              id: 'echo-token',
              tag: 'AG',
              name: { es: 'Token de Contexto Correlacionado', en: 'Correlated Context Token' },
              description: { es: 'Token original de la petición.', en: 'Original request echo token.' },
              length: { kind: 'range', min: 0, max: 256 },
              encoding: 'ascii',
              required: false
            }
          ],
          source: 'Futurex Excrypt Host Command Reference Manual v7.6.1, Section 3.2, GPEK Response'
        },
        {
          id: 'futurex-erro-res',
          code: 'ERRO',
          direction: 'response',
          pairedCode: 'ERRO',
          name: { es: 'Trama de Error General (Respuesta)', en: 'General Error Frame (Response)' },
          summary: { es: 'Trama de error devuelta por el HSM cuando falla un comando', en: 'Error frame returned by HSM upon command failure' },
          description: {
            es: 'El HSM Futurex responde con el código ERRO conteniendo el código de error en AM, la etiqueta causante en AN y el mensaje textual en BB.',
            en: 'Futurex HSM returns ERRO command containing error code in AM, offending tag in AN, and descriptive text in BB.'
          },
          category: { es: 'Diagnóstico y Comunicaciones', en: 'Diagnostics & Communications' },
          fields: [
            {
              id: 'error-code',
              tag: 'AM',
              name: { es: 'Código de Error Numérico', en: 'Numeric Error Code' },
              description: { es: 'Código de 2 dígitos que identifica el error producido.', en: '2-digit numeric code identifying the failure cause.' },
              length: { kind: 'fixed', length: 2 },
              encoding: 'decimal',
              required: true
            },
            {
              id: 'offending-tag',
              tag: 'AN',
              name: { es: 'Etiqueta Ofensora', en: 'Offending Tag' },
              description: { es: 'Nombre de la etiqueta de 2 caracteres que provocó el error.', en: '2-character tag name that triggered the error.' },
              length: { kind: 'fixed', length: 2 },
              encoding: 'alphanumeric',
              required: false
            },
            {
              id: 'error-message',
              tag: 'BB',
              name: { es: 'Mensaje Descriptivo del Error', en: 'Descriptive Error Message' },
              description: { es: 'Texto en claro con la descripción del error emitida por el firmware.', en: 'Plaintext description of error emitted by firmware.' },
              length: { kind: 'range', min: 0, max: 256 },
              encoding: 'ascii',
              required: false
            }
          ],
          source: 'Futurex Excrypt Host Command Reference Manual v7.6.1, Section 1.5, Error Handling'
        },
        ...futurexExcryptCommands.filter(
          (c) => !['ECHO', 'ESTA', 'MKEY', 'ERRO'].includes(c.code)
        )
      ],
      errorCodes: {
        '00': {
          code: '00',
          title: { es: 'Comando Exitoso', en: 'Command Successful' },
          description: { es: 'La operación finalizó correctamente.', en: 'The operation completed successfully.' },
          troubleshooting: { es: 'No se requiere acción correctiva.', en: 'No troubleshooting required.' }
        },
        '01': {
          code: '01',
          title: { es: 'Error de Paridad en Clave', en: 'Key Parity Error' },
          description: { es: 'La clave proporcionada contiene paridad inválida.', en: 'Supplied key fails odd parity check.' },
          troubleshooting: { es: 'Compruebe los bytes de la clave y reajuste los bits de paridad.', en: 'Verify key bytes and adjust parity bits.' }
        },
        '02': {
          code: '02',
          title: { es: 'Etiqueta Inválida o Formato Incorrecto', en: 'Invalid Tag or Data Format' },
          description: { es: 'Una de las etiquetas no existe o los datos asociados no corresponden con su especificación.', en: 'Tag is not recognized or data format does not match specification.' },
          troubleshooting: { es: 'Inspeccione la etiqueta identificada en la etiqueta AN de la respuesta.', en: 'Inspect the tag identified in response tag AN.' }
        },
        '03': {
          code: '03',
          title: { es: 'Parámetro Requerido Faltante', en: 'Missing Required Parameter' },
          description: { es: 'Falta una etiqueta obligatoria para ejecutar el comando.', en: 'A required tag was omitted from the command frame.' }
        },
        '04': {
          code: '04',
          title: { es: 'Clave no Encontrada o Inactiva', en: 'Key Not Found or Inactive' },
          description: { es: 'El índice o identificador de clave especificado no está presente o no está habilitado.', en: 'Specified key index or identifier is not present or enabled.' }
        },
        '05': {
          code: '05',
          title: { es: 'Fallo en Operación Criptográfica', en: 'Cryptographic Operation Failure' },
          description: { es: 'El coprocesador criptográfico no pudo completar la operación solicitada.', en: 'Cryptographic engine could not complete the operation.' }
        },
        '10': {
          code: '10',
          title: { es: 'Acceso no Autorizado', en: 'Unauthorized Access' },
          description: { es: 'El host no cuenta con los privilegios o rol requeridos para invocar este comando.', en: 'Host lacks the required permission or role to execute command.' }
        },
        '11': {
          code: '11',
          title: { es: 'Fallo Hardware del HSM', en: 'HSM Hardware Failure' },
          description: { es: 'Error en módulo de seguridad físico o memoria NVRAM.', en: 'Fault in physical security module or NVRAM.' }
        },
        '12': {
          code: '12',
          title: { es: 'Longitud de Clave Inválida', en: 'Invalid Key Length' },
          description: { es: 'La longitud de la clave no es congruente con el algoritmo seleccionado.', en: 'Key length is inconsistent with selected algorithm.' }
        },
        '14': {
          code: '14',
          title: { es: 'Fallo de Checksum', en: 'Checksum Mismatch' },
          description: { es: 'El valor de verificación de bloque o trama no coincide con el calculado.', en: 'Block or frame checksum does not match calculated value.' }
        },
        '15': {
          code: '15',
          title: { es: 'Fallo de Verificación de MAC o PIN', en: 'MAC or PIN Verification Failure' },
          description: { es: 'El MAC calculado o el PIN comparado no concuerda.', en: 'Calculated MAC or verified PIN does not match.' }
        },
        '19': {
          code: '19',
          title: { es: 'Desbordamiento de Buffer de Transacción', en: 'Transaction Buffer Overflow' },
          description: { es: 'La trama enviada supera el límite máximo permitido por el buffer del puerto.', en: 'Command frame exceeds maximum buffer capacity.' }
        },
        '20': {
          code: '20',
          title: { es: 'Función no Permitida por Política', en: 'Function Prohibited by Security Policy' },
          description: { es: 'La política de seguridad de la partición actual prohíbe esta operación.', en: 'Security policy configuration forbids this operation.' }
        },
        '90': {
          code: '90',
          title: { es: 'Tiempo de Espera Agotado (Timeout)', en: 'Communication Timeout' },
          description: { es: 'Tiempo de respuesta expirado durante la ejecución.', en: 'Communication timeout expired during command execution.' }
        },
        '99': {
          code: '99',
          title: { es: 'Error Interno del Sistema', en: 'Internal System Error' },
          description: { es: 'Fallo imprevisto en el microcódigo del sistema operativo Excrypt.', en: 'Unexpected exception in Excrypt operating system firmware.' }
        }
      }
    }
  }
};
