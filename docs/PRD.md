# Product Requirements Document (PRD) — Crypto Hardware Command Inspector (`chci`)

**Version:** 1.0.0  
**Status:** Approved  
**Repository:** [NeverWe1come/Crypto-Hardware-Command-Inspector](https://github.com/NeverWe1come/Crypto-Hardware-Command-Inspector) (Private)

---

## 1. Problem Statement & Vision

Cryptographic hardware engineers, payment security specialists, and HSM administrators work daily across heterogeneous hardware security modules (Financial HSMs, General-Purpose HSMs, KMSs, and HSMaaS) from multiple vendors. Each vendor uses its own proprietary ASCII framing protocol:
- **Utimaco Atalla AT1000**: Positional fields delimited by `#` inside `<...#>` (e.g., `<31#1#...#>`).
- **Thales payShield 10K**: Configurable message header + 2-character command/response code + fixed/variable positional fields or `;` delimiters (e.g., `0000NC`, `0000ND00...`, `0000CA...`).
- **Futurex Excrypt**: Tag-value pairs separated by `;` inside `[...]` where each 2-character tag identifies the parameter (`[AOECHO;AGhola;]`).

Debugging raw command frames and error responses by manually counting character offsets in 1,000+ page vendor PDFs is slow, error-prone, and risky when handling sensitive cryptographic material.

**Crypto Hardware Command Inspector (`chci`)** provides a modern, human-readable, 100% client-side visual command inspector for both **Desktop (Tauri v2 — Windows, Linux, macOS, 100% offline & private)** and **Web (Static React SPA for testing/sandbox use)**.

---

## 2. Target Platforms & Privacy Model

1. **Desktop Application (Tauri v2 — Windows, Linux, macOS)**:
   - Runs 100% locally and offline.
   - Strict Content Security Policy (CSP) and **zero network permissions** (`http`/`fetch` disabled at the Tauri capability level) so sensitive production commands can never leave the user's machine.
   - Local storage via IndexedDB + native file dialogs for JSON session export/import + automatic append-only plain-text history file (`.chci_history`, inspired by `.bash_history`).
2. **Public Web Application (Static SPA)**:
   - Shares the exact same React 19 + Metronic v9.5 codebase and pure TypeScript parser engine (`@chci/parser-core`).
   - Displays a persistent security banner reminding users that the public web version is a testing/sandbox environment and no sensitive production keys or PIN blocks should be pasted.

---

## 3. MVP Hardware Catalog & Scope

### Supported MVP Devices (Full Parsing & Multi-Version Specs)
1. **Utimaco Atalla AT1000** (`HSM_FINANCIAL` — `delimited-positional` framing)
   - Firmware versions: **`v8.50`** and **`v8.60`**
2. **Thales payShield 10K** (`HSM_FINANCIAL` — `header-positional` framing)
   - Firmware versions: **`v1.9`** (`v1.9a`) and **`v2.3`** (`v2.3a`)
3. **Futurex Excrypt** (`HSM_FINANCIAL` — `tag-value` framing)
   - Firmware version: **`v7.6.1`**

### Catalog Entries Listed as "Coming Soon" (`coming-soon`)
Grouped in the left sidebar under three families:
- **KMSs**: AWS KMS, Azure Key Vault, Google Cloud KMS, HashiCorp Vault, Thales CipherTrust KMS, IBM Key Protect.
- **HSMs**: Utimaco Atalla AT1000 (Supported), Thales payShield 10K (Supported), Futurex Excrypt (Supported), Marvell LiquidSecurity, Thales Luna, IBM nShield, SafeNet, HPE Keyper.
- **HSMaaS**: Azure Payment HSM, AWS CloudHSM, Google Cloud HSM, Thales Luna HSMaaS, IBM Cloud HSM.

---

## 4. Core Functional Requirements

### FR-1: Hardware Catalog & Device Workspace Tabs
- Searchable left sidebar grouped by hardware category (`KMSs`, `HSMs`, `HSMaaS`).
- Selecting a supported hardware device opens a dedicated workspace tab.
- **Single-Tab-Per-Device Rule**: If a tab for the selected hardware already exists, the application activates that existing tab instead of creating a duplicate tab.

### FR-2: Session Command List & Editor
- Each device tab manages an ordered list of commands (`CommandEntry`).
- Users can:
  - Add new commands (`+ Nuevo comando` / `+ Añadir comando`).
  - Reorder commands via drag-and-drop (`@dnd-kit/sortable`).
  - Select firmware **Version** per command.
  - Select command **Direction** (`Input` / Request vs. `Output` / Response).
  - Link a response command to a corresponding request command (`Vinculado al comando #N`).
  - Edit the raw ASCII command inside a **CodeMirror 6** editor with:
    - Color-coded segment decorations synchronized with the parsed fields.
    - Visible markers for ASCII control characters (`<STX>`, `<ETX>`, `␙` / `0x19`).
    - Copy, duplicate, and delete actions.

### FR-3: Pure TypeScript Parsing Engine (`@chci/parser-core`)
- Normalizes ASCII input and preserves exact character offsets (`start`, `end`) for every parsed segment.
- Supports three framing engines in the MVP:
  1. `delimited-positional` (Atalla AT1000 `<cmd#field1#field2#>`)
  2. `header-positional` (Thales payShield 10K configurable header + 2-char code + positional/delimited fields + optional trailer)
  3. `tag-value` (Futurex Excrypt `[AOVALUE;TAGVALUE;...]`)
- Automatically detects command direction (`request` vs `response`) and emits a diagnostic warning if the user's selected direction conflicts with the detected frame type.
- Validates field lengths, required fields, character encodings (`ascii`, `hex-ascii`, `decimal`, `base64`), and enumerations.
- Resolves vendor error codes on responses.

### FR-4: Right-Side Command Analysis Panel
- Displays pagination (`1 de N`) and quick navigation (`<`, `>`) across the active tab's commands.
- Expandable/collapsible Metronic `Accordion` blocks:
  1. **General Information (`Información general`)**: Command code, name, direction (selected vs. detected), firmware version, description, and manual source reference.
  2. **Field Breakdown / Parameters (`Parámetros` / `Desglose de campos`)**: Table of Field Name, Raw Value, Decoded Value, and Meaning/Description.
     - **Bidirectional Highlight**: Hovering or clicking a row highlights its exact character span in the editor, and placing the cursor in the editor highlights the corresponding table row.
     - **Sensitive Field Masking**: Any field marked `sensitive: true` (e.g., PIN blocks, clear keys, cryptograms, CVVs) is masked (`••••••••`) by default with an explicit toggle to reveal/hide.
  3. **Color-Coded Frame View (`Vista de trama`)**: Visual token breakdown of the raw frame.
  4. **Response / Error Code (`Código de respuesta / error`)**: Shown for responses, highlighting success (`00`) or detailed error causes and troubleshooting hints.
  5. **Diagnostics (`Diagnósticos`)**: Warnings and errors for truncated frames, invalid lengths, unknown tags, or direction mismatches.
  6. **Expected Response (`Respuesta esperada`)**: Shown for requests, detailing the expected response code and response field structure.
  7. **Request ↔ Response Correlation (`Vínculo petición ↔ respuesta`)**: When linked to another command in the tab, verifies header matching, command/response code pair (`NC` ↔ `ND`, `CA` ↔ `CB`, `<31#...>` ↔ `<41#...>`), and error status.
  8. **Vendor Notes (`Notas`)**: Important usage notes and version-specific caveats from the vendor documentation.

### FR-5: Persistence, Named Sessions & `.chci_history`
- **Auto-saved Active Session & Session Library (IndexedDB)**: Automatic debounced persistence plus ability to save named sessions, load, duplicate, and delete them.
- **JSON Export / Import**: Schema-versioned JSON export and Zod-validated import (using native OS dialogs in Tauri and file download/upload in Web).
- **Bash-Style Plain-Text Command History (`.chci_history`)**:
  - Format: `ISO_TIMESTAMP | DEVICE_ID | VERSION | DIRECTION | RAW_COMMAND` (one line per inspected command).
  - In Desktop (Tauri): appends automatically to `.chci_history` in the local app data directory and can be exported/opened directly.
  - In Web: stored locally in the same line-oriented format with 1-click download/import of `.chci_history` and an in-app searchable history drawer.

### FR-6: Full Bilingual Support (`es` / `en`)
- Full UI and device specification localization in **Spanish (`es`)** and **English (`en`)** powered by `react-intl`.
- Every command name, description, field label, field description, enum meaning, error code, and note in `@chci/device-specs` includes both `es` and `en` texts, enforced at test time via Zod.

---

## 5. Non-Functional Requirements

- **Type Safety**: TypeScript 5.9 with `strict: true` and `noUncheckedIndexedAccess: true`; zero `any`.
- **Test Coverage**: ≥ 90% in `@chci/parser-core`, ≥ 80% global unit/component coverage, plus Playwright E2E coverage of all core workflows.
- **Documentation**:
  - Comprehensive TSDoc/JSDoc comments across all public APIs, framing engines, specs, and React components.
  - Bilingual User Guide (`docs/user-guide/es.md`, `docs/user-guide/en.md`) illustrated with Mermaid flowcharts and real high-resolution Playwright screenshots (`docs/assets/screenshots/`).
  - Technical Architecture Guide (`docs/architecture/overview.md`) and Developer Extensibility Guide (`docs/adding-a-device.md`).
