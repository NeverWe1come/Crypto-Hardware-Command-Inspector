/**
 * @packageDocumentation
 * Immutable Redux/Flux-style reducer managing the global workspace state (`@chci/explorer`).
 */

import { getDeviceSpec } from '@chci/device-specs';
import type {
  CommandEntry,
  WorkspaceAction,
  WorkspaceState,
  WorkspaceTab
} from './types';

/**
 * Default initial state for the explorer workspace.
 */
export const initialWorkspaceState: WorkspaceState = {
  locale: 'es',
  theme: 'dark',
  activeTabId: null,
  tabs: [],
  catalogSearchQuery: '',
  selectedCategory: 'ALL'
};

/**
 * Generates an opaque unique identifier for workspace tabs and commands.
 */
function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Pure reducer function for the application workspace.
 * Treats state as strictly immutable.
 *
 * @param state - Current workspace state tree.
 * @param action - Dispatched workspace action.
 * @returns New immutable workspace state.
 */
export function workspaceReducer(
  state: WorkspaceState = initialWorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case 'OPEN_DEVICE_TAB': {
      const { deviceId, version: requestedVersion } = action.payload;
      if (!deviceId || typeof deviceId !== 'string') {
        return state;
      }

      // Idempotency: If a tab for this device is already open, activate it and do NOT duplicate
      const existingTab = state.tabs.find((tab) => tab.deviceId === deviceId);
      if (existingTab) {
        return {
          ...state,
          activeTabId: existingTab.id
        };
      }

      // Retrieve device spec from device-specs package
      const spec = getDeviceSpec(deviceId);
      if (!spec) {
        // Device is not supported or not found in catalog specs
        return state;
      }

      const version =
        requestedVersion ??
        spec.defaultVersion ??
        Object.keys(spec.versions)[0] ??
        '1.0';

      const initialCommandId = action.payload.commandId ?? createId('cmd');
      const initialCommand: CommandEntry = {
        id: initialCommandId,
        raw: '',
        version,
        direction: 'request',
        linkedCommandId: null
      };

      const tabId = action.payload.tabId ?? createId(`tab_${deviceId}`);
      const newTab: WorkspaceTab = {
        id: tabId,
        deviceId,
        version,
        headerLength:
          spec.framing.type === 'header-positional' ? spec.framing.defaultHeaderLength : undefined,
        commands: [initialCommand],
        activeCommandId: initialCommandId
      };

      return {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: tabId
      };
    }

    case 'CLOSE_DEVICE_TAB': {
      const { tabId } = action.payload;
      const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) {
        return state;
      }

      const nextTabs = state.tabs.filter((tab) => tab.id !== tabId);

      // If the closed tab was not active, activeTabId remains unchanged
      if (state.activeTabId !== tabId) {
        return {
          ...state,
          tabs: nextTabs
        };
      }

      // If the closed tab was active, choose next active tab intelligently
      let nextActiveId: string | null = null;
      if (nextTabs.length > 0) {
        // If closed tab was not the first, prefer previous tab; otherwise pick the new first
        const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        const candidate = nextTabs[newActiveIndex];
        nextActiveId = candidate ? candidate.id : null;
      }

      return {
        ...state,
        tabs: nextTabs,
        activeTabId: nextActiveId
      };
    }

    case 'SELECT_DEVICE_TAB': {
      const { tabId } = action.payload;
      if (state.activeTabId === tabId) {
        return state;
      }
      const exists = state.tabs.some((tab) => tab.id === tabId);
      if (!exists) {
        return state;
      }
      return {
        ...state,
        activeTabId: tabId
      };
    }

    case 'SET_LOCALE': {
      if (state.locale === action.payload) {
        return state;
      }
      return {
        ...state,
        locale: action.payload
      };
    }

    case 'SET_THEME': {
      if (state.theme === action.payload) {
        return state;
      }
      return {
        ...state,
        theme: action.payload
      };
    }

    case 'SET_SIDEBAR_QUERY': {
      if (state.catalogSearchQuery === action.payload) {
        return state;
      }
      return {
        ...state,
        catalogSearchQuery: action.payload
      };
    }

    case 'SET_SELECTED_CATEGORY': {
      if (state.selectedCategory === action.payload) {
        return state;
      }
      return {
        ...state,
        selectedCategory: action.payload
      };
    }

    default:
      return state;
  }
}
