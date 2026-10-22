# Guía de Usuario Oficial — Crypto Hardware Command Inspector (`chci`)

Bienvenido a la **Guía de Usuario Oficial y Completa** de **Crypto Hardware Command Inspector (`chci`)** para la versión **v1.0.0**.

`chci` es una estación de trabajo criptográfica de escritorio fuera de línea (*air-gapped*) diseñada para ingenieros de ciberseguridad, desarrolladores de pasarelas de pago, auditores PCI-DSS y operadores de banca que interactúan diariamente con Módulos de Seguridad de Hardware (**HSM**) y Sistemas de Gestión de Claves (**KMS**).

---

## 1. Modelo de Seguridad y Filosofía Cero-Red (Zero-Network)

El software bancario y de seguridad opera con material criptográfico altamente sensible:
- Bloques de PIN (ISO 9564 Formatos 0, 1, 3, 4).
- Criptogramas de claves protegidos bajo Claves Maestras Locales (LMK / MFK).
- Variantes de doble y triple longitud 3DES/AES y bloques ANSI X9.143 / TR-31.
- Claves privadas asimétricas (RSA, ECC Curve25519, NIST P-256).

Por ello, `chci` implementa una política estricta **Security-First**:

1. **Aislamiento Fuera de Línea (*Air-Gapped*)**:
   - En la aplicación nativa (**Tauri v2**), la directiva CSP (*Content Security Policy*) impone `connect-src 'none'`. No existe acceso a Internet, servidores remotos ni telemetría.
   - El motor de parseo (`@chci/parser-core`), las especificaciones técnicas (`@chci/device-specs`), el almacenamiento y la documentación residen 100% en la máquina local.
2. **Enmascaramiento Sensible por Defecto**:
   - Todo campo marcado como `sensitive: true` (criptogramas de clave, bloques de PIN, componentes claros) se enmascara automáticamente como `••••••••`.
   - El operador puede revelar u ocultar valores sensibles de forma puntual o global mediante el conmutador de la interfaz. Al cambiar de comando, todos los campos vuelven a protegerse inmediatamente.
3. **Persistencia Segura y Local**:
   - Las sesiones de trabajo se guardan en el IndexedDB del navegador o en archivos locales validados con **Zod** (`chci-session-v1.json` y bitácora plana `.chci_history`).

```mermaid
flowchart TD
    Raw["Trama Criptográfica Cruda (ASCII / Hex)"] --> Norm["Normalizador ASCII & Control Chars"]
    Norm --> Engine["Motor de Framing (@chci/parser-core)"]
    Engine --> Atalla["Delimited Positional (Atalla AT1000)"]
    Engine --> Thales["Header Positional (Thales payShield)"]
    Engine --> Futurex["Tag-Value (Futurex Excrypt)"]
    Engine --> Structured["Structured Framing (CLI / JSON / PKCS#11)"]
    Atalla --> Result["ParseResult Inmutable"]
    Thales --> Result
    Futurex --> Result
    Structured --> Result
    Result --> Masking{"¿Campo Sensible?"}
    Masking -- Sí --> Mask["Enmascarado: ••••••••"]
    Masking -- No --> Clear["Valor en Claro"]
    Mask --> UI["Panel de Inspección y Análisis"]
    Clear --> UI
```

---

## 2. Instalación y Despliegue Multiplataforma

`chci` se distribuye oficialmente como instaladores nativos para los tres sistemas operativos:

```mermaid
flowchart LR
    Release["GitHub Release (v1.0.0)"] --> Win["Windows Setup (.exe / NSIS)"]
    Release --> Mac["macOS Disk Image (.dmg)"]
    Release --> Lin1["Linux Portable (.AppImage)"]
    Release --> Lin2["Debian / Ubuntu (.deb)"]
    Release --> Sums["SHA256SUMS.txt (Integridad)"]
```

### 2.1 En Windows (Instalador Modular NSIS)
El instalador `Crypto-Hardware-Command-Inspector_x64-setup.exe` ofrece un asistente interactivo:
- **Selector de Carpeta de Destino (`Custom Destination Folder`)**: El usuario puede pulsar *"Examinar..."* y elegir cualquier ruta o unidad (ej: `D:\Herramientas\CHCI`).
- **Selector de Componentes Modular**:
  - ☑️ **CHCI Core Application**: Programa principal y visor de especificaciones (~45 MB, Obligatorio).
  - 🔲/☑️ **Simulador Utimaco Atalla AT1000 v8.56**: Imagen Docker offline `.tar` (~848 MB, Opcional). Si se marca, se despliega en `$INSTDIR\simulators\atalla-at1000\`. **Nunca ensucia el Escritorio**.
- **Accesos Directos Opcionales (NO automáticos)**:
  - Casilla: *Crear acceso directo en el Escritorio* (desmarcada por defecto).
  - Casilla: *Crear acceso directo en el Menú Inicio* (desmarcada por defecto).
  - Solo se crean aquellos que el operador marque expresamente.

### 2.2 En macOS (Imagen de Disco `.dmg`)
- Al abrir el archivo `Crypto-Hardware-Command-Inspector_universal.dmg`, el usuario arrastra la aplicación `Crypto Hardware Command Inspector.app` a `/Applications` o a la carpeta que desee.
- No se crean accesos directos al Escritorio. El usuario puede anclar la aplicación al Dock según su preferencia.

### 2.3 En Linux (AppImage y DEB)
- **AppImage Universal**: Binario portable ejecutable sin instalación en cualquier distribución Linux (Ubuntu, Debian, Fedora, Arch, SUSE). El usuario lo almacena en la carpeta de su elección (ej: `~/bin/` o `/opt/`).
- **Paquete Debian (`.deb`)**: Instalación nativa mediante `sudo dpkg -i chci.deb` con integración limpia en el menú del sistema.

![Arquitectura de Instalación y Distribución](../assets/screenshots/15-installer-and-distribution.png)

---

## 3. Catálogo de Dispositivos Criptográficos Soportados

La barra lateral izquierda categoriza los 10 dispositivos soportados en 4 familias arquitectónicas:

1. **HSM Financiero / Payment HSM**:
   - **Utimaco Atalla AT1000** (Firmware v8.60 / v8.56).
   - **Thales payShield 10K** (Firmware v2.3 / v1.9).
   - **Futurex Excrypt** (Firmware v7.6.1).
2. **HSM de Propósito General**:
   - **Thales Luna 7** (PKCS#11 y CLI Lunash).
   - **IBM CCA 4769** (Callable C Verbs y CLI).
   - **Yubico YubiHSM 2** (YubiHSM-Shell CLI y PKCS#11).
3. **KMS (Key Management Systems)**:
   - **AWS KMS** (REST JSON y AWS CLI).
   - **HashiCorp Vault Transit** (REST API v1 y CLI).
4. **HSM as a Service / Cloud HSM**:
   - **Marvell LiquidSecurity HSM** (Liquid CLI v3.4.0 y PKCS#11).
   - **Azure Dedicated Payment HSM** (TCP RAW y CLI).

### Vista General en Tema Claro
![Catálogo en Tema Claro](../assets/screenshots/01-catalog-overview-light.png)

### Vista General en Tema Oscuro
![Catálogo en Tema Oscuro](../assets/screenshots/02-catalog-overview-dark.png)

---

## 4. Editor de Comandos y Selector de Interfaces

El panel central de la aplicación proporciona un entorno de edición enriquecido basado en **CodeMirror 6**:

- **Resaltado de Sintaxis en Tiempo Real**: Delimitadores, etiquetas, campos posicionales y datos hexadecimales se identifican visualmente con colores específicos.
- **Selector de Interfaz Estándar vs Propietaria**:
  - Para dispositivos que admiten múltiples interfaces (como Thales Luna 7 o Marvell LiquidSecurity), cada comando dispone de un selector desplegable con indicador visual:
    - `[STD]` Interfaz Estándar de la Industria (ej: PKCS#11, REST JSON, KMIP).
    - `[PROP]` Interfaz Propietaria del Fabricante (ej: CLI nativa, RAW ASCII).

![Selector de Interfaces](../assets/screenshots/14-multi-interface-selector.png)

---

## 5. Panel de Análisis Criptográfico y Vista de Trama

El panel lateral derecho desglosa en tiempo real cada elemento de la trama introducida:

1. **Vista de Trama Segmentada**: Representación visual tipo bloque donde cada parámetro se muestra con su nombre oficial y color de categoría.
2. **Desglose de Parámetros Multilínea**: Tabla estructurada con ajuste forzado `break-all` y `table-fixed` que previene cualquier desbordamiento o scroll horizontal en claves de 74 o 128 caracteres.
3. **Soporte Dual-Mode AKB vs Variant**:
   - Detección automática del modo de clave:
     - 🌸 **AKB (Atalla Key Block)**: Clave formateada en bloque de 74 caracteres. Badge distintivo en rosa.
     - 🟪 **Variant**: Clave encriptada bajo variante tradicional (32 o 48 caracteres). Badge distintivo en morado.
4. **Descripciones Técnicas Expandibles `(i)`**: Al pulsar el botón de información en cualquier fila, se expande la explicación detallada del manual oficial con formatos válidos y ejemplos de uso.
5. **Avisos Oficiales del Fabricante**: Tarjetas estilizadas destacando `CAUTION`, `IMPORTANT`, `TIP` y `NOTE`.

![Modo Dual AKB vs Variant](../assets/screenshots/13-akb-variant-dual-mode.png)

---

## 6. Inspección de Comandos Utimaco Atalla AT1000

El encuadre **Delimited Positional** de Atalla utiliza los delimitadores `<` y `>` con separadores `#`:
- Formato general: `<CmdCode#SubCode#Param1#Param2#...#>`

### Ejemplo: Comando Atalla `31` con Error
Al inspeccionar una respuesta de error `<31#Y#01#>`:
- El inspector identifica el código de error `01` (*"Invalid command format"*).
- Muestra el desglose de causas documentadas (longitud errónea, campo numérico inválido, delimitador `#` faltante).

![Diagnóstico de Errores Atalla](../assets/screenshots/06-atalla-error-diagnostics.png)

---

## 7. Inspección de Comandos Thales payShield 10K

El encuadre **Header-Positional** de Thales payShield utiliza una cabecera de transporte configurable seguida del código de comando de 2 caracteres:
- Formato general: `[Header 4B][Code 2B][Data...]`
- Identificación de tipo de clave por prefijos oficiales:
  - `U`: Clave 3DES doble longitud (32 hex).
  - `T`: Clave 3DES triple longitud (48 hex).
  - `S`: Thales Key Block propietario.
  - `R`: ANSI X9.143 / TR-31 Key Block.

### Enmascaramiento de Claves bajo LMK
Al introducir una trama como `A00000U0123456789ABCDEF0123456789ABCDEF`:
- El campo de clave bajo LMK se oculta por defecto mediante `••••••••`.
- El icono de ojo permite revelar u ocultar la clave bajo demanda controlada del operador.

![Enmascaramiento Sensible Thales](../assets/screenshots/04-thales-command-masking.png)

---

## 8. Inspección de Comandos Futurex Excrypt

Los HSMs **Futurex Excrypt** emplean encuadre **Tag-Value**:
- La trama inicia con `[` y finaliza con `]`.
- Cada parámetro consta de una etiqueta de 2 caracteres (`AO`, `AG`, `BB`, etc.) seguida del valor y finalizada con punto y coma `;`.

### Ejemplo: Comando Echo
Al introducir `[AOECHO;AGhola;]`:
- Se desglosa `AO` como código de comando `ECHO`.
- Se desglosa `AG` como datos de usuario (*Context Data*).

![Inspección Futurex Excrypt](../assets/screenshots/03-futurex-command-inspection.png)

---

## 9. Correlación Automática de Petición ↔ Respuesta

En auditorías bancarias es indispensable verificar si la respuesta devuelta por el HSM concuerda con la petición original.

```mermaid
sequenceDiagram
    autonumber
    participant Host as Sistema Host
    participant HSM as HSM Hardware
    participant CHCI as Inspector CHCI

    Host->>HSM: Petición A0 (Generate Key) [Header: 0000]
    HSM-->>Host: Respuesta A1 (Key Generated) [Header: 0000, Error: 00]
    Host->>CHCI: Vincular Comando #2 con Comando #1
    Note over CHCI: 1. Header Match: 0000 == 0000<br/>2. Command Pair: A0 <-> A1<br/>3. Context Token Match
    CHCI-->>Host: Veredicto: CORRELACIÓN EXITOSA ✅
```

### Procedimiento:
1. Cree un comando #1 como `Petición` (`A0...`).
2. Cree un comando #2 como `Respuesta` (`A100...`).
3. En el comando #2, seleccione *"Vinculado al comando #1"*.
4. El bloque **"Vínculo Petición ↔ Respuesta"** verificará automáticamente la paridad de cabecera, código y contexto.

![Correlación Petición Respuesta](../assets/screenshots/05-correlation-request-response.png)

---

## 10. Visor Integrado de Documentación Hardware Offline

`chci` integra los manuales técnicos oficiales de los fabricantes accesibles sin conexión a red:
- **Botón en Cabecera**: Acceso directo al visor de documentación técnica.
- **Pestañas de Filtrado**: Permite filtrar por *"Todos"*, *"Capítulos"*, *"Comandos"* o *"Apéndices"*.
- **Búsqueda Instantánea**: Filtrado en tiempo real por código de comando (ej: `BF`, `A0`, `ECHO`) o descripción.
- **Markdown Enriquecido**: Resaltado sintáctico, filas AKB/Variant coloreadas, enlaces interactivos y avisos oficiales del fabricante.

![Visor de Documentación Hardware](../assets/screenshots/10-hardware-docs-viewer.png)

---

## 11. Simulador Oficial Utimaco Atalla AT1000

Para desarrollo y pruebas locales sin disponer de un dispositivo físico, `chci` integra el control del contenedor Docker oficial del simulador Atalla AT1000:

- **Telemetría en Vivo**: Estado del firmware SMOS SDK 5.6.4.1, número de serie `SIM123`, y Master File Keys (`MFK1: B196`, `AMK1: B9BC`).
- **Barra de Progreso Animada**: Monitoriza los 4 hitos de inicialización interna de Utimaco (~30s): Contenedor Docker, Kernel SMOS, Memoria Flash y Socket TCP :7000.
- **Monitor de Salud (Heartbeat)**: Sondeo continuo cada 4.5s que detecta caídas inesperadas del contenedor.
- **Pruebas Rápidas de Diagnóstico**: Botones para ejecutar en vivo comandos de prueba:
  - `<00#TEST#1234#>` (Echo).
  - `<9A#ID#>` (HSM Info / Firmware).
  - `<9A#KEY#>` (MFK Status).
- **Parada Automática y Garantizada**: Al cerrar la aplicación (`X`, `Alt+F4`, menú salir o terminación del proceso), el simulador se detiene y elimina automáticamente sin dejar puertos ni contenedores huérfanos.

![Consola del Simulador Atalla](../assets/screenshots/11-atalla-simulator-modal.png)

---

## 12. Conexiones Directas a Hardware y Ejecución en Vivo

Para validar comandos contra dispositivos reales o proxies bancarios:
- **Configuración de Protocolos**: Admite conexiones TCP directas, TLS cifrado o mTLS con autenticación mutua de certificados.
- **Credenciales y Certificados PEM**: Campos para configurar el certificado CA del servidor, el certificado de cliente y la clave privada de cliente en formato PEM.
- **Ejecución en Vivo con Diagnóstico de Red**: Botón *Play* en el editor para enviar la trama y recibir la respuesta en vivo con medición de latencia en milisegundos.

![Conexiones Directas a Hardware](../assets/screenshots/12-direct-hardware-connections.png)

---

## 13. Biblioteca de Sesiones, Historial y Exportación JSON

- **Biblioteca de Sesiones IndexedDB**: Guarde, cargue, clone y gestione múltiples sesiones de auditoría con todas sus pestañas, comandos y configuraciones intactas.
- **Importación/Exportación JSON con Zod**: Exportación en formato abierto `chci-session-v1.json` con validación rigurosa de esquema para compartir sesiones entre auditores.
- **Bitácora Plana `.chci_history`**: Registro automático en texto plano estilo `.bash_history` con marca temporal ISO, identificador de dispositivo, versión, dirección y trama cruda. Permite búsqueda rápida, reinserción de comandos y descarga directa del archivo.

### Biblioteca de Sesiones
![Biblioteca de Sesiones](../assets/screenshots/07-session-manager-modal.png)

### Historial de Auditoría (.chci_history)
![Historial chci_history](../assets/screenshots/08-history-modal.png)

---

## 14. Soporte Multilingüe (Español / English / Galego)

Toda la aplicación, catálogos, campos y diagnósticos de error cuentan con soporte idiomático completo:
- Selector en cabecera para conmutar al instante entre **Español (`ES`)**, **English (`EN`)** y **Galego (`GL`)** sin recargar la página ni perder el estado de la sesión activa.

![Interfaz en Inglés](../assets/screenshots/09-i18n-english.png)

---

## Resumen de Atajos y Procedimientos Rápidos

| Operación | Método / Atajo |
|---|---|
| **Nuevo Comando** | Botón `+` en cabecera o lista de comandos. |
| **Documentación Hardware** | Botón con icono de libro en cabecera. |
| **Simulador Atalla** | Botón con icono de servidor en cabecera o sidebar. |
| **Conexiones Directas** | Botón con icono de enlace en la tarjeta del dispositivo. |
| **Revelar Clave/PIN** | Clic en el icono de ojo en la fila de parámetro del panel de análisis. |
| **Ver Detalles de Parámetro** | Botón `(i)` en la fila del parámetro de la tabla. |
| **Exportar Sesión** | Sesiones -> Botón *Exportar JSON*. |
| **Descargar Bitácora** | Historial -> Botón *Descargar .chci_history*. |
| **Cerrar Diálogos** | Tecla `Escape` o clic fuera del modal. |
