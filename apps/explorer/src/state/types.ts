/**
 * @packageDocumentation
 * State contracts and types for the `@chci/explorer` workspace state engine.
 */

import type { CommandDirection, DeviceCategory } from '@chci/parser-core';

/**
 * Supported application interface locales.
 */
export type AppLocale = 'es' | 'en' | 'gl';

/**
 * Supported interface visual themes.
 */
export type AppTheme = 'dark' | 'light' | 'system';

/**
 * Supported hardware connection protocols.
 */
export type HardwareConnectionType = 'TCP' | 'TLS' | 'mTLS';

/**
 * Configuration for direct communication with a cryptographic hardware device.
 */
export interface HardwareConnectionConfig {
  readonly id: string;
  readonly deviceId: string;
  readonly host: string;
  readonly port: number;
  readonly connectionType: HardwareConnectionType;
  readonly caCertPem?: string;
  readonly clientCertPem?: string;
  readonly clientKeyPem?: string;
}

/**
 * Filter for devices in the catalog sidebar: all devices or a specific hardware category.
 */
export type CategoryFilter = 'ALL' | 'HSM' | DeviceCategory;

/**
 * Represents a single inspected cryptographic command within a device workspace tab.
 */
export interface CommandEntry {
  readonly id: string;
  readonly raw: string;
  readonly version: string;
  readonly direction: CommandDirection;
  readonly linkedCommandId?: string | null;
  /** Configurable header length per command (especially for header-positional devices like Thales). */
  readonly headerLength?: number;
  /** Active interface ID used to parse this command (e.g. 'pkcs11-c', 'rest-json', 'lunash-cli'). */
  readonly interfaceId?: string;
  /** Whether direct hardware execution is toggled on for this request command. */
  readonly liveExecutionEnabled?: boolean;
  /** Selected connection ID to execute against. */
  readonly selectedConnectionId?: string;
  /** Raw response command received from live hardware execution. */
  readonly liveResponseRaw?: string;
}

/**
 * Represents an open hardware device workspace tab in the application.
 */
export interface WorkspaceTab {
  readonly id: string;
  readonly deviceId: string;
  readonly version: string;
  readonly headerLength?: number;
  readonly interfaceId?: string;
  readonly commands: readonly CommandEntry[];
  readonly activeCommandId: string | null;
}

/**
 * Root immutable state tree for the application workspace.
 */
export interface WorkspaceState {
  readonly locale: AppLocale;
  readonly theme: AppTheme;
  readonly activeTabId: string | null;
  readonly tabs: readonly WorkspaceTab[];
  readonly catalogSearchQuery: string;
  readonly selectedCategory: CategoryFilter;
  readonly hardwareConnections: readonly HardwareConnectionConfig[];
}

/**
 * Reference payload for loading an entry recorded in `.chci_history`.
 */
export interface HistoryEntryRef {
  readonly deviceId: string;
  readonly version: string;
  readonly direction: CommandDirection;
  readonly raw: string;
  readonly interfaceId?: string;
}

/**
 * Discriminated union of all supported workspace actions.
 */
export type WorkspaceAction =
  | {
      readonly type: 'OPEN_DEVICE_TAB';
      readonly payload: {
        readonly deviceId: string;
        readonly version?: string;
        readonly tabId?: string;
        readonly commandId?: string;
      };
    }
  | { readonly type: 'CLOSE_DEVICE_TAB'; readonly payload: { readonly tabId: string } }
  | { readonly type: 'SELECT_DEVICE_TAB'; readonly payload: { readonly tabId: string } }
  | { readonly type: 'SET_LOCALE'; readonly payload: AppLocale }
  | { readonly type: 'SET_THEME'; readonly payload: AppTheme }
  | { readonly type: 'SET_SIDEBAR_QUERY'; readonly payload: string }
  | { readonly type: 'SET_SELECTED_CATEGORY'; readonly payload: CategoryFilter }
  | {
      readonly type: 'ADD_COMMAND';
      readonly payload?: {
        readonly tabId?: string;
        readonly initialRaw?: string;
        readonly initialDirection?: CommandDirection;
        readonly initialVersion?: string;
        readonly initialInterfaceId?: string;
        readonly commandId?: string;
        readonly headerLength?: number;
      };
    }
  | {
      readonly type: 'DELETE_COMMAND';
      readonly payload: {
        readonly commandId: string;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'DUPLICATE_COMMAND';
      readonly payload: {
        readonly commandId: string;
        readonly newCommandId?: string;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'UPDATE_COMMAND_INTERFACE';
      readonly payload: {
        readonly commandId: string;
        readonly interfaceId: string;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'UPDATE_TAB_INTERFACE';
      readonly payload: {
        readonly interfaceId: string;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'UPDATE_COMMAND_RAW';
      readonly payload: {
        readonly commandId: string;
        readonly raw: string;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'UPDATE_COMMAND_DIRECTION';
      readonly payload: {
        readonly commandId: string;
        readonly direction: CommandDirection;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'UPDATE_COMMAND_VERSION';
      readonly payload: {
        readonly commandId: string;
        readonly version: string;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'UPDATE_COMMAND_HEADER_LENGTH';
      readonly payload: {
        readonly commandId: string;
        readonly headerLength: number;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'UPDATE_TAB_HEADER_LENGTH';
      readonly payload: {
        readonly headerLength: number;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'LOAD_FROM_HISTORY';
      readonly payload: {
        readonly entry: HistoryEntryRef;
        readonly mode: 'replace-active' | 'add-new';
      };
    }
  | {
      readonly type: 'SET_COMMAND_LIVE_EXECUTION';
      readonly payload: {
        readonly commandId: string;
        readonly enabled: boolean;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'SET_COMMAND_SELECTED_CONNECTION';
      readonly payload: {
        readonly commandId: string;
        readonly connectionId: string;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'SET_COMMAND_LIVE_RESPONSE';
      readonly payload: {
        readonly commandId: string;
        readonly responseRaw: string;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'SAVE_HARDWARE_CONNECTION';
      readonly payload: {
        readonly connection: HardwareConnectionConfig;
      };
    }
  | {
      readonly type: 'DELETE_HARDWARE_CONNECTION';
      readonly payload: {
        readonly connectionId: string;
      };
    }
  | {
      readonly type: 'REORDER_COMMANDS';
      readonly payload: {
        readonly commandIds: readonly string[];
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'SELECT_COMMAND';
      readonly payload: {
        readonly commandId: string;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'LOAD_WORKSPACE';
      readonly payload: WorkspaceState;
    };
