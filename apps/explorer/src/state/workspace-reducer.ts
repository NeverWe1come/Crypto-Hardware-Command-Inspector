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
 *
 * @param prefix - String prefix (e.g., `'tab'`, `'cmd'`).
 * @returns Unique string ID using `crypto.randomUUID()` when available.
 */
function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Resolves the target tab and its index within the state tree.
 * Defaults to the currently active tab if no explicit tabId is provided.
 *
 * @param state - Current immutable workspace state.
 * @param tabId - Optional explicit tab ID to locate.
 * @returns Object with tab and tabIndex if found, or null.
 */
function findTargetTab(
  state: WorkspaceState,
  tabId?: string
): { tab: WorkspaceTab; tabIndex: number } | null {
  const targetId = tabId ?? state.activeTabId;
  if (!targetId) return null;
  const tabIndex = state.tabs.findIndex((t) => t.id === targetId);
  if (tabIndex === -1) return null;
  const tab = state.tabs[tabIndex];
  if (!tab) return null;
  return { tab, tabIndex };
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

    case 'ADD_COMMAND': {
      const target = findTargetTab(state, action.payload?.tabId);
      if (!target) return state;
      const { tab, tabIndex } = target;

      const newId = action.payload?.commandId ?? createId('cmd');
      const newCommand: CommandEntry = {
        id: newId,
        raw: action.payload?.initialRaw ?? '',
        direction: action.payload?.initialDirection ?? 'request',
        version: action.payload?.initialVersion ?? tab.version,
        linkedCommandId: null
      };

      const updatedTab: WorkspaceTab = {
        ...tab,
        commands: [...tab.commands, newCommand],
        activeCommandId: newId
      };

      const nextTabs = [...state.tabs];
      nextTabs[tabIndex] = updatedTab;
      return { ...state, tabs: nextTabs };
    }

    case 'DELETE_COMMAND': {
      const target = findTargetTab(state, action.payload.tabId);
      if (!target) return state;
      const { tab, tabIndex } = target;

      const cmdIndex = tab.commands.findIndex((c) => c.id === action.payload.commandId);
      if (cmdIndex === -1) return state;

      if (tab.commands.length === 1) {
        // Tab must never have 0 commands; create a fresh command
        const freshId = createId('cmd');
        const freshCmd: CommandEntry = {
          id: freshId,
          raw: '',
          direction: 'request',
          version: tab.version,
          linkedCommandId: null
        };
        const updatedTab: WorkspaceTab = {
          ...tab,
          commands: [freshCmd],
          activeCommandId: freshId
        };
        const nextTabs = [...state.tabs];
        nextTabs[tabIndex] = updatedTab;
        return { ...state, tabs: nextTabs };
      }

      // Filter out deleted command
      const remainingCommands = tab.commands.filter((c) => c.id !== action.payload.commandId);

      let nextActiveId = tab.activeCommandId;
      if (tab.activeCommandId === action.payload.commandId) {
        // Choose adjacent: prefer previous if cmdIndex > 0, else first remaining
        const candidateIndex = cmdIndex > 0 ? cmdIndex - 1 : 0;
        nextActiveId = remainingCommands[candidateIndex]?.id ?? null;
      }

      const updatedTab: WorkspaceTab = {
        ...tab,
        commands: remainingCommands,
        activeCommandId: nextActiveId
      };
      const nextTabs = [...state.tabs];
      nextTabs[tabIndex] = updatedTab;
      return { ...state, tabs: nextTabs };
    }

    case 'DUPLICATE_COMMAND': {
      const target = findTargetTab(state, action.payload.tabId);
      if (!target) return state;
      const { tab, tabIndex } = target;

      const cmdIndex = tab.commands.findIndex((c) => c.id === action.payload.commandId);
      if (cmdIndex === -1) return state;
      const sourceCmd = tab.commands[cmdIndex];
      if (!sourceCmd) return state;

      const newId = action.payload.newCommandId ?? createId('cmd');
      const duplicatedCmd: CommandEntry = {
        ...sourceCmd,
        id: newId,
        linkedCommandId: null
      };

      const nextCommands = [
        ...tab.commands.slice(0, cmdIndex + 1),
        duplicatedCmd,
        ...tab.commands.slice(cmdIndex + 1)
      ];

      const updatedTab: WorkspaceTab = {
        ...tab,
        commands: nextCommands,
        activeCommandId: newId
      };
      const nextTabs = [...state.tabs];
      nextTabs[tabIndex] = updatedTab;
      return { ...state, tabs: nextTabs };
    }

    case 'UPDATE_COMMAND_RAW': {
      const target = findTargetTab(state, action.payload.tabId);
      if (!target) return state;
      const { tab, tabIndex } = target;

      const cmdIndex = tab.commands.findIndex((c) => c.id === action.payload.commandId);
      if (cmdIndex === -1) return state;
      const cmd = tab.commands[cmdIndex];
      if (!cmd) return state;
      if (cmd.raw === action.payload.raw) return state;

      const nextCommands = [...tab.commands];
      nextCommands[cmdIndex] = { ...cmd, raw: action.payload.raw };

      const updatedTab: WorkspaceTab = {
        ...tab,
        commands: nextCommands
      };
      const nextTabs = [...state.tabs];
      nextTabs[tabIndex] = updatedTab;
      return { ...state, tabs: nextTabs };
    }

    case 'UPDATE_COMMAND_DIRECTION': {
      const target = findTargetTab(state, action.payload.tabId);
      if (!target) return state;
      const { tab, tabIndex } = target;

      const cmdIndex = tab.commands.findIndex((c) => c.id === action.payload.commandId);
      if (cmdIndex === -1) return state;
      const cmd = tab.commands[cmdIndex];
      if (!cmd) return state;
      if (cmd.direction === action.payload.direction) return state;

      const nextCommands = [...tab.commands];
      nextCommands[cmdIndex] = { ...cmd, direction: action.payload.direction };

      const updatedTab: WorkspaceTab = {
        ...tab,
        commands: nextCommands
      };
      const nextTabs = [...state.tabs];
      nextTabs[tabIndex] = updatedTab;
      return { ...state, tabs: nextTabs };
    }

    case 'UPDATE_COMMAND_VERSION': {
      const target = findTargetTab(state, action.payload.tabId);
      if (!target) return state;
      const { tab, tabIndex } = target;

      const cmdIndex = tab.commands.findIndex((c) => c.id === action.payload.commandId);
      if (cmdIndex === -1) return state;
      const cmd = tab.commands[cmdIndex];
      if (!cmd) return state;
      if (cmd.version === action.payload.version) return state;

      const nextCommands = [...tab.commands];
      nextCommands[cmdIndex] = { ...cmd, version: action.payload.version };

      const updatedTab: WorkspaceTab = {
        ...tab,
        commands: nextCommands
      };
      const nextTabs = [...state.tabs];
      nextTabs[tabIndex] = updatedTab;
      return { ...state, tabs: nextTabs };
    }

    case 'UPDATE_TAB_HEADER_LENGTH': {
      const target = findTargetTab(state, action.payload.tabId);
      if (!target) return state;
      const { tab, tabIndex } = target;

      const len = action.payload.headerLength;
      if (len < 0 || tab.headerLength === len) return state;

      const updatedTab: WorkspaceTab = {
        ...tab,
        headerLength: len
      };
      const nextTabs = [...state.tabs];
      nextTabs[tabIndex] = updatedTab;
      return { ...state, tabs: nextTabs };
    }

    case 'REORDER_COMMANDS': {
      const target = findTargetTab(state, action.payload.tabId);
      if (!target) return state;
      const { tab, tabIndex } = target;

      const { commandIds } = action.payload;
      if (commandIds.length !== tab.commands.length) return state;

      const currentIds = tab.commands.map((c) => c.id);
      const isSameOrder = currentIds.every((id, idx) => id === commandIds[idx]);
      if (isSameOrder) return state;

      const commandMap = new Map(tab.commands.map((c) => [c.id, c]));
      const newCommands: CommandEntry[] = [];
      for (const id of commandIds) {
        const found = commandMap.get(id);
        if (!found) return state;
        newCommands.push(found);
      }

      const updatedTab: WorkspaceTab = {
        ...tab,
        commands: newCommands
      };
      const nextTabs = [...state.tabs];
      nextTabs[tabIndex] = updatedTab;
      return { ...state, tabs: nextTabs };
    }

    case 'SELECT_COMMAND': {
      const target = findTargetTab(state, action.payload.tabId);
      if (!target) return state;
      const { tab, tabIndex } = target;

      const { commandId } = action.payload;
      if (tab.activeCommandId === commandId) return state;
      const exists = tab.commands.some((c) => c.id === commandId);
      if (!exists) return state;

      const updatedTab: WorkspaceTab = {
        ...tab,
        activeCommandId: commandId
      };
      const nextTabs = [...state.tabs];
      nextTabs[tabIndex] = updatedTab;
      return { ...state, tabs: nextTabs };
    }

    case 'LOAD_WORKSPACE': {
      return {
        ...action.payload,
        tabs: action.payload.tabs.map((tab) => ({
          ...tab,
          commands: tab.commands.map((cmd) => ({ ...cmd }))
        }))
      };
    }

    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
}
