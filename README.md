# Crypto Hardware Command Inspector (`chci`)

**Crypto Hardware Command Inspector** es una herramienta de inspección y análisis de tramas de comandos para dispositivos criptográficos hardware (**HSMs financieros, HSMs de propósito general, KMSs y HSMaaS**), disponible tanto para **Escritorio (Tauri v2 — Windows, Linux y macOS, 100% local y sin red)** como para **Web (entorno de pruebas estático)**.

---

## Dispositivos Soportados (MVP)

- **Utimaco Atalla AT1000** (`v8.50`, `v8.60`) — Tramas delimitadas posicionales `<CCC#campo1#campo2#>`
- **Thales payShield 10K** (`v1.9`, `v2.3`) — Cabecera configurable + código de comando/respuesta + campos posicionales/delimitados
- **Futurex Excrypt** (`v7.6.1`) — Pares Tag-Valor `[AOECHO;AGhola;]`

---

## Estructura del Monorepo

- `packages/parser-core` (`@chci/parser-core`): Motor de normalización, framing, validación Zod y correlación Petición ↔ Respuesta en TypeScript puro.
- `packages/device-specs` (`@chci/device-specs`): Catálogo declarativo de dispositivos, versiones, comandos y códigos de error bilingües (`es` / `en`).
- `apps/explorer` (`@chci/explorer`): Interfaz React 19 + Vite 7 + Metronic v9.5 + CodeMirror 6 + Tauri v2.
- `docs/`: PRD (`docs/PRD.md`), Plan (`docs/plan.md`), Guía de Usuario (`docs/user-guide/`) y Arquitectura (`docs/architecture/`).

---

## Comandos de Desarrollo

```bash
pnpm install
pnpm dev          # Levanta el servidor de desarrollo en http://localhost:5173
pnpm verify       # Ejecuta typecheck + lint + tests con cobertura + build
pnpm e2e          # Ejecuta la suite End-to-End con Playwright
```

---

## Licencia

Copyright (c) 2026 NeverWe1come. All rights reserved.
