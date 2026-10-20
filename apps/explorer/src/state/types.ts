/**
 * @packageDocumentation
 * State contracts and types for the `@chci/explorer` workspace state engine.
 */

import type { CommandDirection, DeviceCategory } from '@chci/parser-core';

/**
 * Supported application interface locales.
 */
export type AppLocale = 'es' | 'en';

/**
 * Supported interface visual themes.
 */
export type AppTheme = 'dark' | 'light' | 'system';

/**
 * Filter for devices in the catalog sidebar: all devices or a specific hardware category.
 */
export type CategoryFilter = 'ALL' | DeviceCategory;

/**
 * Represents a single inspected cryptographic command within a device workspace tab.
 */
export interface CommandEntry {
  readonly id: string;
  readonly raw: string;
  readonly version: string;
  readonly direction: CommandDirection;
  readonly linkedCommandId?: string | null;
}

/**
 * Represents an open hardware device workspace tab in the application.
 */
export interface WorkspaceTab {
  readonly id: string;
  readonly deviceId: string;
  readonly version: string;
  readonly headerLength?: number;
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
        readonly commandId?: string;
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
      readonly type: 'UPDATE_TAB_HEADER_LENGTH';
      readonly payload: {
        readonly headerLength: number;
        readonly tabId?: string;
      };
    }
  | {
      readonly type: 'LINK_COMMANDS';
      readonly payload: {
        readonly commandId: string;
        readonly targetCommandId: string | null;
        readonly tabId?: string;
        readonly bidirectional?: boolean;
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
