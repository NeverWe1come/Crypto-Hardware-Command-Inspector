/**
 * @packageDocumentation
 * Immutable TypeScript contracts and data structures for `@chci/parser-core`.
 *
 * This module defines the vendor-neutral specification model (`DeviceSpec`, `CommandSpec`,
 * `FieldSpec`, `FramingConfig`) and the output structures produced by the parsing and
 * request/response correlation engine (`ParseResult`, `ParsedField`, `FrameSegment`,
 * `ParseDiagnostic`, `CorrelationResult`).
 */

/**
 * Bilingual string map required for all human-facing specification metadata.
 * Ensures 100% parity between Spanish (`es`) and English (`en`) across the UI and docs.
 */
export interface LocalizedString {
  readonly es: string;
  readonly en: string;
  readonly gl?: string;
}

/**
 * High-level cryptographic hardware family used for grouping devices in the catalog sidebar.
 * - `KMS`: Key Management Systems (e.g., AWS KMS, HashiCorp Vault)
 * - `HSM_FINANCIAL`: Payment / Financial Hardware Security Modules (e.g., Atalla AT1000, Thales payShield 10K, Futurex Excrypt)
 * - `HSM_GP`: General Purpose Hardware Security Modules (e.g., Thales Luna, Marvell LiquidSecurity)
 * - `HSMAAS`: Cloud-hosted HSM-as-a-Service offerings (e.g., Azure Payment HSM, AWS CloudHSM)
 */
export type DeviceCategory = 'KMS' | 'HSM_FINANCIAL' | 'HSM_GP' | 'HSMAAS';

/**
 * Availability status of a hardware device in the inspector catalog.
 */
export type CatalogStatus = 'supported' | 'coming-soon';

/**
 * Supported wire/ASCII framing architectures in the MVP parser engine.
 * - `delimited-positional`: Start/end markers with delimiter-separated positional tokens (e.g., Utimaco Atalla AT1000 `<CMD#f1#f2#>`).
 * - `header-positional`: Fixed-length message header followed by command/response code and positional/delimited fields (e.g., Thales payShield 10K `0000NC`).
 * - `tag-value`: Bracketed semicolon-delimited `TAG` + `VALUE` pairs (e.g., Futurex Excrypt `[AOECHO;AGHello;]`).
 * - `structured`: Structured protocols such as REST JSON, KMIP XML, Callable C APIs (PKCS#11, IBM CCA), and CLI commands.
 */
export type FramingType =
  | 'delimited-positional'
  | 'header-positional'
  | 'tag-value'
  | 'structured';

/**
 * High-level categorization of an interface exposed by a cryptographic device.
 * - `standard`: Industry standard specifications (e.g., OASIS PKCS#11, OASIS KMIP, IBM EP11).
 * - `proprietary`: Vendor-proprietary protocols (e.g., Thales Host frames, Atalla command language, CCA verbs, REST APIs, CLIs).
 */
export type DeviceInterfaceKind = 'standard' | 'proprietary';

/**
 * Wire/payload serialization format used by a device interface.
 */
export type InterfaceWireFormat =
  | 'ascii-frame'
  | 'json'
  | 'xml'
  | 'callable'
  | 'cli'
  | 'binary-hex';

/**
 * Specification of an interface exposed by a cryptographic hardware device.
 */
export interface DeviceInterfaceSpec {
  readonly id: string;
  readonly name: LocalizedString;
  readonly shortLabel: string;
  readonly kind: DeviceInterfaceKind;
  readonly wireFormat: InterfaceWireFormat;
  readonly description: LocalizedString;
  readonly framing: FramingConfig;
  readonly exampleCommand?: string;
}

/**
 * Direction of a cryptographic hardware message frame.
 * - `request`: Host -> HSM command (`Input`)
 * - `response`: HSM -> Host reply (`Output`)
 */
export type CommandDirection = 'request' | 'response';

/**
 * Character encoding rule for validating and decoding a field's raw ASCII value.
 */
export type FieldEncoding =
  | 'ascii'
  | 'hex-ascii'
  | 'decimal'
  | 'base64'
  | 'alphanumeric'
  | 'binary-hex';

/**
 * Length rule for extracting and validating a field inside a command frame.
 *
 * Examples:
 * - `{ kind: 'fixed', length: 4 }`: Exactly 4 characters.
 * - `{ kind: 'range', min: 1, max: 16 }`: Variable length between 1 and 16 characters.
 * - `{ kind: 'variable' }`: Unbounded or remainder-of-token variable length.
 * - `{ kind: 'delimited', delimiter: ';' }`: Reads until the specified delimiter character.
 * - `{ kind: 'thales-key' }`: Self-describing Thales key scheme/length:
 *   - 16 hex chars (single-length key)
 *   - 32 hex chars (double-length key without prefix)
 *   - `'Z' + 16 hex` (17 chars)
 *   - `'U' + 32 hex` (33 chars)
 *   - `'T' + 48 hex` (49 chars)
 *   - `'S' + 4-digit decimal total length + payload` (Thales Key Block, e.g. `S0096...` = 96 chars total)
 *   - `'R' + 4-digit decimal total length + payload` (TR-31 Key Block, e.g. `R0080...` = 80 chars total)
 */
export type FieldLengthSpec =
  | { readonly kind: 'fixed'; readonly length: number }
  | { readonly kind: 'range'; readonly min: number; readonly max: number }
  | { readonly kind: 'set'; readonly values: readonly number[] }
  | { readonly kind: 'variable'; readonly min?: number; readonly max?: number }
  | { readonly kind: 'delimited'; readonly delimiter: string }
  | { readonly kind: 'thales-key' };

/**
 * Field presence mode according to hardware command specification:
 * - `required`: Field must be present and non-empty.
 * - `may-be-empty`: Field token must be present, but its content may be empty (`##`).
 * - `optional`: Field may be omitted entirely from the end of the frame or present.
 */
export type FieldPresence = 'required' | 'may-be-empty' | 'optional';

/**
 * Key management mode for hardware commands (specifically Atalla AT1000).
 */
export type KeyManagementMode = 'akb' | 'variant';

/**
 * Command discriminator configuration to accurately match polymorphic command subvariants.
 */
export interface CommandDiscriminator {
  /** Zero-based positional token index to test (defaults to 0 for field after command code). */
  readonly fieldIndex: number;
  /** Match type: exact string match, oneOf value list, or beforeComma token prefix. */
  readonly match: 'exact' | 'oneOf' | 'beforeComma' | 'keyword';
  /** Value or list of matching values. */
  readonly values: readonly string[];
}

/**
 * Discrete allowed value for an enumerated field parameter.
 */
export interface FieldEnumOption {
  readonly value: string;
  readonly label: LocalizedString;
  readonly description?: LocalizedString;
}

/**
 * Key management mode specific specification for a field
 * (e.g., AKB Pink `#FFDDD3`, Variant Purple `#C1BADC`, or both Unshaded).
 */
export interface FieldModeVariant {
  readonly mode: 'akb' | 'variant' | 'both';
  readonly lengthText: string;
  readonly length: FieldLengthSpec;
  readonly description: LocalizedString;
}

/**
 * Condition determining whether an optional/dependent field is active based on a prior field's value.
 */
export interface FieldCondition {
  readonly fieldId: string;
  readonly equals: string | readonly string[];
}

/**
 * Specification of a single parameter/field within a hardware command or response.
 */
export interface FieldSpec {
  readonly id: string;
  readonly name: LocalizedString;
  readonly description: LocalizedString;
  /** Two-character or multi-character tag identifier used in `tag-value` framing (e.g., `'AG'`, `'AF'`). */
  readonly tag?: string;
  /** Zero-based positional index used in positional framing protocols. */
  readonly position?: number;
  readonly length: FieldLengthSpec;
  readonly encoding: FieldEncoding;
  readonly required: boolean;
  /** Presence requirement: 'required', 'may-be-empty' ([FIELD]), or 'optional' ([FIELD#]). */
  readonly presence?: FieldPresence;
  /** Literal length description directly from manual (e.g. "16, 32", "0, 74, 90, 106, 110", "varies"). */
  readonly lengthText?: string;
  /** Whether this field accepts a volatile table memory reference. */
  readonly allowsVolatileLocation?: boolean;
  /** Optional repeat group identifier for nested repeating fields. */
  readonly repeatGroup?: string;
  /**
   * Marks cryptographic material that must be masked by default (`••••••••`) in the UI and logs
   * (e.g., PIN blocks, clear keys, cryptograms, CVV/CVC values).
   */
  readonly sensitive?: boolean;
  /** Optional prefix delimiter preceding this field in positional frames (e.g., `';'` or `'%'`). */
  readonly prefixDelimiter?: string;
  readonly enumValues?: readonly FieldEnumOption[];
  readonly condition?: FieldCondition;
  readonly notes?: LocalizedString;
  readonly example?: string;
  /** Specific sub-specifications when field properties differ between AKB, Variant, or Both. */
  readonly variants?: readonly FieldModeVariant[];
}

/**
 * Example command frame associated with a command specification.
 */
export interface CommandExampleSpec {
  readonly title: LocalizedString;
  readonly raw: string;
  readonly description?: LocalizedString;
}

/**
 * Complete specification for a single request or response command in a hardware firmware version.
 */
export interface CommandSpec {
  readonly id: string;
  /** Primary command or response identifier (e.g., `'00'`, `'31'`, `'NC'`, `'ND'`, `'ECHO'`). */
  readonly code: string;
  /**
   * Optional subcommand discriminator when a single command code serves multiple structures
   * (e.g., Atalla command `'31'` with field 1 = `'1'` vs `'7'`).
   */
  readonly subCode?: string;
  /** Zero-based index of the positional field used to match `subCode` (defaults to `0`). */
  readonly subCodeFieldIndex?: number;
  /** Advanced discriminator for polymorphic command subvariants. */
  readonly discriminator?: CommandDiscriminator;
  /** Subvariant localized label (e.g., "IBM 3624", "DUKPT", "Identikey"). */
  readonly subVariant?: LocalizedString;
  /** Command syntax signature from the reference manual. */
  readonly syntax?: string;
  /** Key management compatibility matrix declared in manual. */
  readonly keyManagement?: readonly {
    readonly mode: KeyManagementMode;
    readonly defaultEnabled: boolean;
    readonly mfk: string;
  }[];
  /** Specific parameter fields separated by key management mode (AKB vs Variant). */
  readonly fieldsByMode?: Partial<Record<KeyManagementMode, readonly FieldSpec[]>>;
  /** Mode-specific usage notes. */
  readonly usageNotes?: Partial<Record<KeyManagementMode, readonly LocalizedString[]>>;
  readonly direction: CommandDirection;
  /** Expected counterpart command/response code for correlation (e.g., `'ND'` for `'NC'`). */
  readonly pairedCode?: string;
  readonly name: LocalizedString;
  readonly summary: LocalizedString;
  readonly description: LocalizedString;
  readonly category: LocalizedString;
  readonly fields: readonly FieldSpec[];
  /** Official vendor manual citation (document title, section, page). */
  readonly source: string;
  readonly notes?: readonly LocalizedString[];
  readonly examples?: readonly CommandExampleSpec[];
  /** Full raw Markdown documentation extracted from official reference manuals */
  readonly markdownDoc?: LocalizedString;
  /** Optional identifier linking this command to a specific device interface */
  readonly interfaceId?: string;
}

/**
 * Vendor-specific response or error status code definition.
 */
export interface ErrorCodeSpec {
  readonly code: string;
  readonly title: LocalizedString;
  readonly description: LocalizedString;
  readonly troubleshooting?: LocalizedString;
}

/**
 * Framing configuration for Utimaco Atalla AT1000 style `<CMD#field1#field2#>` frames.
 */
export interface DelimitedPositionalFramingConfig {
  readonly type: 'delimited-positional';
  readonly startDelimiter: string;
  readonly endDelimiter: string;
  readonly fieldDelimiter: string;
  readonly requireTrailingDelimiter?: boolean;
  /** Optional context echo tag prefix before the closing delimiter (e.g., `'^'` for `^MYCTX#>`). */
  readonly contextTagPrefix?: string;
}

/**
 * Framing configuration for Thales payShield 10K style `[Header]CC...` frames.
 */
export interface HeaderPositionalFramingConfig {
  readonly type: 'header-positional';
  readonly defaultHeaderLength: number;
  readonly minHeaderLength?: number;
  readonly maxHeaderLength?: number;
  readonly commandCodeLength: number;
  readonly responseErrorCodeLength: number;
  readonly successErrorCode: string;
  /** Optional End-of-Message control character delimiter (e.g., `'\x19'`). */
  readonly endMessageDelimiter?: string;
  /** Optional LMK ID delimiter prefix (e.g., `'%'` for `'%00'`). */
  readonly lmkIdDelimiter?: string;
}

/**
 * Framing configuration for Futurex Excrypt style `[AO...;TAGval;]` frames.
 */
export interface TagValueFramingConfig {
  readonly type: 'tag-value';
  readonly startDelimiter: string;
  readonly endDelimiter: string;
  readonly pairDelimiter: string;
  /** Primary tag identifying the command code (e.g., `'AO'`). */
  readonly commandTag: string;
  readonly tagLength: number;
  /** Command code emitted on dedicated error frames (e.g., `'ERRO'`). */
  readonly errorCommandCode?: string;
  /** Tag carrying the error code inside an error frame (e.g., `'AM'`). */
  readonly errorCodeTag?: string;
  /** Tag carrying the offending tag name inside an error frame (e.g., `'AN'`). */
  readonly offendingTagTag?: string;
  /** Tag carrying human-readable error message or status text (e.g., `'BB'`). */
  readonly errorMessageTag?: string;
  /** Universal tags valid across any command in this protocol (e.g., `'AG'` message echo tag). */
  readonly universalTags?: readonly FieldSpec[];
}

/**
 * Framing configuration for structured protocols (JSON REST APIs, KMIP XML, Callable C APIs, CLIs).
 */
export interface StructuredFramingConfig {
  readonly type: 'structured';
  readonly format: 'json' | 'xml' | 'callable' | 'cli';
  readonly commandKey?: string;
  readonly errorKey?: string;
  readonly successCodes?: readonly string[];
}

/**
 * Discriminated union of all supported framing configurations.
 */
export type FramingConfig =
  | DelimitedPositionalFramingConfig
  | HeaderPositionalFramingConfig
  | TagValueFramingConfig
  | StructuredFramingConfig;

/**
 * Firmware version specification for a device, supporting inheritance via `extends`.
 */
export interface DeviceVersionSpec {
  readonly version: string;
  readonly label: LocalizedString;
  readonly releaseNotes?: LocalizedString;
  /** Optional parent version key in `DeviceSpec.versions` from which commands and error codes are inherited. */
  readonly extends?: string;
  readonly commands: readonly CommandSpec[];
  readonly errorCodes: Readonly<Record<string, ErrorCodeSpec>>;
}

/**
 * Document section / chapter of the official vendor manual for a device.
 */
export interface HardwareDocSectionSpec {
  readonly id: string;
  readonly title: LocalizedString;
  readonly category: 'overview' | 'chapter' | 'appendix' | 'commands';
  readonly markdown: LocalizedString;
}

/**
 * Root specification for a cryptographic hardware device in `@chci/device-specs`.
 */
export interface DeviceSpec {
  readonly id: string;
  readonly name: string;
  readonly vendor: string;
  readonly category: DeviceCategory;
  readonly status: CatalogStatus;
  readonly icon?: string;
  readonly summary: LocalizedString;
  readonly defaultVersion: string;
  readonly exampleCommand?: string;
  readonly framing: FramingConfig;
  readonly versions: Readonly<Record<string, DeviceVersionSpec>>;
  /** Default interface ID for multi-interface devices (e.g., `'pkcs11'`, `'rest-json'`) */
  readonly defaultInterface?: string;
  /** Multiple standard and proprietary interfaces supported by this device */
  readonly interfaces?: readonly DeviceInterfaceSpec[];
  /** Comprehensive hardware documentation sections extracted from official vendor manuals */
  readonly documentationSections?: readonly HardwareDocSectionSpec[];
}

/**
 * Metadata for an ASCII control character detected during normalization.
 */
export interface ControlCharInfo {
  /** Zero-based character index within the `normalized` string. */
  readonly index: number;
  /** Numeric ASCII/Unicode code point (e.g., `0x02` for STX, `0x19` for EM). */
  readonly code: number;
  /** Formatted hex representation (e.g., `'0x02'`, `'0x19'`). */
  readonly hex: string;
  /** Standard ASCII control character mnemonic (e.g., `'NUL'`, `'STX'`, `'ETX'`, `'EM'`, `'CR'`, `'LF'`). */
  readonly name: string;
  /** Visual badge/symbol representation for the editor (e.g., `'<STX>'`, `'<ETX>'`, `'␙'`). */
  readonly symbol: string;
}

/**
 * Result of normalizing a raw command string prior to structural parsing.
 */
export interface NormalizedInput {
  readonly original: string;
  readonly normalized: string;
  readonly leadingTrimmed: number;
  readonly trailingTrimmed: number;
  readonly byteLength: number;
  readonly charLength: number;
  readonly controlChars: readonly ControlCharInfo[];
}

/**
 * Structural role of a token/segment within a raw frame for syntax highlighting.
 */
export type SegmentRole =
  | 'delimiter'
  | 'header'
  | 'command-code'
  | 'response-code'
  | 'error-code'
  | 'field'
  | 'tag'
  | 'tag-value'
  | 'context-tag'
  | 'lmk-id'
  | 'trailer'
  | 'unknown';

/**
 * Contiguous character span in the normalized command string with semantic role metadata.
 */
export interface FrameSegment {
  readonly id: string;
  readonly role: SegmentRole;
  readonly label: LocalizedString;
  readonly rawValue: string;
  /** Zero-based start offset in `normalized.normalized` (inclusive). */
  readonly start: number;
  /** Zero-based end offset in `normalized.normalized` (exclusive). */
  readonly end: number;
  readonly fieldId?: string;
  readonly tag?: string;
}

/**
 * Parsed, validated, and decoded field instance extracted from a command frame.
 */
export interface ParsedField {
  readonly id: string;
  readonly name: LocalizedString;
  readonly description: LocalizedString;
  readonly rawValue: string;
  readonly decodedValue: string;
  /**
   * Display-safe value: equals `'••••••••'` when `sensitive: true` and `rawValue.length > 0`,
   * otherwise equals `decodedValue`.
   */
  readonly maskedValue: string;
  /** Zero-based start offset in `normalized.normalized` (inclusive). */
  readonly start: number;
  /** Zero-based end offset in `normalized.normalized` (exclusive). */
  readonly end: number;
  readonly encoding: FieldEncoding;
  readonly sensitive: boolean;
  readonly valid: boolean;
  readonly tag?: string;
  readonly position?: number;
  readonly enumMeaning?: LocalizedString;
  readonly notes?: LocalizedString;
  /** Sub-specifications by key management mode (AKB / Variant / Both) */
  readonly variants?: readonly FieldModeVariant[];
  /** Detected key management mode for the parsed value in the active command frame. */
  readonly detectedMode?: 'akb' | 'variant' | 'both';
}

/**
 * Severity level of a parser diagnostic.
 */
export type DiagnosticSeverity = 'error' | 'warning' | 'info';

/**
 * Machine-readable diagnostic identifier emitted by the parser engine.
 */
export type DiagnosticCode =
  | 'EMPTY_INPUT'
  | 'MALFORMED_FRAME'
  | 'UNCLOSED_FRAME'
  | 'UNKNOWN_COMMAND'
  | 'UNKNOWN_SUBCOMMAND'
  | 'DIRECTION_MISMATCH'
  | 'MISSING_REQUIRED_FIELD'
  | 'EXTRA_UNEXPECTED_FIELD'
  | 'UNKNOWN_TAG'
  | 'INVALID_FIELD_LENGTH'
  | 'INVALID_FIELD_ENCODING'
  | 'INVALID_ENUM_VALUE'
  | 'ERROR_RESPONSE_CODE'
  | 'NOISE_IGNORED';

/**
 * Actionable diagnostic message produced during command parsing and validation.
 */
export interface ParseDiagnostic {
  readonly code: DiagnosticCode;
  readonly severity: DiagnosticSeverity;
  readonly message: LocalizedString;
  readonly start?: number;
  readonly end?: number;
  readonly fieldId?: string;
}

/**
 * Runtime options passed to `parseCommand` and the underlying framing parsers.
 */
export interface ParseCommandOptions {
  /** Target firmware version ID (defaults to `deviceSpec.defaultVersion`). */
  readonly version?: string;
  /** User-selected direction in the UI (`request` / Input vs `response` / Output). */
  readonly expectedDirection?: CommandDirection;
  /** Override for configurable message header length in `header-positional` protocols (e.g., Thales). */
  readonly headerLength?: number;
  /** Selected device interface ID (e.g., `'pkcs11'`, `'rest-json'`, `'cca-verb'`). */
  readonly interfaceId?: string;
  /** Selected or forced key management mode (e.g. 'akb' | 'variant' | 'auto'). */
  readonly keyManagement?: KeyManagementMode | 'auto';
}

/**
 * Complete immutable output of parsing a single hardware command frame.
 */
export interface ParseResult {
  readonly deviceId: string;
  readonly version: string;
  readonly interfaceId?: string;
  readonly detectedInterfaceId?: string;
  readonly raw: string;
  readonly normalized: NormalizedInput;
  readonly framingType: FramingType;
  readonly detectedDirection: CommandDirection | 'unknown';
  readonly expectedDirection?: CommandDirection;
  readonly detectedKeyManagement?: KeyManagementMode | null;
  readonly commandCode: string | null;
  readonly subCode?: string | null;
  readonly matchedCommand: CommandSpec | null;
  readonly pairedCommand: CommandSpec | null;
  readonly isErrorResponse: boolean;
  readonly errorCode: string | null;
  readonly detailedErrorCode?: string | null;
  readonly errorSpec: ErrorCodeSpec | null;
  /** Offending field index (e.g., `'01'` in Atalla) or tag name (e.g., `'AF'` in Futurex) reported by an error frame. */
  readonly offendingFieldOrTag?: string | null;
  /** Firmware version identifier embedded in response status tokens (e.g., `'86'` in Atalla `<00#020186#0000#>`). */
  readonly firmwareVersionToken?: string | null;
  /** Extracted message header in `header-positional` frames (e.g., `'0000'`). */
  readonly headerValue?: string | null;
  /** Extracted correlation/echo token (Thales header, Atalla `^CTX#`, or Futurex `AG` tag value). */
  readonly echoToken?: string | null;
  /** Optional LMK identifier extracted from Thales frames (e.g., `'00'` from `'%00'`). */
  readonly lmkId?: string | null;
  /** Optional message trailer extracted after the End-of-Message delimiter (`\x19`). */
  readonly trailer?: string | null;
  readonly segments: readonly FrameSegment[];
  readonly fields: readonly ParsedField[];
  /** Optional fields declared in spec that were omitted from this command frame. */
  readonly omittedFields?: readonly FieldSpec[];
  readonly diagnostics: readonly ParseDiagnostic[];
  readonly valid: boolean;
}

/**
 * Individual verification item inside a request <-> response correlation report.
 */
export interface CorrelationCheck {
  readonly id:
    | 'direction-order'
    | 'command-pair'
    | 'header-echo'
    | 'context-echo'
    | 'response-status';
  readonly passed: boolean;
  readonly label: LocalizedString;
  readonly details: LocalizedString;
}

/**
 * Result of correlating a parsed request command with its linked response command.
 */
export interface CorrelationResult {
  readonly isCorrelated: boolean;
  readonly requestCommandCode: string | null;
  readonly responseCommandCode: string | null;
  readonly expectedResponseCode: string | null;
  readonly commandPairMatches: boolean;
  readonly echoMatches: boolean;
  readonly isErrorResponse: boolean;
  readonly errorCode: string | null;
  readonly errorSpec: ErrorCodeSpec | null;
  readonly checks: readonly CorrelationCheck[];
}
