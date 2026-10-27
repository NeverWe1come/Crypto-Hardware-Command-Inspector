# Crypto Hardware Command Inspector (`chci`)

[![CI](https://github.com/NeverWe1come/Crypto-Hardware-Command-Inspector/actions/workflows/ci.yml/badge.svg)](https://github.com/NeverWe1come/Crypto-Hardware-Command-Inspector/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tauri](https://img.shields.io/badge/Tauri-v2-orange.svg)](https://tauri.app/)
[![Offline](https://img.shields.io/badge/Security-100%25%20Offline%20Air--Gapped-emerald.svg)](#security-model)

**Crypto Hardware Command Inspector (`chci`)** is an air-gapped, zero-network cryptographic command inspection, debugging, and audit tool designed for payment system architects, HSM operators, and security engineers interacting with **Financial HSMs, General Purpose HSMs, and Key Management Systems (KMS)**.

Available as a native **Desktop application (Tauri v2 for Windows, Linux, and macOS — 100% offline, zero network permissions)** and as a **Web demonstration environment**.

---

## Key Features

- **Multi-Vendor Hardware Support**:
  - **Utimaco / Atalla AT1000** (`v8.50`, `v8.60`) — Delimited positional framing (`<CMD#field1#field2#>`).
  - **Thales payShield 10K** (`v1.9`, `v2.3`) — Header-positional framing with dynamic key length resolution (TR-31, Thales Key Blocks, `U`/`T`/`Z` variants).
  - **Futurex Excrypt** (`v7.6.1`) — Tag-value tokenized framing (`[AOECHO;AGdata;]`).
  - Catalog of 10+ devices across Financial HSM, General Purpose HSM, KMS, and HSMaaS.
- **Deep 8-Block Cryptographic Inspection Panel**:
  - General Info (Hardware, version, command code, direction mismatch warning).
  - Parameter Breakdown Table with bidirectional cursor/hover highlight in CodeMirror.
  - **Sensitive Field Masking by Default**: Cryptograms, keys under LMK, and PIN blocks are masked (`••••••••`) with one-click reveal.
  - Color-coded Frame View with byte offsets.
  - Official Vendor Error Code Explanations & Root Cause Diagnosis.
  - Graded Diagnostics (`error`, `warning`, `info`).
  - Expected Response Templates for request frames.
  - Automated Request ↔ Response Correlation (header match, command pair matching, echo tokens).
  - Official Manufacturer Release Notes.
- **Offline Persistence & Audit History**:
  - Local IndexedDB storage (`chci_db`) for session libraries.
  - Strict JSON export/import validated with **Zod** (`chci-session-v1.json`).
  - Flat append-only `.chci_history` audit trail formatted like `.bash_history`.
- **First-Class Bilingual Internationalization**:
  - 100% translated in **Spanish (`es`)** and **English (`en`)** with instant live toggle.

---

## Visual Overview

### Light Theme
![Catalog Overview Light](docs/assets/screenshots/01-catalog-overview-light.png)

### Dark Theme
![Catalog Overview Dark](docs/assets/screenshots/02-catalog-overview-dark.png)

---

## Security Model

1. **Zero Network Permissions (`connect-src 'none'`)**:
   - The desktop client enforces a strict Content Security Policy forbidding all outbound network connections (`connect-src 'none'`, `frame-src 'none'`).
   - No telemetry, analytics, or background requests are made.
2. **Web Sandbox Warning**:
   - In web demonstration mode, a prominent warning banner prevents accidental insertion of production cryptographic material.
3. **Transient Memory for Sensitive Data**:
   - Keys and PIN blocks are never written to unencrypted logs or localStorage. Switching active commands immediately resets all unmasked fields back to `••••••••`.

---

## Monorepo Architecture

```text
CryptoCommandExplorer/
├── packages/
│   ├── parser-core/       # Pure TypeScript framing engines, normalizer, and Zod schemas
│   └── device-specs/      # Declarative hardware specifications (Atalla, Thales, Futurex)
├── apps/
│   └── explorer/          # React 19 UI + CodeMirror 6 + Tauri v2 Desktop & Web Shell
├── docs/
│   ├── user-guide/        # Bilingual User Guides (es.md / en.md) with workflow diagrams
│   ├── architecture/      # Architectural Overview & Device Addition Guide
│   └── assets/            # Real high-res screenshots generated via Playwright
└── e2e/                   # Playwright end-to-end integration test suite
```

---

## Quickstart & Development

### Prerequisites
- Node.js 22+
- `pnpm` 10+
- (Optional for Desktop building) Rust 1.80+

### Installation & Commands

```bash
# Install dependencies
pnpm install

# Start local Vite development server (http://localhost:5173)
pnpm dev

# Run comprehensive verification (Typecheck + Lint + Coverage + Build)
pnpm verify

# Run Playwright E2E suite and automated screenshot capture
pnpm e2e

# Build web distribution with sandbox warning
pnpm build:web
```

---

## Documentation

- 📖 [Guía de Usuario en Español](docs/user-guide/es.md)
- 📖 [User Guide in English](docs/user-guide/en.md)
- 🏗️ [Technical Architecture Overview](docs/architecture/overview.md)
- 🔌 [How to Add a New Cryptographic Device](docs/architecture/adding-a-device.md)
- 📋 [Product Requirements Document (PRD)](docs/PRD.md)
- 🗺️ [Implementation Plan](docs/plan.md)

---

## License

Copyright (c) 2026 NeverWe1come. All rights reserved.
