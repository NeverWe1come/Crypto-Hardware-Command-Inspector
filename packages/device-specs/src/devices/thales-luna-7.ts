/**
 * @packageDocumentation
 * Specification for Thales Luna PCIe / Network HSM 7 (`@chci/device-specs`).
 * Features multi-interface architecture: OASIS PKCS#11 C-API, OASIS KMIP XML,
 * Thales REST API (JSON), and LunaSH appliance CLI across firmware 7.8, 7.7, and 7.4.
 */

import type { DeviceSpec } from '@chci/parser-core';

export const thalesLuna7Spec: DeviceSpec = {
  id: 'thales-luna-7',
  name: 'Thales Luna PCIe / Network HSM 7',
  vendor: 'Thales',
  category: 'HSM_GP',
  status: 'supported',
  icon: 'cpu',
  defaultVersion: '7.8.0',
  defaultInterface: 'pkcs11',
  exampleCommand: 'C_Encrypt(0x0001, "TopSecretPayload123", 19);',
  summary: {
    es: 'Módulo de seguridad de hardware de propósito general con soporte para API PKCS#11, OASIS KMIP, REST API y consola LunaSH.',
    en: 'General-purpose Hardware Security Module supporting PKCS#11, OASIS KMIP, REST API, and LunaSH appliance management CLI.'
  },
  framing: {
    type: 'structured',
    format: 'callable'
  },
  interfaces: [
    {
      id: 'pkcs11',
      name: { es: 'PKCS#11 C-API (Estándar OASIS)', en: 'PKCS#11 C-API (OASIS Standard)' },
      shortLabel: 'PKCS#11',
      kind: 'standard',
      wireFormat: 'callable',
      description: {
        es: 'Interfaz estándar OASIS Cryptoki PKCS#11 v2.40 / v3.0 para operaciones criptográficas de alto rendimiento.',
        en: 'OASIS Cryptoki PKCS#11 v2.40 / v3.0 standard interface for high-performance cryptographic operations.'
      },
      framing: { type: 'structured', format: 'callable' },
      exampleCommand: 'C_Encrypt(hSession=0x01, pData="TopSecretData", ulDataLen=13);'
    },
    {
      id: 'kmip-xml',
      name: { es: 'OASIS KMIP XML (Estándar)', en: 'OASIS KMIP XML (Standard)' },
      shortLabel: 'KMIP',
      kind: 'standard',
      wireFormat: 'xml',
      description: {
        es: 'Protocolo de interoperabilidad de gestión de claves OASIS KMIP 1.4 / 2.1 en formato XML.',
        en: 'OASIS Key Management Interoperability Protocol (KMIP) 1.4 / 2.1 in XML wire format.'
      },
      framing: { type: 'structured', format: 'xml' },
      exampleCommand: '<RequestMessage>\n  <BatchItem>\n    <Operation value="Create"/>\n    <ObjectType value="SymmetricKey"/>\n    <CryptographicAlgorithm value="AES"/>\n    <CryptographicLength value="256"/>\n  </BatchItem>\n</RequestMessage>'
    },
    {
      id: 'rest-json',
      name: { es: 'Thales Luna REST API (Propietaria)', en: 'Thales Luna REST API (Proprietary)' },
      shortLabel: 'REST',
      kind: 'proprietary',
      wireFormat: 'json',
      description: {
        es: 'API REST JSON oficial para aprovisionamiento, gestión de particiones y servicios criptográficos web.',
        en: 'Official JSON REST API for appliance provisioning, partition management, and web cryptography.'
      },
      framing: { type: 'structured', format: 'json' },
      exampleCommand: 'POST /api/lunasa/hsms/1/partitions/1/objects HTTP/1.1\nHost: hsm.local\nContent-Type: application/json\n\n{\n  "type": "AES",\n  "length": 256,\n  "label": "MasterKey"\n}'
    },
    {
      id: 'lunash-cli',
      name: { es: 'Consola LunaSH CLI (Propietaria)', en: 'LunaSH CLI Console (Proprietary)' },
      shortLabel: 'LunaSH',
      kind: 'proprietary',
      wireFormat: 'cli',
      description: {
        es: 'Línea de comandos de administración de electrodoméstico y particiones LunaSH.',
        en: 'LunaSH appliance administration and security partition shell commands.'
      },
      framing: { type: 'structured', format: 'cli' },
      exampleCommand: 'lunash:> hsm show'
    }
  ],
  versions: {
    '7.4.0': {
      version: '7.4.0',
      label: { es: 'Luna Firmware 7.4.0', en: 'Luna Firmware 7.4.0' },
      releaseNotes: {
        es: 'Versión base de firmware Luna 7 con soporte ampliado para curvas elípticas EdDSA y validación FIPS 140-2 Nivel 3.',
        en: 'Baseline Luna 7 firmware with extended EdDSA curve support and FIPS 140-2 Level 3 validation.'
      },
      commands: [
        {
          id: 'luna-p11-c-init',
          code: 'C_Initialize',
          interfaceId: 'pkcs11',
          direction: 'request',
          name: { es: 'Inicializar Biblioteca Cryptoki', en: 'Initialize Cryptoki Library' },
          summary: { es: 'Inicializa el subsistema PKCS#11 y reserva recursos', en: 'Initializes the PKCS#11 subsystem and allocates resources' },
          description: { es: 'Inicializa la biblioteca Cryptoki de Thales Luna en el proceso del cliente.', en: 'Initializes the Thales Luna Cryptoki library in the host process.' },
          category: { es: 'Ciclo de Vida PKCS#11', en: 'PKCS#11 Lifecycle' },
          source: 'OASIS PKCS#11 v2.40 Section 5.4',
          fields: [
            {
              id: 'pInitArgs',
              name: { es: 'Argumentos de Inicialización', en: 'Initialization Arguments' },
              description: { es: 'Estructura CK_C_INITIALIZE_ARGS o NULL', en: 'CK_C_INITIALIZE_ARGS structure or NULL' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: false
            }
          ]
        },
        {
          id: 'luna-p11-c-open-session',
          code: 'C_OpenSession',
          interfaceId: 'pkcs11',
          direction: 'request',
          name: { es: 'Abrir Sesión en Partición', en: 'Open Partition Session' },
          summary: { es: 'Abre una sesión de trabajo con una partición o ranura', en: 'Opens a working session with a slot or partition' },
          description: { es: 'Abre una sesión en la ranura especificada y devuelve un identificador hSession.', en: 'Opens a session on the specified slot and returns an hSession handle.' },
          category: { es: 'Gestión de Sesión', en: 'Session Management' },
          source: 'OASIS PKCS#11 v2.40 Section 5.6',
          fields: [
            {
              id: 'slotID',
              name: { es: 'Identificador de Ranura', en: 'Slot Identifier' },
              description: { es: 'ID de la ranura o partición HSM', en: 'HSM slot or partition ID' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'flags',
              name: { es: 'Indicadores de Sesión', en: 'Session Flags' },
              description: { es: 'CKF_SERIAL_SESSION | CKF_RW_SESSION', en: 'CKF_SERIAL_SESSION | CKF_RW_SESSION' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'luna-p11-c-login',
          code: 'C_Login',
          interfaceId: 'pkcs11',
          direction: 'request',
          name: { es: 'Autenticar Usuario en Partición', en: 'Authenticate Partition User' },
          summary: { es: 'Inicia sesión con rol Crypto Officer o Crypto User', en: 'Logs in with Crypto Officer or Crypto User role' },
          description: { es: 'Autentica al usuario en la sesión activa mediante PIN o token PED.', en: 'Authenticates the user in active session using PIN or PED token.' },
          category: { es: 'Autenticación', en: 'Authentication' },
          source: 'OASIS PKCS#11 v2.40 Section 5.6',
          fields: [
            {
              id: 'hSession',
              name: { es: 'Manejador de Sesión', en: 'Session Handle' },
              description: { es: 'Manejador de sesión activa', en: 'Active session handle' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'userType',
              name: { es: 'Tipo de Usuario', en: 'User Type' },
              description: { es: 'CKU_SO, CKU_USER o CKU_CONTEXT_SPECIFIC', en: 'CKU_SO, CKU_USER or CKU_CONTEXT_SPECIFIC' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'pPin',
              name: { es: 'PIN / Credencial Secreta', en: 'PIN / Secret Credential' },
              description: { es: 'PIN en claro de acceso a la partición', en: 'Cleartext partition PIN' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true,
              sensitive: true
            }
          ]
        },
        {
          id: 'luna-p11-c-encrypt',
          code: 'C_Encrypt',
          interfaceId: 'pkcs11',
          direction: 'request',
          name: { es: 'Cifrado de Bloque de Datos', en: 'Single-Part Data Encryption' },
          summary: { es: 'Cifra datos en un único paso con la clave activa', en: 'Encrypts single-part data with active key' },
          description: { es: 'Cifra texto plano utilizando el mecanismo y la clave inicializados.', en: 'Encrypts plaintext using initialized mechanism and key.' },
          category: { es: 'Operaciones Criptográficas', en: 'Cryptographic Operations' },
          source: 'OASIS PKCS#11 v2.40 Section 5.11',
          fields: [
            {
              id: 'hSession',
              name: { es: 'Manejador de Sesión', en: 'Session Handle' },
              description: { es: 'Identificador de sesión', en: 'Session handle' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'pData',
              name: { es: 'Datos en Claro', en: 'Plaintext Data' },
              description: { es: 'Material confidencial a cifrar', en: 'Confidential plaintext to encrypt' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true,
              sensitive: true
            },
            {
              id: 'ulDataLen',
              name: { es: 'Longitud en Bytes', en: 'Length in Bytes' },
              description: { es: 'Número de bytes del texto plano', en: 'Plaintext byte count' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'luna-p11-c-decrypt',
          code: 'C_Decrypt',
          interfaceId: 'pkcs11',
          direction: 'request',
          name: { es: 'Descifrado de Bloque de Datos', en: 'Single-Part Data Decryption' },
          summary: { es: 'Descifra criptograma con la clave privada o simétrica', en: 'Decrypts ciphertext with private or symmetric key' },
          description: { es: 'Descifra un criptograma y devuelve el texto plano resultante.', en: 'Decrypts ciphertext and returns cleartext payload.' },
          category: { es: 'Operaciones Criptográficas', en: 'Cryptographic Operations' },
          source: 'OASIS PKCS#11 v2.40 Section 5.11',
          fields: [
            {
              id: 'hSession',
              name: { es: 'Manejador de Sesión', en: 'Session Handle' },
              description: { es: 'Identificador de sesión', en: 'Session handle' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'pEncryptedData',
              name: { es: 'Criptograma', en: 'Ciphertext Data' },
              description: { es: 'Datos cifrados de entrada', en: 'Input encrypted bytes' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'luna-p11-c-sign',
          code: 'C_Sign',
          interfaceId: 'pkcs11',
          direction: 'request',
          name: { es: 'Firma Digital de Datos', en: 'Sign Data' },
          summary: { es: 'Genera una firma digital o código MAC', en: 'Generates digital signature or MAC' },
          description: { es: 'Genera una firma criptográfica utilizando una clave privada RSA/ECC o HMAC.', en: 'Generates a cryptographic signature using an RSA/ECC private key or HMAC.' },
          category: { es: 'Firmas y Resúmenes', en: 'Signatures and Digests' },
          source: 'OASIS PKCS#11 v2.40 Section 5.12',
          fields: [
            {
              id: 'hSession',
              name: { es: 'Manejador de Sesión', en: 'Session Handle' },
              description: { es: 'Identificador de sesión', en: 'Session handle' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'pData',
              name: { es: 'Datos o Hash a Firmar', en: 'Data or Hash to Sign' },
              description: { es: 'Carga de datos o resumen SHA', en: 'Data payload or SHA digest' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'luna-kmip-create',
          code: 'Create',
          interfaceId: 'kmip-xml',
          direction: 'request',
          name: { es: 'Crear Objeto Administrado KMIP', en: 'KMIP Create Managed Object' },
          summary: { es: 'Instruye al HSM generar una clave simétrica nueva', en: 'Instructs the HSM to generate a new symmetric key' },
          description: { es: 'Crea una clave simétrica con atributos de algoritmo y longitud en el servidor KMIP.', en: 'Creates a symmetric key with algorithm and length attributes on the KMIP server.' },
          category: { es: 'Gestión de Objetos KMIP', en: 'KMIP Object Management' },
          source: 'OASIS KMIP 1.4 Profile Section 4.1',
          fields: [
            {
              id: 'ObjectType',
              name: { es: 'Tipo de Objeto', en: 'Object Type' },
              description: { es: 'SymmetricKey, PublicKey o PrivateKey', en: 'SymmetricKey, PublicKey or PrivateKey' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'CryptographicAlgorithm',
              name: { es: 'Algoritmo Criptográfico', en: 'Cryptographic Algorithm' },
              description: { es: 'AES, TripleDES, RSA, etc.', en: 'AES, TripleDES, RSA, etc.' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'CryptographicLength',
              name: { es: 'Longitud en Bits', en: 'Key Length in Bits' },
              description: { es: '128, 192, 256, 2048, 4096', en: '128, 192, 256, 2048, 4096' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        },
        {
          id: 'luna-rest-get-hsm',
          code: 'hsms',
          interfaceId: 'rest-json',
          direction: 'request',
          name: { es: 'Consultar Estado HSM REST', en: 'Query HSM Status REST' },
          summary: { es: 'Devuelve información de chasis, modelo y licencias', en: 'Returns appliance chassis, model, and licenses' },
          description: { es: 'Obtiene el estado general de los módulos criptográficos instalados.', en: 'Retrieves general status of installed cryptographic modules.' },
          category: { es: 'REST API Appliance', en: 'REST API Appliance' },
          source: 'Thales Luna REST API Spec 7.4',
          fields: []
        },
        {
          id: 'luna-cli-hsm-show',
          code: 'hsm show',
          interfaceId: 'lunash-cli',
          direction: 'request',
          name: { es: 'Mostrar Información del HSM', en: 'Show HSM Appliance Details' },
          summary: { es: 'Muestra número de serie, firmware y políticas activas', en: 'Displays serial number, firmware, and active policies' },
          description: { es: 'Comando de consola LunaSH para inspección del estado físico del hardware.', en: 'LunaSH shell command for physical hardware state inspection.' },
          category: { es: 'Comandos LunaSH', en: 'LunaSH Commands' },
          source: 'Thales LunaSH Command Reference Section 3',
          fields: []
        }
      ],
      errorCodes: {
        '0x00000000': {
          code: '0x00000000',
          title: { es: 'CKR_OK (Éxito)', en: 'CKR_OK (Success)' },
          description: { es: 'La función Cryptoki se ejecutó satisfactoriamente.', en: 'Cryptoki function completed successfully.' }
        },
        '0x00000030': {
          code: '0x00000030',
          title: { es: 'CKR_DEVICE_ERROR', en: 'CKR_DEVICE_ERROR' },
          description: { es: 'Error de hardware en el módulo Luna o fallo de comunicación interna.', en: 'Hardware error in Luna module or internal bus failure.' },
          troubleshooting: { es: 'Revise el log de auditoría LunaSH (audit log) y compruebe el estado de los ventiladores y tamper.', en: 'Check LunaSH audit log and inspect fan/tamper alarms.' }
        },
        '0x000000A0': {
          code: '0x000000A0',
          title: { es: 'CKR_PIN_INCORRECT', en: 'CKR_PIN_INCORRECT' },
          description: { es: 'El PIN suministrado para autenticar la partición es incorrecto.', en: 'Provided partition PIN is incorrect.' },
          troubleshooting: { es: 'Verifique las credenciales. Tras múltiples intentos fallidos la partición se bloqueará.', en: 'Verify credentials. Multiple failed attempts will lock partition.' }
        },
        '0x000000A4': {
          code: '0x000000A4',
          title: { es: 'CKR_PIN_LOCKED', en: 'CKR_PIN_LOCKED' },
          description: { es: 'La partición ha sido bloqueada por superación de intentos de PIN.', en: 'Partition is locked due to excessive failed PIN attempts.' },
          troubleshooting: { es: 'Inicie sesión como Security Officer (SO) para desbloquear la partición.', en: 'Log in as Security Officer (SO) to reset partition lock.' }
        }
      }
    },
    '7.7.0': {
      version: '7.7.0',
      extends: '7.4.0',
      label: { es: 'Luna Firmware 7.7.0', en: 'Luna Firmware 7.7.0' },
      releaseNotes: {
        es: 'Soporte para particiones escalables FM (Function Modules) y curvas post-cuánticas preliminares.',
        en: 'Support for scalable Function Module (FM) partitions and preliminary post-quantum algorithms.'
      },
      commands: [
        {
          id: 'luna-p11-c-genkeypair',
          code: 'C_GenerateKeyPair',
          interfaceId: 'pkcs11',
          direction: 'request',
          name: { es: 'Generar Par de Claves Asimétricas', en: 'Generate Asymmetric Key Pair' },
          summary: { es: 'Crea una clave pública y privada (RSA, ECC, Ed25519)', en: 'Creates public and private key pair (RSA, ECC, Ed25519)' },
          description: { es: 'Genera un par de claves dentro de la partición HSM aplicando plantillas de atributos.', en: 'Generates a key pair inside the HSM partition applying attribute templates.' },
          category: { es: 'Generación de Claves', en: 'Key Generation' },
          source: 'OASIS PKCS#11 v2.40 Section 5.13',
          fields: [
            {
              id: 'hSession',
              name: { es: 'Manejador de Sesión', en: 'Session Handle' },
              description: { es: 'Identificador de sesión activa', en: 'Active session handle' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            },
            {
              id: 'mechanism',
              name: { es: 'Mecanismo de Generación', en: 'Generation Mechanism' },
              description: { es: 'CKM_RSA_PKCS_KEY_PAIR_GEN, CKM_EC_KEY_PAIR_GEN', en: 'CKM_RSA_PKCS_KEY_PAIR_GEN, CKM_EC_KEY_PAIR_GEN' },
              length: { kind: 'variable' },
              encoding: 'ascii',
              required: true
            }
          ]
        }
      ],
      errorCodes: {}
    },
    '7.8.0': {
      version: '7.8.0',
      extends: '7.7.0',
      label: { es: 'Luna Firmware 7.8.0 (Actual)', en: 'Luna Firmware 7.8.0 (Current)' },
      releaseNotes: {
        es: 'Cumplimiento FIPS 140-3 Nivel 3, soporte ampliado de KMIP 2.1 y cluster de alta disponibilidad activo-activo.',
        en: 'FIPS 140-3 Level 3 compliance, enhanced KMIP 2.1 support, and active-active high availability clustering.'
      },
      commands: [
        {
          id: 'luna-rest-cluster-status',
          code: 'cluster',
          interfaceId: 'rest-json',
          direction: 'request',
          name: { es: 'Consultar Estado de Cluster HA', en: 'Query HA Cluster Status' },
          summary: { es: 'Supervisa la sincronización y latencia del cluster Luna', en: 'Monitors Luna active-active cluster synchronization and latency' },
          description: { es: 'Endpoint REST para verificar la salud de los miembros del grupo de alta disponibilidad.', en: 'REST endpoint to verify health and member states in high availability group.' },
          category: { es: 'REST API Cluster', en: 'REST API Cluster' },
          source: 'Thales Luna REST API Spec 7.8 Section 6',
          fields: []
        }
      ],
      errorCodes: {}
    }
  },
  documentationSections: [
    {
      id: 'luna-arch-overview',
      title: { es: 'Arquitectura General Thales Luna 7', en: 'Thales Luna 7 Architectural Overview' },
      category: 'overview',
      markdown: {
        es: `# Módulo de Seguridad Hardware Thales Luna 7\n\nThales Luna 7 es una plataforma de hardware criptográfico de propósito general diseñada para proteger claves maestras de infraestructura PKI, firma de código, cifrado de bases de datos y autenticación de identidades.\n\n### Modelos Disponibles\n- **Luna PCIe HSM:** Tarjeta insertable en servidor host para baja latencia.\n- **Luna Network HSM:** Electrodoméstico de montaje en rack 1U con conectividad Ethernet redundante (hasta 10 GbE) y autenticación NTLS con certificados mutuos.\n\n### Seguridad y Certificaciones\n- Certificación FIPS 140-2 y FIPS 140-3 Nivel 3.\n- Control de dos factores (PED) con llaves iKey biométricas/físicas o modo contraseña (Password Auth).`,
        en: `# Thales Luna 7 Hardware Security Module\n\nThales Luna 7 is a general-purpose cryptographic hardware platform designed to protect root PKI keys, code signing certificates, database encryption keys, and identity systems.\n\n### Available Form Factors\n- **Luna PCIe HSM:** Embedded PCIe card for low-latency in-server deployment.\n- **Luna Network HSM:** 1U rack-mount appliance with dual redundant network interfaces and mutual TLS (NTLS) client binding.\n\n### Security Certifications\n- FIPS 140-2 and FIPS 140-3 Level 3 certified.\n- Multi-factor authentication via Luna PED keys or password mode.`
      }
    },
    {
      id: 'luna-multi-interface',
      title: { es: 'Interfaces Soportadas (PKCS#11, KMIP, REST, LunaSH)', en: 'Supported Interfaces (PKCS#11, KMIP, REST, LunaSH)' },
      category: 'chapter',
      markdown: {
        es: `## Interfaces de Comunicación de Thales Luna\n\nEl dispositivo permite interactuar a través de múltiples canales estandarizados y propietarios:\n\n1. **OASIS PKCS#11:** La interfaz C estándar de mayor velocidad para aplicaciones cliente (JCE, OpenSSL engine, Microsoft CNG).\n2. **OASIS KMIP:** Protocolo para integración transparente con sistemas de almacenamiento (NetApp, VMware, Dell EMC).\n3. **REST API:** Gestión de configuración y servicios mediante JSON sobre HTTPS.\n4. **LunaSH:** Shell seguro de administración de electrodoméstico y roles SO/Auditor.`,
        en: `## Thales Luna Communication Interfaces\n\nThe device supports multiple standard and proprietary communication channels:\n\n1. **OASIS PKCS#11:** High-speed standard C interface for host client applications.\n2. **OASIS KMIP:** Standard key management protocol for enterprise storage encryption.\n3. **REST API:** JSON over HTTPS configuration and crypto services.\n4. **LunaSH:** Hardened appliance management CLI for SO and Auditor roles.`
      }
    }
  ]
};
