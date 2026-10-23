# Crypto Hardware Command Inspector (`chci`) — Project Guidelines & ECC Standards

Este proyecto utiliza el framework operativo **ECC (Agent Operating System)** adaptado para **Antigravity**.

---

## 1. Principios Centrales de ECC

1. **Plan Before Execute**: Para cualquier cambio o funcionalidad que toque más de 1 archivo o requiera diseño arquitectónico, planificar primero las fases y módulos antes de generar código.
2. **Test-Driven Development (TDD)**: Diseñar interfaces y tests antes de implementar la lógica (`≥90%` cobertura en `parser-core`, `≥80%` global).
3. **Security-First**:
   - Cero hardcoding de claves API, tokens o credenciales privadas.
   - Validación y tipado estricto con **Zod** en boundaries de entrada de datos (comandos ASCII, archivos `.json` importados, archivos `.chci_history`).
   - Enmascarado por defecto de campos marcados como `sensitive: true` (PIN blocks, claves en claro, criptogramas sensibles).
   - Sanitización contra XSS e inyecciones en componentes web y CSP estricta sin permisos de red en Tauri.
4. **Inmutabilidad y Código Limpio**:
   - Tratar estados y datos como inmutables (evitar mutaciones in-place).
   - Funciones puras y responsabilidades separadas (`parser-core` 100% independiente de UI).
   - Tipado TypeScript estricto (`strict: true`, `noUncheckedIndexedAccess: true`) sin usar `any`.
5. **Commits y Control de Cambios**:
   - Formato Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`.
6. **Documentación Exhaustiva (Código y Usuario)**:
   - **En el código (TSDoc / JSDoc)**: Todas las interfaces públicas, funciones del motor (`parser-core`), especificaciones de dispositivos (`device-specs`) y componentes/hooks complejos deben tener comentarios TSDoc claros explicando propósito, parámetros, retorno y ejemplos de trama cuando aplique.
   - **Documentación de Usuario y Funcional (Bilingüe ES/EN)**: Mantener en `docs/user-guide/` y `docs/architecture/` guías detalladas con diagramas de flujo (Mermaid) y **capturas de pantalla reales generadas automáticamente con Playwright** (`docs/assets/screenshots/`) mostrando cada flujo de trabajo paso a paso.

---

## 2. Orquestación Obligatoria de Subagentes ECC (Regla Estricta)

En Antigravity, los perfiles de `.agents/ecc/agents/*.md` **NO se ejecutan solos a menos que el agente principal los defina e invoque explícitamente**. Por tanto, es **OBLIGATORIO** usar las herramientas `define_subagent` e `invoke_subagent` en cada fase del desarrollo:

### Cómo registrar e invocar un subagente ECC:
1. Leer el archivo `.agents/ecc/agents/<nombre>.md`.
2. Llamar a `define_subagent` con `Name: "ecc-<nombre>"` y el contenido de ese archivo como `SystemPrompt`.
3. Llamar a `invoke_subagent` delegándole la tarea específica.

### Subagentes de uso obligatorio en este proyecto:

| Subagente (`.agents/ecc/agents/`) | Cuándo es OBLIGATORIO invocarlo | Permisos (`EnableWriteTools`) |
|---|---|---|
| **`code-explorer`** | Al investigar documentación extensa en `docs/` (Futurex, Thales, Atalla) o explorar plantillas de Metronic sin contaminar el contexto principal. | `false` (Solo lectura) |
| **`tdd-guide`** | Al inicio de cada paquete/módulo para diseñar primero la suite de tests (Vitest) antes de la implementación. | `true` |
| **`typescript-reviewer`** & **`react-reviewer`** | Al terminar de implementar módulos de TypeScript (`parser-core`, `device-specs`) o componentes React (`apps/explorer`). | `false` (Auditoría) |
| **`security-reviewer`** | **Obligatorio antes de cada commit de cierre de fase.** Audita XSS, inyecciones, validación Zod, manejo de campos `sensitive` y configuración Tauri CSP. | `false` (Auditoría) |
| **`pr-test-analyzer`** & **`silent-failure-hunter`** | **Obligatorio en la puerta de QA de cada fase.** Verifica que los tests cubran casos límite (tramas truncadas, errores de formato) y que no existan fallos silenciados. | `false` (Auditoría) |
| **`e2e-runner`** / **`gan-evaluator`** | En las fases de UI (Fases 3 a 8) para verificar con Playwright que la aplicación real renderiza, parsea y persiste correctamente, y capturar capturas de pantalla reales (`docs/assets/screenshots/`) para la guía de usuario. | `true` |
| **`doc-updater`** & **`comment-analyzer`** | **Obligatorio en cada módulo y en la Fase 8.** Asegura JSDoc/TSDoc exhaustivo en el código y mantiene actualizada la Guía de Usuario, manuales de arquitectura y diagramas de flujo. | `true` / `false` |
| **`build-error-resolver`** / **`react-build-resolver`** | Cuando `pnpm verify` (`typecheck`, `lint`, `test`, `build`) falle. | `true` |

> **Regla de Bloqueo (Quality Gate):** Ninguna fase puede darse por completada ni commitearse sin haber ejecutado `pnpm verify` en verde **Y** haber recibido la validación de los subagentes de **QA (`pr-test-analyzer`)** y **Seguridad (`security-reviewer`)**.

---

## 3. Pila Tecnológica del Workspace

- **Monorepo**: `pnpm` workspaces (`apps/explorer`, `packages/parser-core`, `packages/device-specs`).
- **Frontend / UI**: React 19, Vite 7, TypeScript 5.9, Metronic v9.5.0 (ReUI + Radix UI + Tailwind CSS 4), CodeMirror 6, `react-intl` (ES/EN).
- **Escritorio**: Tauri v2 (Windows, Linux, macOS) 100% local, sin permisos de red.
- **Persistencia**: IndexedDB + Export/Import JSON (validado con Zod) + Historial en texto plano `.chci_history` estilo `.bash_history`.

---

## 4. Catálogo de Workflows y Skills Disponibles

Están integradas las herramientas y habilidades de ECC en `.agents/skills/`:
- **Comandos de ciclo de vida**:
  - `cmd-plan` / `cmd-plan-prd`: Planificación detallada y PRD.
  - `cmd-code-review` / `cmd-react-review`: Revisión exhaustiva de cambios locales antes de commitear.
  - `cmd-security-scan`: Escaneo de vulnerabilidades y credenciales expuestas.
  - `cmd-refactor-clean`: Limpieza de código muerto, imports obsoletos y simplificación.
  - `cmd-test-coverage`: Verificación de umbrales de cobertura.
- **Skills de dominio**: Más de 300 skills técnicas (`react-patterns`, `e2e-testing`, `security-review`, `vite-patterns`, `i18n-sync`, etc.) en `.agents/skills/`.
