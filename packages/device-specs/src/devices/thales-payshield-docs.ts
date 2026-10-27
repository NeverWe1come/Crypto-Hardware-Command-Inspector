/**
 * @packageDocumentation
 * Official documentation sections for Thales payShield 10K.
 */

import type { HardwareDocSectionSpec } from '@chci/parser-core';

export const thalesPayshieldDocs: readonly HardwareDocSectionSpec[] = [
  {
    "id": "thales-ch01-host-interface",
    "title": {
      "es": "Capítulo 1: Interfaz de Host y Estructura de Tramas Posicionales",
      "en": "Chapter 1: Host Interface & Positional Framing Architecture"
    },
    "category": "chapter",
    "markdown": {
      "es": "# Capítulo 1: Interfaz de Host y Estructura de Tramas Posicionales\n\n## 1. Protocolo de Comunicación con el payShield 10K\n\nEl módulo HSM Thales payShield 10K opera a través de conexiones de red TCP/IP utilizando un protocolo de tramas posicionales estructurado por longitud de cabecera.\n\n### 1.1 Estructura General de una Trama de Solicitud (Request)\n\n```\n[Header (m bytes)][Command Code (2 bytes)][Data Fields (posicionales)][Trailer opcional]\n```\n\n- **Message Header (`m` bytes, por defecto 4 bytes):** Cadena ASCII arbitraria enviada por la aplicación host para correlacionar la petición con su respuesta. El HSM devuelve exactamente la misma cabecera sin modificar.\n- **Command Code (2 caracteres ASCII):** Código del comando que identifica la función a ejecutar (e.g., `A0`, `CA`, `NC`).\n- **Data Fields:** Parámetros fijos o variables según la especificación del comando.\n- **End Message Delimiter (`0x19` / `EM`):** Carácter delimitador obligatorio si se incluye un trailer opcional al final del mensaje.\n- **LMK Identifier (`%` + 2 dígitos):** Delimitador opcional para seleccionar un conjunto LMK secundario.\n\n### 1.2 Estructura General de una Trama de Respuesta (Response)\n\n```\n[Header (m bytes)][Response Code (2 bytes)][Error Code (2 bytes)][Data Fields]\n```\n\n- **Header (`m` bytes):** Exactamente la misma cabecera enviada en la solicitud.\n- **Response Code (2 caracteres):** Código de respuesta correspondiente (e.g., `A1` para `A0`, `CB` para `CA`, `ND` para `NC`).\n- **Error Code (2 caracteres numéricos):**\n  - `'00'`: Ejecución exitosa (No error).\n  - Cualquier otro código (e.g. `'01'`, `'15'`, `'68'`): Código de diagnóstico de error.\n",
      "en": "# Chapter 1: Host Interface & Positional Framing Architecture\n\n## 1. Communication Protocol with payShield 10K\n\nThe Thales payShield 10K HSM communicates over TCP/IP connections using a positional framing protocol structured around a configurable header length.\n\n### 1.1 General Request Frame Layout\n\n```\n[Header (m bytes)][Command Code (2 bytes)][Data Fields (positional)][Optional Trailer]\n```\n\n- **Message Header (`m` bytes, default 4 bytes):** Arbitrary ASCII string sent by the host application for request/response correlation. The HSM returns this header unchanged.\n- **Command Code (2 ASCII characters):** Command code identifying the function (e.g., `A0`, `CA`, `NC`).\n- **Data Fields:** Positional parameters per command specification.\n- **End Message Delimiter (`0x19` / `EM`):** Required delimiter when an optional trailer is present.\n- **LMK Identifier (`%` + 2 digits):** Optional delimiter to select a secondary LMK keyset.\n"
    }
  },
  {
    "id": "thales-ch02-key-types",
    "title": {
      "es": "Capítulo 2: Esquemas de Claves LMK y TR-31",
      "en": "Chapter 2: LMK Key Schemes & TR-31 Key Blocks"
    },
    "category": "chapter",
    "markdown": {
      "es": "# Capítulo 2: Esquemas de Claves LMK y TR-31\n\n## 1. Esquemas de Clave Soportados por el LMK\n\nEn el payShield 10K, las claves simétricas pueden residir cifradas bajo el Local Master Key (LMK) en diversos esquemas:\n\n| Esquema | Prefijo | Longitud Clave | Algoritmo | Descripción |\n| :---: | :---: | :---: | :---: | :--- |\n| **Simple** | Ninguno | 16 hex (8 bytes) | DES | Clave DES de longitud simple cifrada bajo LMK. |\n| **Doble (U)** | `'U'` | 32 hex (16 bytes) | 2TDEA | Clave Triple DES de doble longitud. |\n| **Triple (T)** | `'T'` | 48 hex (24 bytes) | 3TDEA | Clave Triple DES de triple longitud. |\n| **Key Block (S)** | `'S'` | Variable | TR-31 / X9.143 | Bloque de clave seguro con encabezado de 16 caracteres. |\n\n## 2. Encabezado de Bloque de Clave TR-31 (X9.143)\n\nEl encabezado de 16 bytes contiene:\n1. **Versión (`A`, `'B'`, `'C'`, `'D'`):** Versión del estándar de cifrado de bloque (D para AES-CMAC).\n2. **Longitud (4 dígitos decimales):** Longitud total del bloque.\n3. **Uso de Clave (`2` caracteres):** `P0` (PIN), `B0` (BDK), `K0` (KEK), `M0` (MAC).\n4. **Algoritmo (`1` carácter):** `T` (Triple DES), `A` (AES).\n5. **Modo de Uso (`1` carácter):** `E` (Encrypt), `D` (Decrypt), `B` (Both).\n6. **Versión de Clave (`2` dígitos):** `00` a `99`.\n7. **Exportabilidad (`1` carácter):** `E` (Exportable), `N` (No exportable), `S` (Sensible).\n",
      "en": "# Chapter 2: LMK Key Schemes & TR-31 Key Blocks\n\n## 1. LMK Key Schemes\n\nIn the payShield 10K, symmetric keys are encrypted under the Local Master Key (LMK):\n\n| Scheme | Prefix | Key Length | Algorithm | Description |\n| :---: | :---: | :---: | :---: | :--- |\n| **Single** | None | 16 hex | Single DES | Single-length DES key under LMK. |\n| **Double (U)** | `'U'` | 32 hex | 2TDEA | Double-length Triple DES key. |\n| **Triple (T)** | `'T'` | 48 hex | 3TDEA | Triple-length Triple DES key. |\n| **Key Block (S)** | `'S'` | Variable | TR-31 / X9.143 | Secure key block with 16-character header. |\n"
    }
  },
  {
    "id": "thales-ch03-error-codes",
    "title": {
      "es": "Capítulo 3: Códigos de Error y Diagnóstico",
      "en": "Chapter 3: Error Codes & Diagnostics Reference"
    },
    "category": "chapter",
    "markdown": {
      "es": "# Capítulo 3: Códigos de Error y Diagnóstico del payShield 10K\n\n| Código | Título | Diagnóstico y Acción Correctiva |\n| :---: | :--- | :--- |\n| **00** | Sin error | Operación ejecutada exitosamente. |\n| **01** | Clave no autorizada | Clave no habilitada o nivel de autorización insuficiente en el HSM. |\n| **10** | Paridad inválida | La clave proporcionada no posee paridad impar válida. |\n| **15** | Parámetro inválido | Longitud de campo o carácter inválido en la trama posicional. |\n| **20** | Fallo de verificación | PIN, MAC o firma no concuerdan con el valor esperado. |\n| **68** | Comando deshabilitado | El comando está deshabilitado por licencia o configuración de seguridad. |\n| **99** | Error interno | Excepción en el procesador criptográfico del HSM. |\n",
      "en": "# Chapter 3: Error Codes & Diagnostics Reference\n\n| Code | Title | Diagnostics & Corrective Action |\n| :---: | :--- | :--- |\n| **00** | No error | Command executed successfully. |\n| **01** | Unauthorized key | Key not enabled or insufficient HSM authorization level. |\n| **10** | Parity error | Supplied key does not have valid odd parity. |\n| **15** | Invalid parameter | Invalid field length or character in positional frame. |\n| **20** | Verification failure | PIN, MAC, or digital signature does not match expected value. |\n| **68** | Command disabled | Function disabled by license or security policy configuration. |\n| **99** | Internal error | Cryptographic hardware engine error. |\n"
    }
  }
];
