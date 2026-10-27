# Marvell LiquidSecurity HSM — Comprehensive Command Verification & Audit Report

> **Generated**: 2026-10-27T22:49:54.901Z  
> **Auditor**: Crypto Hardware Command Inspector (`chci`) — Test Harness Suite  
> **Hardware Profile**: Marvell LiquidSecurity HSM (Firmware v3.4.0, extends v2.3.0)  
> **Framing Architecture**: Structured CLI (`<Command> <arg>=<val>...`) and Callable PKCS#11 (`C_Func(...)`)  
> **Audit Scope**: Complete Catalog (12 commands: 6 requests + 6 responses)  

---

## 1. Executive Summary

| Metric | Value | Status |
|---|---|---|
| **Total Commands Modeled & Audited** | **12** | ✅ PASS |
| **Request Commands (Host → HSM)** | **6** | ✅ PASS |
| **Response Commands (HSM → Host)** | **6** | ✅ PASS |
| **Parser Engine Match Rate** | **100% (12/12)** | ✅ PASS |
| **Sensitive Fields Protected (`••••••••`)** | **3 fields** | 🔒 SECURE |
| **AnalysisPanel Table-Fixed Layout** | **100% verified** | 🎨 UI PASS |
| **Zero Horizontal Scrollbar (`break-all`)** | **100% verified** | 🎨 UI PASS |

---

## 2. Command-by-Command Verification Table

| # | Code | Interface | Dir | Command Name | Cat | Fields Spec | Fields Parsed | Sensitive Masked | UI Table-Fixed | Result |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `KRN_STATUS` | 💻 CLI | 🔵 REQ | Get Kernel Status (Request) | Kernel and Diagnostics | 0 | 0 | — | ✅ | ✅ PASS |
| 2 | `PART_CREATE` | 💻 CLI | 🔵 REQ | Create Virtual Partition (Request) | Partitioning and Tenants | 2 | 2 | — | ✅ | ✅ PASS |
| 3 | `C_Initialize` | 📦 PKCS#11 | 🔵 REQ | Initialize PKCS#11 Provider (Request) | PKCS#11 Session Management | 0 | 0 | — | ✅ | ✅ PASS |
| 4 | `C_GenerateKey` | 📦 PKCS#11 | 🔵 REQ | Generate Secret Key (Request) | PKCS#11 Key Management | 2 | 2 | — | ✅ | ✅ PASS |
| 5 | `C_Encrypt` | 📦 PKCS#11 | 🔵 REQ | Encrypt Data C_Encrypt (Request) | PKCS#11 Cryptography | 2 | 2 | 🔒 1 | ✅ | ✅ PASS |
| 6 | `CLUSTER_SYNC` | 💻 CLI | 🔵 REQ | Synchronize HSM Cluster (Request) | High Availability | 0 | 0 | — | ✅ | ✅ PASS |
| 7 | `KRN_STATUS` | 💻 CLI | 🟢 RESP | Kernel Status Output (Response) | Kernel and Diagnostics | 1 | 1 | — | ✅ | ✅ PASS |
| 8 | `PART_CREATE` | 💻 CLI | 🟢 RESP | Create Virtual Partition (Response) | Partitioning and Tenants | 1 | 1 | — | ✅ | ✅ PASS |
| 9 | `C_Initialize` | 📦 PKCS#11 | 🟢 RESP | Initialize PKCS#11 Provider (Response) | PKCS#11 Session Management | 1 | 1 | — | ✅ | ✅ PASS |
| 10 | `C_GenerateKey` | 📦 PKCS#11 | 🟢 RESP | Generate Secret Key (Response) | PKCS#11 Key Management | 1 | 1 | 🔒 1 | ✅ | ✅ PASS |
| 11 | `C_Encrypt` | 📦 PKCS#11 | 🟢 RESP | Encrypt Data C_Encrypt (Response) | PKCS#11 Cryptography | 1 | 1 | 🔒 1 | ✅ | ✅ PASS |
| 12 | `CLUSTER_SYNC` | 💻 CLI | 🟢 RESP | Synchronize HSM Cluster (Response) | High Availability | 1 | 1 | — | ✅ | ✅ PASS |

---

## 3. Compliance and Security Guarantees

1. **Structured Multi-Interface Support**: Both CLI administration and OASIS PKCS#11 callable verbs were tested sequentially.
2. **Strict Masking Guarantee**: Every single cryptographic key, PIN block, and cryptogram marked with `sensitive: true` is strictly masked to `••••••••` in both memory and the AnalysisPanel UI.
3. **Table Layout Integrity**: Every parameter table features `table-fixed` width constraints, ensuring that values wrap with `break-all` without horizontal scroll.
4. **Zero Secrets in Code**: No sensitive material hardcoded in tests or specifications.
