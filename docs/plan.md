# Plan de Implementación y Criterios de Aceptación — Crypto Hardware Command Inspector (`chci`)

Este documento es la hoja de ruta ejecutable para la construcción autónoma de **Crypto Hardware Command Inspector (`chci`)** desde la Fase 0 hasta la Fase 8.

---

## Protocolo de Calidad y Subagentes ECC por Fase

Cada fase **DEBE** cumplir estos requisitos antes de hacer commit y push a la rama `develop`:
1. **Diseño de Tests primero (TDD)**: Invocar o seguir el flujo de `ecc-tdd-guide` antes de implementar la lógica.
2. **Verificación Mecánica**: `pnpm verify` (`pnpm typecheck && pnpm lint && pnpm test && pnpm build`) debe terminar con código `0`.
3. **Auditoría de Subagentes ECC**:
   - `ecc-typescript-reviewer` (y `ecc-react-reviewer` cuando haya `.tsx`)
   - `ecc-pr-test-analyzer` (QA y cobertura de casos límite)
   - `ecc-security-reviewer` (Seguridad, Zod, enmascarado `sensitive`, CSP, `.gitignore`)
4. **Control de Versiones**: Commit siguiendo Conventional Commits (`feat:`, `test:`, `docs:`, `chore:`) y `git push origin develop`.

---

## Fase 0 — Bootstrap del Repositorio y Monorepo
- Configurar git local con remoto `https://github.com/NeverWe1come/Crypto-Hardware-Command-Inspector.git`, rama `develop`, `.gitignore` protegiendo `metronic-v9.5.0/` y las carpetas de documentación de fabricantes en `docs/*/`, y submódulo `.agents/ecc`.
- Actualizar `LICENSE` a propietario (`All rights reserved`).
- Configurar monorepo `pnpm` (`pnpm-workspace.yaml`, `tsconfig.base.json`, ESLint 9, Prettier, Vitest, Playwright).
- Inicializar paquetes `@chci/parser-core`, `@chci/device-specs` y `@chci/explorer` (extrayendo componentes ReUI/Metronic v9.5 limpios sin Supabase ni páginas demo).
- **Criterio de aceptación**: `pnpm verify` pasa en verde y `git push origin develop` funciona.

---

## Fase 1 — `@chci/parser-core` (Motor de Parsing Puro en TDD)
- Definir tipos inmutables en `packages/parser-core/src/types.ts` y esquemas de validación Zod en `packages/parser-core/src/schema.ts`.
- Implementar `normalizer.ts`: normalización de tramas ASCII, preservación de offsets y representación visual de caracteres de control (`<STX>`, `<ETX>`, `␙` / `0x19`, etc.).
- Implementar los 3 motores de framing del MVP:
  1. `delimited-positional.ts` (Atalla AT1000 `<cmd#field1#field2#>`)
  2. `header-positional.ts` (Thales payShield 10K con longitud de cabecera configurable, código de comando/respuesta de 2 caracteres, código de error de 2 dígitos en respuestas, campos fijos/variables/delimitados y trailer opcional)
  3. `tag-value.ts` (Futurex Excrypt `[AOVALUE;TAGVALUE;...]`)
- Implementar `engine.ts`: resolución de versión con soporte de herencia (`extends`), detección automática de dirección (`request` vs `response`), mapeo de campos, decodificación, enmascarado de metadatos `sensitive`, evaluación de enumeraciones, diagnóstico de errores y correlación petición ↔ respuesta (`correlateCommands`).
- **Criterio de aceptación**: Cobertura de tests ≥ 90% en `@chci/parser-core` validada por `vitest --coverage`, auditoría de `ecc-typescript-reviewer`, `ecc-silent-failure-hunter`, `ecc-pr-test-analyzer` y `ecc-security-reviewer`.

---

## Fase 2 — `@chci/device-specs` (Catálogo y Especificaciones Reales de Fabricantes)
- Incorporar resultados de `ecc-code-explorer` sobre la documentación oficial en `docs/`:
  1. **Utimaco Atalla AT1000** (`v8.50` y `v8.60` con herencia de versión)
  2. **Thales payShield 10K** (`v1.9` y `v2.3` con herencia de versión)
  3. **Futurex Excrypt** (`v7.6.1`)
- Incluir el catálogo completo del sidebar para las familias `KMS`, `HSM` y `HSMaaS` (marcando los dispositivos no incluidos en el MVP como `coming-soon`).
- Garantizar textos bilingües (`es` y `en`) en todos los comandos, campos, enums, códigos de error y notas, además de la referencia documental (`source`).
- Crear tests con fixtures reales de petición y respuesta por cada comando soportado.
- **Criterio de aceptación**: 100% de las specs superan la validación Zod bilingüe y todos los fixtures reales de petición y respuesta se parsean sin errores inesperados.

---

## Fase 3 — Shell de la Aplicación, Estado Inmutable e Internacionalización (`es` / `en`)
- Configurar `react-intl` con catálogos `es.json` y `en.json` + test automático de paridad de claves.
- Implementar el estado global inmutable (`WorkspaceContext` + `workspaceReducer`) gestionando pestañas de dispositivos, comandos por pestaña, comando activo, longitud de cabecera por pestaña y preferencias de interfaz.
- Construir con componentes de Metronic v9.5:
  - **Header**: Logo/nombre `Crypto Hardware Command Inspector`, breadcrumb de familia y dispositivo activo, selector de idioma (`ES`/`EN`), selector de tema claro/oscuro (`next-themes`, oscuro por defecto), botón de Historial (`.chci_history`) y botón de Sesiones.
  - **Sidebar de Catálogo**: Buscador instantáneo y grupos desplegables (`KMSs`, `HSMs`, `HSMaaS`) con iconos y estado (`Supported` / `Coming Soon`).
  - **Barra de Pestañas**: Selección, cierre y botón `+`; abrir un dispositivo ya abierto reactiva su pestaña existente sin duplicarla.
  - **Layout de 3 Columnas Redimensionable**: Usando `ResizablePanelGroup` de Metronic.
- **Criterio de aceptación**: Tests unitarios y de componentes en verde para pestañas (no duplicación), buscador, tema e i18n.

---

## Fase 4 — Lista de Comandos y Editor Interactivo CodeMirror 6
- Implementar la vista central del dispositivo activo:
  - Cabecera del dispositivo con icono, categoría, configuración rápida de framing (ej. longitud de cabecera en Thales) y botón `+ Nuevo comando`.
  - Lista de comandos de la sesión con reordenación drag-and-drop (`@dnd-kit/sortable`), número de orden, preview coloreada con badge de operación/código, selector de `Versión`, selector de `Tipo` (`Input` / `Output`) y botón de eliminar.
- Implementar el bloque inferior de edición del comando seleccionado:
  - Cabecera con nombre `Comando #N`, badge de código, selector de vinculación (`Vinculado al comando #M`), botones copiar, duplicar y eliminar, y selectores de `Versión` y `Tipo`.
  - Editor **CodeMirror 6** con decoración coloreada por cada segmento parseado, representación de caracteres de control ASCII y sincronización de cursor/hover con el panel de análisis.
- **Criterio de aceptación**: Tests de reducer y componentes en verde; el editor resalta los segmentos y actualiza el parseo en tiempo real.

---

## Fase 5 — Panel de Análisis Detallado (Derecha)
- Implementar el panel derecho `Detalles del comando` con paginador `1 de N` (`<` / `>`) y bloques desplegables (`Accordion`):
  1. **Información general**: Tipo/código de comando, dirección seleccionada vs detectada, versión, ruta/categoría, descripción y referencia al manual del fabricante.
  2. **Parámetros / Desglose de campos**: Tabla con nombre de campo/tag, valor crudo, valor decodificado/tipo y descripción/significado.
     - Sincronización bidireccional hover/click con el editor CodeMirror.
     - Enmascarado por defecto (`••••••••`) de campos con `sensitive: true` y botón individual/global para mostrar/ocultar.
  3. **Vista de trama**: Segmentos coloreados con leyenda de offsets (`[start..end]`).
  4. **Código de respuesta / error**: Significado detallado del código devuelto en tramas de respuesta.
  5. **Diagnósticos**: Alertas de longitud, campos obligatorios ausentes, valores fuera de enum o dirección incoherente.
  6. **Respuesta esperada**: Estructura y ejemplo de la respuesta esperada cuando se inspecciona una petición (`Input`).
  7. **Vínculo petición ↔ respuesta**: Validación cruzada cuando el comando está vinculado a otro comando de la pestaña.
  8. **Notas**: Notas técnicas del fabricante.
- **Criterio de aceptación**: Tests de componentes y E2E preliminares verificando el desglose de Atalla AT1000, Thales payShield 10K y Futurex Excrypt en español e inglés.

---

## Fase 6 — Persistencia Local (IndexedDB), Biblioteca de Sesiones e Historial `.chci_history`
- Implementar adaptador de almacenamiento local (`IndexedDB`) con autoguardado de la sesión activa y gestión de biblioteca de sesiones con nombre (guardar, cargar, duplicar, borrar, restaurar sesión de demostración con ejemplos precargados).
- Implementar Exportación e Importación de sesiones en JSON con versión de esquema (`schemaVersion: 1`) y validación estricta con Zod al importar.
- Implementar el historial en texto plano estilo `.bash_history` (`.chci_history`):
  - Formato: `ISO_TIMESTAMP | DEVICE_ID | VERSION | DIRECTION | RAW_COMMAND`.
  - Parser y serializador testeados unitariamente.
  - En Escritorio (Tauri): escritura append en el archivo `.chci_history` local.
  - En Web y Escritorio: visor/buscador interactivo de historial dentro de la app (filtrable por texto y dispositivo, con clic para reabrir el comando) y botones para descargar/importar `.chci_history`.
- **Criterio de aceptación**: Tests unitarios del serializador/validador de sesiones y de `.chci_history` + tests de integración de persistencia en verde.

---

## Fase 7 — Empaquetado Escritorio (Tauri v2), Web/Docker y CI/CD en GitHub Actions
- Crear `apps/explorer/src-tauri` para Tauri v2:
  - `tauri.conf.json` con `productName: "Crypto Hardware Command Inspector"`, `identifier: "com.chci.app"`, CSP estricta y sin permisos de red.
  - Capabilities mínimas sólo para abrir/guardar archivos locales de sesión e historial.
- Añadir banner de entorno de pruebas en la versión Web pública (`VITE_TARGET=web`).
- Añadir `Dockerfile` y `nginx.conf` endurecido para despliegue web estático.
- Crear workflows `.github/workflows/ci.yml` (`pnpm verify` + `pnpm e2e`) y `.github/workflows/release.yml` (compilación multiplataforma Windows, Linux y macOS con `tauri-action` al publicar tags `v*`).
- **Criterio de aceptación**: `pnpm verify` en verde, configuración Tauri validada por `ecc-security-reviewer` y workflows listos.

---

## Fase 8 — Documentación Exhaustiva, Capturas Automáticas con Playwright y PR Final
- Auditar todos los comentarios TSDoc/JSDoc del código con `ecc-comment-analyzer`.
- Ejecutar suite E2E completa y script de generación de capturas de pantalla reales con Playwright (`ecc-e2e-runner`) guardando las imágenes en `docs/assets/screenshots/`:
  - Vista general y catálogo de hardware (tema oscuro y claro)
  - Inspección de comando Futurex Excrypt (`[AOECHO;AGhola;]`, cifrado/PIN)
  - Inspección de comando Thales payShield 10K (petición, respuesta y desglose de campos sensibles enmascarados/revelados)
  - Inspección de comando Utimaco Atalla AT1000 (`<31#...#>` y diagnóstico de errores)
  - Correlación Petición ↔ Respuesta vinculada
  - Biblioteca de sesiones e Historial `.chci_history`
  - Cambio de idioma Español / Inglés
- Generar con `ecc-doc-updater`:
  - `docs/user-guide/es.md` y `docs/user-guide/en.md` con diagramas de flujo Mermaid y capturas de pantalla incrustadas.
  - `docs/architecture/overview.md` y `docs/adding-a-device.md`.
  - `README.md` principal completo.
- Ejecutar pasadas finales de calidad y seguridad (`ecc-typescript-reviewer`, `ecc-react-reviewer`, `ecc-silent-failure-hunter`, `ecc-pr-test-analyzer`, `ecc-security-reviewer`, `pnpm verify`, `pnpm e2e`).
- Hacer push de `develop` y abrir el Pull Request `develop → master` en GitHub.
