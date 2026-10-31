/**
 * @packageDocumentation
 * Official Thales payShield 10K Error Code Specifications (Chapter 12).
 * Covers standard error codes returned by payShield 10K, payShield 9000, and HSM 8000.
 */

import type { ErrorCodeSpec } from '@chci/parser-core';

export const THALES_PAYSHIELD_V23_ERRORS: Readonly<Record<string, ErrorCodeSpec>> = {
  "00": {
    code: "00",
    title: { es: "Sin error", en: "No error" },
    description: { es: "El comando solicitado se ejecutó con éxito.", en: "The requested command executed successfully." },
    troubleshooting: { es: "No se requiere acción.", en: "No action required." }
  },
  "01": {
    code: "01",
    title: { es: "Fallo de verificación / Aviso de paridad", en: "Verification failure / Parity warning" },
    description: { es: "Fallo de verificación o aviso de error de paridad en clave importada.", en: "Verification failure or warning of imported key parity error." },
    troubleshooting: { es: "Compruebe el valor de la clave y el criptograma de verificación esperado.", en: "Check the key value and expected verification cryptogram." }
  },
  "02": {
    code: "02",
    title: { es: "Longitud de clave inapropiada para el algoritmo", en: "Key inappropriate length for algorithm" },
    description: { es: "Longitud de clave inadecuada para el algoritmo seleccionado.", en: "Key inappropriate length for algorithm." },
    troubleshooting: { es: "Asegúrese de que la longitud de clave coincide con los requisitos del algoritmo.", en: "Ensure key length matches algorithm requirements (e.g. 16/24 bytes for 3DES, 16/32 for AES)." }
  },
  "04": {
    code: "04",
    title: { es: "Código de tipo de clave inválido", en: "Invalid key type code" },
    description: { es: "Código de tipo de clave no válido o no reconocido.", en: "Invalid key type code." },
    troubleshooting: { es: "Verifique el código de tipo de clave según la tabla de Thales.", en: "Verify key type code against Thales table (e.g. 000 for ZMK, 001 for ZPK)." }
  },
  "05": {
    code: "05",
    title: { es: "Indicador de longitud de clave inválido", en: "Invalid key length flag" },
    description: { es: "Indicador de longitud de clave no válido.", en: "Invalid key length flag." },
    troubleshooting: { es: "Compruebe el flag de longitud de clave (1: simple, 2: doble, 3: triple).", en: "Check the key length flag (1: single, 2: double, 3: triple)." }
  },
  "10": {
    code: "10",
    title: { es: "Error de paridad en clave origen", en: "Source key parity error" },
    description: { es: "Error de paridad impar en la clave origen.", en: "Source key parity error." },
    troubleshooting: { es: "Verifique la paridad impar en todos los bytes de la clave origen.", en: "Verify odd parity on all bytes of the source key." }
  },
  "11": {
    code: "11",
    title: { es: "Error de paridad en clave destino o clave a ceros", en: "Destination key parity error or key all zeros" },
    description: { es: "Error de paridad en clave destino o clave compuesta exclusivamente por ceros.", en: "Destination key parity error or key all zeros." },
    troubleshooting: { es: "Asegúrese de que la clave de destino tenga paridad impar y no sea toda ceros.", en: "Ensure destination key has odd parity and is not all zero bytes." }
  },
  "12": {
    code: "12",
    title: { es: "Contenido de almacenamiento de usuario no disponible", en: "Contents of user storage not available" },
    description: { es: "El contenido del almacenamiento de usuario no está disponible. Reinicie o sobrescriba.", en: "Contents of user storage not available. Reset or overwrite." },
    troubleshooting: { es: "Recargue el almacenamiento de usuario o reinicialice las claves en el HSM.", en: "Reload user storage or re-initialize keys in HSM." }
  },
  "13": {
    code: "13",
    title: { es: "Identificador LMK inválido", en: "Invalid LMK Identifier" },
    description: { es: "El identificador de LMK especificado no es válido.", en: "Invalid LMK Identifier." },
    troubleshooting: { es: "Compruebe el identificador LMK configurado (00-99).", en: "Check configured LMK ID (00-99)." }
  },
  "14": {
    code: "14",
    title: { es: "PIN cifrado bajo par LMK 02-03 inválido", en: "PIN encrypted under LMK pair 02-03 is invalid" },
    description: { es: "El PIN cifrado bajo el par de LMK 02-03 no es válido.", en: "PIN encrypted under LMK pair 02 - 03 is invalid." },
    troubleshooting: { es: "Verifique el cifrado del bloque de PIN y el par LMK utilizado.", en: "Verify PIN block encryption and ensure correct LMK pair is used." }
  },
  "15": {
    code: "15",
    title: { es: "Datos de entrada inválidos", en: "Invalid input data" },
    description: { es: "Datos de entrada inválidos (formato inválido, caracteres no válidos o datos insuficientes).", en: "Invalid input data (invalid format, invalid characters, or not enough data provided)." },
    troubleshooting: { es: "Inspeccione la sintaxis de la trama, la longitud de campos variables y los delimitadores.", en: "Inspect message frame syntax, length of variable fields, and delimiters." }
  },
  "16": {
    code: "16",
    title: { es: "Consola o impresora no lista", en: "Console or printer not ready" },
    description: { es: "La consola o impresora segura no está lista o conectada.", en: "Console or printer not ready or not connected." },
    troubleshooting: { es: "Asegúrese de que la consola o impresora autorizada esté en línea.", en: "Ensure the authorized secure console or printer is online." }
  },
  "17": {
    code: "17",
    title: { es: "HSM no autorizado u operación prohibida", en: "HSM not authorized or prohibited" },
    description: { es: "El HSM no está autorizado o la operación está prohibida por la configuración de seguridad.", en: "HSM not authorized, or operation prohibited by security settings." },
    troubleshooting: { es: "Revise la configuración de seguridad del HSM (ej. estado Autorizado requerido).", en: "Review HSM security settings (e.g. Authorized state required for key generation)." }
  },
  "18": {
    code: "18",
    title: { es: "Definición de formato de documento no cargada", en: "Document format definition not loaded" },
    description: { es: "La definición de formato de documento no está cargada.", en: "Document format definition not loaded." },
    troubleshooting: { es: "Cargue la definición de formato de documento requerida antes de ejecutar el comando.", en: "Load the required document format definition before executing the command." }
  },
  "19": {
    code: "19",
    title: { es: "Tabla Diebold especificada inválida", en: "Specified Diebold Table is invalid" },
    description: { es: "La tabla Diebold especificada no es válida.", en: "Specified Diebold Table is invalid." },
    troubleshooting: { es: "Verifique el índice y la configuración de la tabla Diebold.", en: "Verify Diebold table index and configuration." }
  },
  "20": {
    code: "20",
    title: { es: "PIN block no contiene valores válidos", en: "PIN block does not contain valid values" },
    description: { es: "El bloque de PIN no contiene valores válidos según el formato especificado.", en: "PIN block does not contain valid values." },
    troubleshooting: { es: "Compruebe el formateo del bloque de PIN, nibbles de relleno y codificación hex.", en: "Check PIN block formatting, padding nibbles, and hex encoding." }
  },
  "21": {
    code: "21",
    title: { es: "Valor de índice inválido o desbordamiento", en: "Invalid index value or overflow" },
    description: { es: "Valor de índice inválido o el conteo de bloques causaría desbordamiento.", en: "Invalid index value, or index/block count would cause an overflow condition." },
    troubleshooting: { es: "Verifique los parámetros de índice y los límites de bloques.", en: "Verify index parameters and block limits." }
  },
  "22": {
    code: "22",
    title: { es: "Número de cuenta inválido", en: "Invalid account number" },
    description: { es: "Número de cuenta (PAN) no válido.", en: "Invalid account number (PAN)." },
    troubleshooting: { es: "Asegúrese de que el PAN contenga entre 12 y 19 dígitos decimales válidos.", en: "Ensure PAN contains 12 to 19 valid decimal digits." }
  },
  "23": {
    code: "23",
    title: { es: "Código de formato de PIN block inválido", en: "Invalid PIN block format code" },
    description: { es: "Código de formato de bloque de PIN no válido o prohibido por la política PCI HSM.", en: "Invalid PIN block format code, or prohibited by PCI HSM security settings." },
    troubleshooting: { es: "Verifique los formatos de bloque de PIN permitidos en el perfil PCI HSM actual.", en: "Verify allowed PIN block formats under current PCI HSM profile." }
  },
  "24": {
    code: "24",
    title: { es: "Longitud de PIN fuera de rango", en: "PIN length out of range" },
    description: { es: "La longitud del PIN es inferior a 4 o superior a 12 dígitos.", en: "PIN is fewer than 4 or more than 12 digits in length." },
    troubleshooting: { es: "Proporcione un PIN con longitud entre 4 y 12 dígitos.", en: "Provide a PIN with length between 4 and 12 digits." }
  },
  "25": {
    code: "25",
    title: { es: "Error en tabla de decimalización", en: "Decimalization Table error" },
    description: { es: "Error en la tabla de decimalización.", en: "Decimalization Table error." },
    troubleshooting: { es: "Compruebe que la tabla de decimalización contenga 16 dígitos decimales.", en: "Check that decimalization table contains 16 decimal digits." }
  },
  "26": {
    code: "26",
    title: { es: "Esquema de clave inválido", en: "Invalid key scheme" },
    description: { es: "Esquema de clave no válido (ej. U, T, X, Y, S, R).", en: "Invalid key scheme (e.g. U, T, X, Y, S, R)." },
    troubleshooting: { es: "Compruebe que el esquema de clave coincida con el tipo de clave y capacidad LMK.", en: "Check that key scheme matches key type and LMK capability." }
  },
  "27": {
    code: "27",
    title: { es: "Longitud de clave incompatible", en: "Incompatible key length" },
    description: { es: "Longitud de clave incompatible con el esquema o algoritmo seleccionado.", en: "Incompatible key length." },
    troubleshooting: { es: "Asegúrese de que la longitud de clave coincida con el esquema indicado.", en: "Ensure key length matches specified key scheme." }
  },
  "28": {
    code: "28",
    title: { es: "Tipo de clave inválido", en: "Invalid key type" },
    description: { es: "Tipo de clave no válido para esta operación.", en: "Invalid key type." },
    troubleshooting: { es: "Compruebe el parámetro de tipo de clave en la especificación del comando.", en: "Check key type parameter in command specification." }
  },
  "29": {
    code: "29",
    title: { es: "Función de clave no permitida", en: "Key function not permitted" },
    description: { es: "Función de clave no permitida por los atributos de la clave o la política de seguridad.", en: "Key function not permitted by key attributes or policy." },
    troubleshooting: { es: "Revise los atributos de uso de la clave o la cabecera del Key Block.", en: "Review key usage attributes or Key Block header." }
  },
  "30": {
    code: "30",
    title: { es: "Número de referencia inválido", en: "Invalid reference number" },
    description: { es: "Número de referencia no válido.", en: "Invalid reference number." },
    troubleshooting: { es: "Verifique el número de referencia suministrado en la petición.", en: "Verify the reference number supplied in the request." }
  },
  "31": {
    code: "31",
    title: { es: "Entradas de solicitud insuficientes para lote", en: "Insufficient solicitation entries for batch" },
    description: { es: "Entradas de solicitud insuficientes para el procesamiento por lotes.", en: "Insufficient solicitation entries for batch." },
    troubleshooting: { es: "Compruebe la cola de lotes y las entradas de solicitud.", en: "Check batch queue and solicitation entries." }
  },
  "32": {
    code: "32",
    title: { es: "Licencia AES no habilitada", en: "AES not licensed" },
    description: { es: "El algoritmo AES no está licenciado en este HSM.", en: "AES algorithm is not licensed on this HSM." },
    troubleshooting: { es: "Verifique los paquetes de licencia del HSM para la capacidad AES.", en: "Verify HSM license packages for AES capability." }
  },
  "33": {
    code: "33",
    title: { es: "Almacenamiento de cambio de clave LMK corrupto", en: "LMK key change storage corrupted" },
    description: { es: "El almacenamiento para el cambio de clave LMK está corrupto.", en: "LMK key change storage is corrupted." },
    troubleshooting: { es: "Reinicialice el almacenamiento de cambio de clave LMK.", en: "Re-initialize LMK key change storage." }
  },
  "39": {
    code: "39",
    title: { es: "Detección de fraude", en: "Fraud detection" },
    description: { es: "Alerta de detección de fraude activada por superación de umbrales.", en: "Fraud detection alert triggered." },
    troubleshooting: { es: "Inspeccione los umbrales de intentos sospechosos de verificación de PIN.", en: "Inspect suspicious PIN verification attempt thresholds." }
  },
  "40": {
    code: "40",
    title: { es: "Suma de comprobación inválida", en: "Invalid checksum" },
    description: { es: "Suma de comprobación o checksum inválido.", en: "Invalid checksum." },
    troubleshooting: { es: "Recalcule el checksum según la especificación.", en: "Recalculate checksum according to specification." }
  },
  "41": {
    code: "41",
    title: { es: "Error interno hardware/software", en: "Internal hardware/software error" },
    description: { es: "Error interno hardware o software: fallo en RAM, códigos inválidos, etc.", en: "Internal hardware/software error: bad RAM, invalid error codes, etc." },
    troubleshooting: { es: "Reinicie el HSM o contacte con el soporte del fabricante si persiste.", en: "Restart HSM or contact vendor support if error persists." }
  },
  "42": {
    code: "42",
    title: { es: "Fallo criptográfico DES", en: "DES failure" },
    description: { es: "Fallo en el coprocesador criptográfico DES.", en: "DES coprocessor failure." },
    troubleshooting: { es: "Ejecute el comando de diagnóstico (NC) para verificar el motor criptográfico.", en: "Run HSM diagnostics command (NC) to check cryptographic engine health." }
  },
  "43": {
    code: "43",
    title: { es: "Fallo en generación de clave RSA", en: "RSA Key Generation Failure" },
    description: { es: "Fallo en la generación de la clave RSA.", en: "RSA Key Generation Failure." },
    troubleshooting: { es: "Reintente la generación o elija un tamaño de módulo diferente.", en: "Retry generation or choose a different modulus size." }
  },
  "46": {
    code: "46",
    title: { es: "Etiqueta inválida para PIN cifrado", en: "Invalid tag for encrypted PIN" },
    description: { es: "Etiqueta no válida para el bloque de PIN cifrado.", en: "Invalid tag for encrypted PIN." },
    troubleshooting: { es: "Compruebe las etiquetas EMV o propietarias del bloque de PIN.", en: "Check EMV or proprietary PIN tag values." }
  },
  "47": {
    code: "47",
    title: { es: "Algoritmo no licenciado", en: "Algorithm not licensed" },
    description: { es: "El algoritmo solicitado no está licenciado en este HSM.", en: "Algorithm not licensed." },
    troubleshooting: { es: "Compruebe las opciones de licencia del HSM.", en: "Check HSM license options." }
  },
  "48": {
    code: "48",
    title: { es: "Clave no puede ser cifrada por LMK 3DES", en: "Key cannot be encrypted by a 3DES LMK" },
    description: { es: "La clave no puede ser cifrada bajo un LMK 3DES (requiere LMK AES).", en: "Key cannot be encrypted by a 3DES LMK." },
    troubleshooting: { es: "Migre la gestión de claves al esquema LMK AES.", en: "Migrate key management to AES LMK scheme." }
  },
  "49": {
    code: "49",
    title: { es: "Error en clave privada", en: "Private key error" },
    description: { es: "Error en clave privada, informe al supervisor.", en: "Private key error, report to supervisor." },
    troubleshooting: { es: "Verifique la integridad de la clave privada o recárguela.", en: "Verify private key integrity or reload key." }
  },
  "51": {
    code: "51",
    title: { es: "Encabezado de mensaje inválido", en: "Invalid message header" },
    description: { es: "Encabezado del mensaje no válido según la configuración de la interfaz.", en: "Invalid message header." },
    troubleshooting: { es: "Verifique la longitud y formato del encabezado del mensaje.", en: "Verify configured message header length and format." }
  },
  "65": {
    code: "65",
    title: { es: "Esquema de clave de transacción en None", en: "Transaction Key Scheme set to None" },
    description: { es: "El esquema de clave de transacción está configurado en None.", en: "Transaction Key Scheme set to None." },
    troubleshooting: { es: "Seleccione un esquema de clave de transacción válido.", en: "Select a valid Transaction Key Scheme (e.g. Racal or Australian)." }
  },
  "67": {
    code: "67",
    title: { es: "Comando no licenciado", en: "Command not licensed" },
    description: { es: "El comando solicitado no está habilitado por licencia en esta unidad.", en: "Command not licensed on this payShield unit." },
    troubleshooting: { es: "Compruebe las licencias de comandos del HSM.", en: "Check host command license options." }
  },
  "68": {
    code: "68",
    title: { es: "Comando deshabilitado", en: "Command has been disabled" },
    description: { es: "El comando ha sido deshabilitado en la configuración de seguridad.", en: "Command has been disabled by security configuration." },
    troubleshooting: { es: "Habilite el comando en los ajustes de seguridad del HSM si procede.", en: "Enable command in HSM security settings if authorized." }
  },
  "69": {
    code: "69",
    title: { es: "Formato de PIN block deshabilitado", en: "PIN block format has been disabled" },
    description: { es: "El formato de PIN block ha sido deshabilitado por política de seguridad.", en: "PIN block format has been disabled by security policy." },
    troubleshooting: { es: "Utilice un formato de PIN block autorizado.", en: "Use an authorized PIN block format (e.g. ISO-0, ISO-3, ISO-4)." }
  },
  "74": {
    code: "74",
    title: { es: "Sintaxis de digest info inválida", en: "Invalid digest info syntax" },
    description: { es: "Sintaxis de información de resumen (digest info) no válida.", en: "Invalid digest info syntax (no hash mode only)." },
    troubleshooting: { es: "Verifique el formateo digest info PKCS#1.", en: "Verify PKCS#1 digest info formatting." }
  },
  "75": {
    code: "75",
    title: { es: "Error de clave simple enmascarada", en: "Single length key masquerading error" },
    description: { es: "Una clave de longitud simple está enmascarada como clave doble o triple.", en: "Single length key masquerading as double or triple length key." },
    troubleshooting: { es: "Asegúrese de que los componentes de la clave sean distintos.", en: "Ensure key components are distinct and meet security strength rules." }
  },
  "76": {
    code: "76",
    title: { es: "Error de longitud en clave pública RSA o datos cifrados", en: "RSA public key length or encrypted data length error" },
    description: { es: "Error en la longitud de la clave pública RSA o en los datos cifrados con RSA.", en: "RSA public key length error or RSA encrypted data length error." },
    troubleshooting: { es: "Verifique la longitud del módulo RSA y el relleno del texto cifrado.", en: "Verify RSA modulus length and ciphertext padding." }
  },
  "77": {
    code: "77",
    title: { es: "Error en bloque de datos en claro", en: "Clear data block error" },
    description: { es: "Error en el bloque de datos en claro.", en: "Clear data block error." },
    troubleshooting: { es: "Compruebe la alineación y longitud del bloque de datos en claro.", en: "Check clear data block alignment and length." }
  },
  "78": {
    code: "78",
    title: { es: "Error de longitud de clave privada", en: "Private key length error" },
    description: { es: "Error en la longitud de la clave privada.", en: "Private key length error." },
    troubleshooting: { es: "Asegúrese de que la estructura de la clave privada coincida con la especificación.", en: "Ensure private key structure matches specification." }
  },
  "79": {
    code: "79",
    title: { es: "Error en OID de algoritmo hash", en: "Hash algorithm OID error" },
    description: { es: "Identificador de objeto (OID) de algoritmo hash no reconocido.", en: "Hash algorithm object identifier error." },
    troubleshooting: { es: "Proporcione un OID de hash estándar.", en: "Provide a standard hash OID (e.g. SHA-256, SHA-512)." }
  },
  "80": {
    code: "80",
    title: { es: "Error de longitud de datos", en: "Data length error" },
    description: { es: "Error de longitud de datos: el volumen de datos de MAC o carga útil es diferente al esperado.", en: "Data length error: MAC or payload data is greater or less than expected amount." },
    troubleshooting: { es: "Compruebe el campo de longitud y la longitud real de los datos.", en: "Check data length field and actual length of payload." }
  },
  "81": {
    code: "81",
    title: { es: "Cabecera de certificado inválida", en: "Invalid certificate header" },
    description: { es: "Cabecera de certificado digital no válida.", en: "Invalid certificate header." },
    troubleshooting: { es: "Verifique la estructura y cabecera del certificado.", en: "Verify certificate structure and format header." }
  },
  "82": {
    code: "82",
    title: { es: "Longitud de check value inválida", en: "Invalid check value length" },
    description: { es: "Longitud del valor de comprobación (KCV) no válida.", en: "Invalid check value length." },
    troubleshooting: { es: "Proporcione 6 dígitos hex para KCV de 3 bytes u 8 dígitos para 4 bytes.", en: "Provide 6 hex digits for 3-byte KCV or 8 hex digits for 4-byte KCV." }
  },
  "83": {
    code: "83",
    title: { es: "Error de formato en Key Block", en: "Key block format error" },
    description: { es: "Error de formato en Key Block: la estructura no cumple la especificación TR-31 o Thales Key Block.", en: "Key block format error: structure does not conform to TR-31 / Thales Key Block." },
    troubleshooting: { es: "Inspeccione la cabecera del key block, bloques opcionales y longitud.", en: "Inspect key block header, optional block count, and payload length." }
  },
  "84": {
    code: "84",
    title: { es: "Error de check value en Key Block", en: "Key block check value error" },
    description: { es: "Error en el valor de comprobación del Key Block.", en: "Key block check value error." },
    troubleshooting: { es: "Verifique el cálculo del valor de comprobación en el bloque.", en: "Verify key check value calculation inside key block." }
  },
  "85": {
    code: "85",
    title: { es: "Función MGF OAEP inválida", en: "Invalid OAEP Mask Generation Function" },
    description: { es: "Función de generación de máscara (MGF) OAEP no válida.", en: "Invalid OAEP Mask Generation Function." },
    troubleshooting: { es: "Especifique MGF1 con un algoritmo hash soportado.", en: "Specify MGF1 with a supported hash algorithm." }
  },
  "86": {
    code: "86",
    title: { es: "Función hash MGF OAEP inválida", en: "Invalid OAEP MGF Hash Function" },
    description: { es: "Función hash para MGF OAEP no válida.", en: "Invalid OAEP MGF Hash Function." },
    troubleshooting: { es: "Seleccione SHA-1, SHA-224, SHA-256, SHA-384 o SHA-512.", en: "Select SHA-1, SHA-224, SHA-256, SHA-384, or SHA-512." }
  },
  "87": {
    code: "87",
    title: { es: "Error de parámetros OAEP", en: "OAEP Parameter Error" },
    description: { es: "Error en los parámetros OAEP.", en: "OAEP Parameter Error." },
    troubleshooting: { es: "Inspeccione la etiqueta y parámetros OAEP.", en: "Inspect OAEP label and parameters." }
  },
  "90": {
    code: "90",
    title: { es: "Error de paridad en mensaje de petición", en: "Data parity error in request" },
    description: { es: "Error de paridad en los datos del mensaje de petición recibido por el HSM.", en: "Data parity error in the request message received by the HSM." },
    troubleshooting: { es: "Verifique los ajustes de paridad de la línea de comunicación.", en: "Verify communication line parity settings and message integrity." }
  },
  "A1": {
    code: "A1",
    title: { es: "Esquemas de LMK incompatibles", en: "Incompatible LMK schemes" },
    description: { es: "Esquemas de LMK incompatibles entre origen y destino.", en: "Incompatible LMK schemes." },
    troubleshooting: { es: "Asegúrese de que las claves de origen y destino usen esquemas compatibles.", en: "Ensure source and target keys use compatible LMK schemes." }
  },
  "A2": {
    code: "A2",
    title: { es: "Identificadores LMK incompatibles", en: "Incompatible LMK identifiers" },
    description: { es: "Identificadores de LMK incompatibles.", en: "Incompatible LMK identifiers." },
    troubleshooting: { es: "Compruebe que los IDs de LMK coincidan con la partición requerida.", en: "Check LMK IDs match required partition." }
  },
  "A3": {
    code: "A3",
    title: { es: "Identificadores LMK en Key Block incompatibles", en: "Incompatible key block LMK identifiers" },
    description: { es: "Identificadores LMK en el Key Block incompatibles.", en: "Incompatible key block LMK identifiers." },
    troubleshooting: { es: "Verifique el LMK ID del key block contra el LMK activo.", en: "Verify key block LMK ID against HSM active LMK." }
  },
  "A4": {
    code: "A4",
    title: { es: "Fallo de autenticación en Key Block", en: "Key block authentication failure" },
    description: { es: "Fallo de autenticación en el Key Block: la verificación del MAC ha fallado.", en: "Key block authentication failure: MAC verification failed." },
    troubleshooting: { es: "Verifique la clave de envoltura y que el key block no haya sido modificado.", en: "Verify wrapping key and ensure key block has not been altered." }
  },
  "A5": {
    code: "A5",
    title: { es: "Longitud de clave incompatible", en: "Incompatible key length" },
    description: { es: "Longitud de clave incompatible en el bloque de claves.", en: "Incompatible key length in key block." },
    troubleshooting: { es: "Asegúrese de que la longitud de clave coincida con el algoritmo en la cabecera.", en: "Ensure key length matches algorithm header in Key Block." }
  },
  "A6": {
    code: "A6",
    title: { es: "Uso de clave inválido", en: "Invalid key usage" },
    description: { es: "Código de uso de clave no válido en el Key Block (campo de cabecera TR-31).", en: "Invalid key usage code in Key Block (TR-31 header field)." },
    troubleshooting: { es: "Verifique el identificador de uso de clave TR-31 (ej. B0, D0, P0).", en: "Verify TR-31 Key Usage identifier (e.g. B0, D0, P0)." }
  },
  "A7": {
    code: "A7",
    title: { es: "Algoritmo inválido", en: "Invalid algorithm" },
    description: { es: "Algoritmo especificado en la cabecera del Key Block no válido.", en: "Invalid algorithm specified in Key Block header." },
    troubleshooting: { es: "Verifique el código de algoritmo (ej. T para 3DES, A para AES).", en: "Verify algorithm code (e.g. T for 3DES, A for AES)." }
  },
  "A8": {
    code: "A8",
    title: { es: "Modo de uso inválido", en: "Invalid mode of use" },
    description: { es: "Modo de uso no válido en la cabecera del Key Block.", en: "Invalid mode of use in Key Block header." },
    troubleshooting: { es: "Compruebe el modo de uso TR-31 (ej. E: Cifrar, D: Descifrar, B: Ambos).", en: "Check TR-31 Mode of Use (e.g. E: Encrypt, D: Decrypt, B: Both)." }
  },
  "A9": {
    code: "A9",
    title: { es: "Número de versión de clave inválido", en: "Invalid key version number" },
    description: { es: "Número de versión de clave no válido en Key Block.", en: "Invalid key version number." },
    troubleshooting: { es: "Asegúrese de que el número de versión sea alfanumérico o 00.", en: "Ensure key version number is alphanumeric or 00." }
  },
  "AA": {
    code: "AA",
    title: { es: "Campo de exportabilidad inválido", en: "Invalid export field" },
    description: { es: "Campo de exportabilidad en la cabecera del Key Block no válido.", en: "Invalid export field in Key Block header." },
    troubleshooting: { es: "Compruebe el código de exportabilidad (E, N, S).", en: "Check exportability code (E: Exportable, N: Non-exportable, S: Sensitive)." }
  },
  "AB": {
    code: "AB",
    title: { es: "Número de bloques opcionales inválido", en: "Invalid number of optional blocks" },
    description: { es: "Número de bloques opcionales en el Key Block no válido.", en: "Invalid number of optional blocks in Key Block." },
    troubleshooting: { es: "Verifique el contador de bloques opcionales de 2 dígitos en la cabecera.", en: "Verify 2-digit optional block count in TR-31 header." }
  },
  "AC": {
    code: "AC",
    title: { es: "Error en bloque de cabecera opcional", en: "Optional header block error" },
    description: { es: "Error en bloque de cabecera opcional del Key Block.", en: "Optional header block error." },
    troubleshooting: { es: "Inspeccione la estructura e ID del bloque opcional.", en: "Inspect optional block structure and ID." }
  },
  "AD": {
    code: "AD",
    title: { es: "Error en bloque opcional de estado de clave", en: "Key status optional block error" },
    description: { es: "Error en el bloque opcional de estado de clave.", en: "Key status optional block error." },
    troubleshooting: { es: "Compruebe el formato del bloque opcional de estado de clave.", en: "Check key status optional block format." }
  },
  "AE": {
    code: "AE",
    title: { es: "Fecha/hora de inicio inválida", en: "Invalid start date/time" },
    description: { es: "Fecha u hora de inicio no válida en el key block.", en: "Invalid start date/time in key block." },
    troubleshooting: { es: "Formatee la fecha de inicio como AAMMDDhhmm.", en: "Format start date as YYMMDDhhmm." }
  },
  "AF": {
    code: "AF",
    title: { es: "Fecha/hora de fin inválida", en: "Invalid end date/time" },
    description: { es: "Fecha u hora de expiración no válida en el key block.", en: "Invalid end date/time in key block." },
    troubleshooting: { es: "Formatee la fecha de fin como AAMMDDhhmm y verifique que sea posterior al inicio.", en: "Format end date as YYMMDDhhmm and ensure it is after start date." }
  },
  "B0": {
    code: "B0",
    title: { es: "Modo de cifrado inválido", en: "Invalid encryption mode" },
    description: { es: "Modo de cifrado no válido (ej. CBC, ECB, CTR).", en: "Invalid encryption mode." },
    troubleshooting: { es: "Verifique el parámetro de modo de cifrado en la petición.", en: "Verify encryption mode parameter in command request." }
  },
  "B1": {
    code: "B1",
    title: { es: "Modo de autenticación inválido", en: "Invalid authentication mode" },
    description: { es: "Modo de autenticación o cálculo de MAC no válido.", en: "Invalid authentication mode." },
    troubleshooting: { es: "Verifique el algoritmo de autenticación y relleno.", en: "Verify authentication algorithm and padding." }
  },
  "B2": {
    code: "B2",
    title: { es: "Error misceláneo en Key Block", en: "Miscellaneous key block error" },
    description: { es: "Error misceláneo en el procesamiento del Key Block.", en: "Miscellaneous key block error." },
    troubleshooting: { es: "Revise la representación hexadecimal completa del key block.", en: "Review complete key block hex representation." }
  },
  "B3": {
    code: "B3",
    title: { es: "Número inválido de bloques opcionales", en: "Invalid number of optional blocks" },
    description: { es: "Número inválido de bloques opcionales.", en: "Invalid number of optional blocks." },
    troubleshooting: { es: "Verifique que la cantidad de bloques opcionales coincida con los datos presentes.", en: "Verify count of optional blocks matches data present." }
  },
  "B4": {
    code: "B4",
    title: { es: "Error en datos de bloque opcional", en: "Optional block data error" },
    description: { es: "Error en los datos del bloque opcional.", en: "Optional block data error." },
    troubleshooting: { es: "Compruebe el contenido y la codificación de los datos del bloque opcional.", en: "Check optional block data content and encoding." }
  },
  "B5": {
    code: "B5",
    title: { es: "Componentes incompatibles", en: "Incompatible components" },
    description: { es: "Componentes de clave incompatibles al combinar.", en: "Incompatible components in key assembly." },
    troubleshooting: { es: "Asegúrese de que los componentes tengan el mismo esquema y tipo de clave.", en: "Ensure components have matching key scheme and type." }
  },
  "B6": {
    code: "B6",
    title: { es: "Bloques de estado de clave incompatibles", en: "Incompatible key status optional blocks" },
    description: { es: "Bloques opcionales de estado de clave incompatibles.", en: "Incompatible key status optional blocks." },
    troubleshooting: { es: "Compruebe las reglas de estado de clave.", en: "Check key status rules." }
  },
  "B7": {
    code: "B7",
    title: { es: "Campo de cambio inválido", en: "Invalid change field" },
    description: { es: "Campo de modificación no válido.", en: "Invalid change field." },
    troubleshooting: { es: "Verifique el parámetro de campo a modificar.", en: "Verify change field parameter." }
  },
  "B8": {
    code: "B8",
    title: { es: "Valor anterior inválido", en: "Invalid old value" },
    description: { es: "El valor anterior suministrado no coincide con el registrado.", en: "Invalid old value." },
    troubleshooting: { es: "Verifique que el valor anterior coincida con el atributo actual.", en: "Verify old value parameter matches current key attribute." }
  },
  "B9": {
    code: "B9",
    title: { es: "Nuevo valor inválido", en: "Invalid new value" },
    description: { es: "El nuevo valor suministrado no es válido.", en: "Invalid new value." },
    troubleshooting: { es: "Asegúrese de que el nuevo valor cumpla las reglas TR-31.", en: "Ensure new attribute value conforms to TR-31 rules." }
  },
  "BA": {
    code: "BA",
    title: { es: "Sin bloque de estado en Key Block", en: "No key status block in key block" },
    description: { es: "No se encontró el bloque opcional de estado en el Key Block.", en: "No key status block in the key block." },
    troubleshooting: { es: "Asegúrese de que el key block incluya el bloque de estado requerido.", en: "Ensure key block includes required key status block." }
  },
  "BB": {
    code: "BB",
    title: { es: "Clave de envoltura inválida", en: "Invalid wrapping key" },
    description: { es: "La clave de envoltura (KEK/LMK) no es válida para esta operación.", en: "Invalid wrapping key." },
    troubleshooting: { es: "Compruebe el tipo y uso de la clave de envoltura.", en: "Check wrapping key type and key usage attributes." }
  },
  "BC": {
    code: "BC",
    title: { es: "Bloque opcional repetido", en: "Repeated optional block" },
    description: { es: "Bloque opcional repetido en la cabecera del Key Block.", en: "Repeated optional block in Key Block." },
    troubleshooting: { es: "Asegúrese de que los bloques opcionales tengan IDs únicos.", en: "Ensure optional blocks have unique block IDs." }
  },
  "BD": {
    code: "BD",
    title: { es: "Tipos de clave incompatibles", en: "Incompatible key types" },
    description: { es: "Tipos de clave incompatibles entre sí para esta operación.", en: "Incompatible key types." },
    troubleshooting: { es: "Asegúrese de que los tipos de clave puedan interactuar según la política.", en: "Ensure key types are allowed to interact per security policy." }
  },
  "BE": {
    code: "BE",
    title: { es: "ID de cabecera de Key Block inválido", en: "Invalid key block header ID" },
    description: { es: "El identificador de cabecera del Key Block no es reconocido.", en: "Invalid key block header ID." },
    troubleshooting: { es: "Verifique el prefijo del bloque de claves (ej. S, R, 1, 2, 3).", en: "Verify key block prefix (e.g. S, R, 1, 2, 3)." }
  },
  "D3": {
    code: "D3",
    title: { es: "Clave de envoltura con menor nivel de seguridad", en: "Lower security strength wrapping key" },
    description: { es: "La clave de envoltura tiene una fortaleza de seguridad menor que la clave que se intenta envolver.", en: "The wrapping key has a lower security strength than the key being wrapped." },
    troubleshooting: { es: "Utilice una clave de envoltura con fortaleza criptográfica igual o superior.", en: "Use a wrapping key with equal or higher cryptographic strength (e.g. AES-256 wrapping AES-128)." }
  }
};
