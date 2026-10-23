/**
 * @packageDocumentation
 * Unit test suite for the workspace state reducer (`@chci/explorer`).
 */

import { describe, expect, it } from 'vitest';
import { initialWorkspaceState, workspaceReducer } from '../workspace-reducer';
import type { WorkspaceAction } from '../types';

describe('workspaceReducer', () => {
  // Helper to freeze state ensuring pure immutable transformations
  function freeze<T>(obj: T): Readonly<T> {
    return Object.freeze({ ...obj });
  }

  describe('Initial State', () => {
    it('provides the correct default initial state configuration', () => {
      expect(initialWorkspaceState).toEqual({
        locale: 'es',
        theme: 'dark',
        activeTabId: null,
        tabs: [],
        catalogSearchQuery: '',
        selectedCategory: 'ALL',
        hardwareConnections: []
      });
    });

    it('returns current state when unknown action type is provided', () => {
      const state = freeze(initialWorkspaceState);
      const action = { type: 'UNKNOWN_ACTION' } as unknown as WorkspaceAction;
      const nextState = workspaceReducer(state, action);
      expect(nextState).toBe(state);
    });
  });

  describe('OPEN_DEVICE_TAB', () => {
    it('opens a tab for a supported device with default version and initial empty command', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' }
      });

      expect(nextState.tabs).toHaveLength(1);
      const tab = nextState.tabs[0]!;
      expect(tab.deviceId).toBe('utimaco-atalla-at1000');
      expect(tab.version).toBe('8.60');
      expect(nextState.activeTabId).toBe(tab.id);

      // Verifies initial command creation
      expect(tab.commands).toHaveLength(1);
      const command = tab.commands[0]!;
      expect(command.id).toBeDefined();
      expect(command.raw).toBe('');
      expect(command.version).toBe('8.60');
      expect(command.direction).toBe('request');
      expect(command.linkedCommandId).toBeNull();
      expect(tab.activeCommandId).toBe(command.id);
    });

    it('assigns framing header length for header-positional devices like Thales payShield 10K', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'thales-payshield-10k' }
      });

      expect(nextState.tabs).toHaveLength(1);
      const tab = nextState.tabs[0]!;
      expect(tab.deviceId).toBe('thales-payshield-10k');
      expect(tab.version).toBe('2.3');
      expect(tab.headerLength).toBe(4);
    });

    it('allows opening a tab with a specific supported version override', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000', version: '8.50' }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.version).toBe('8.50');
      expect(tab.commands[0]?.version).toBe('8.50');
    });

    it('enforces idempotency: reactivates existing tab if device is already open and does NOT duplicate', () => {
      const state1 = workspaceReducer(freeze(initialWorkspaceState), {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' }
      });
      const firstTabId = state1.activeTabId;

      const state2 = workspaceReducer(freeze(state1), {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'thales-payshield-10k' }
      });
      const secondTabId = state2.activeTabId;
      expect(state2.tabs).toHaveLength(2);
      expect(secondTabId).not.toBe(firstTabId);

      // Re-opening Atalla AT1000 should switch back to first tab without creating a third tab
      const state3 = workspaceReducer(freeze(state2), {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' }
      });

      expect(state3.tabs).toHaveLength(2);
      expect(state3.activeTabId).toBe(firstTabId);
    });

    it('auto-assigns existing hardware connection and enables live execution when opening device tab', () => {
      const stateWithConn = {
        ...initialWorkspaceState,
        hardwareConnections: [
          {
            id: 'conn-atalla-sim',
            deviceId: 'utimaco-atalla-at1000',
            host: '127.0.0.1',
            port: 7000,
            connectionType: 'TCP' as const,
          },
        ],
      };

      const nextState = workspaceReducer(freeze(stateWithConn), {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' },
      });

      expect(nextState.tabs).toHaveLength(1);
      const tab = nextState.tabs[0]!;
      expect(tab.commands[0]?.selectedConnectionId).toBe('conn-atalla-sim');
      expect(tab.commands[0]?.liveExecutionEnabled).toBe(true);
    });

    it('ignores unknown or unsupported devices without altering state', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'unsupported-crypto-device' }
      });
      expect(nextState).toBe(state);
      expect(nextState.tabs).toHaveLength(0);

      const invalidState = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'non-existent-device' }
      });
      expect(invalidState).toBe(state);
    });

    it('updates command interface via UPDATE_COMMAND_INTERFACE', () => {
      const state1 = workspaceReducer(initialWorkspaceState, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'thales-luna-7' }
      });
      const tab = state1.tabs[0];
      const cmd = tab?.commands[0];
      expect(cmd?.interfaceId).toBe('pkcs11');

      const state2 = workspaceReducer(state1, {
        type: 'UPDATE_COMMAND_INTERFACE',
        payload: {
          commandId: cmd!.id,
          interfaceId: 'lunash-cli'
        }
      });
      expect(state2.tabs[0]?.commands[0]?.interfaceId).toBe('lunash-cli');
    });

    it('safely handles empty or malformed deviceId', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: '' }
      });
      expect(nextState).toBe(state);
    });
  });

  describe('CLOSE_DEVICE_TAB', () => {
    it('closes the specified tab when multiple tabs are open', () => {
      let state = workspaceReducer(initialWorkspaceState, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' }
      });
      state = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'thales-payshield-10k' }
      });
      state = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'futurex-excrypt' }
      });

      expect(state.tabs).toHaveLength(3);
      const tabToClose = state.tabs[1]!; // Thales

      const nextState = workspaceReducer(freeze(state), {
        type: 'CLOSE_DEVICE_TAB',
        payload: { tabId: tabToClose.id }
      });

      expect(nextState.tabs).toHaveLength(2);
      expect(nextState.tabs.some((t) => t.id === tabToClose.id)).toBe(false);
      // Active tab was Futurex (tab 2), so active tab remains Futurex
      expect(nextState.activeTabId).toBe(state.tabs[2]!.id);
    });

    it('switches to previous tab when the active last tab is closed', () => {
      let state = workspaceReducer(initialWorkspaceState, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' }
      });
      state = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'thales-payshield-10k' }
      });

      const activeTabId = state.activeTabId; // Thales (index 1)
      const previousTabId = state.tabs[0]!.id; // Atalla (index 0)

      const nextState = workspaceReducer(freeze(state), {
        type: 'CLOSE_DEVICE_TAB',
        payload: { tabId: activeTabId! }
      });

      expect(nextState.tabs).toHaveLength(1);
      expect(nextState.activeTabId).toBe(previousTabId);
    });

    it('switches to next tab when the active first tab is closed', () => {
      let state = workspaceReducer(initialWorkspaceState, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' }
      });
      state = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'thales-payshield-10k' }
      });

      // Select first tab
      const firstTabId = state.tabs[0]!.id;
      const secondTabId = state.tabs[1]!.id;
      state = workspaceReducer(state, {
        type: 'SELECT_DEVICE_TAB',
        payload: { tabId: firstTabId }
      });
      expect(state.activeTabId).toBe(firstTabId);

      // Close active first tab
      const nextState = workspaceReducer(freeze(state), {
        type: 'CLOSE_DEVICE_TAB',
        payload: { tabId: firstTabId }
      });

      expect(nextState.tabs).toHaveLength(1);
      expect(nextState.activeTabId).toBe(secondTabId);
    });

    it('sets activeTabId to null when the only open tab is closed', () => {
      const state = workspaceReducer(initialWorkspaceState, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' }
      });
      expect(state.tabs).toHaveLength(1);
      const tabId = state.tabs[0]!.id;

      const nextState = workspaceReducer(freeze(state), {
        type: 'CLOSE_DEVICE_TAB',
        payload: { tabId }
      });

      expect(nextState.tabs).toHaveLength(0);
      expect(nextState.activeTabId).toBeNull();
    });

    it('returns state untouched when closing a non-existent tabId', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'CLOSE_DEVICE_TAB',
        payload: { tabId: 'missing-tab-id' }
      });
      expect(nextState).toBe(state);
    });
  });

  describe('SELECT_DEVICE_TAB', () => {
    it('changes the active tab id to the requested tab', () => {
      let state = workspaceReducer(initialWorkspaceState, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' }
      });
      state = workspaceReducer(state, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'thales-payshield-10k' }
      });

      const firstTabId = state.tabs[0]!.id;
      expect(state.activeTabId).not.toBe(firstTabId);

      const nextState = workspaceReducer(freeze(state), {
        type: 'SELECT_DEVICE_TAB',
        payload: { tabId: firstTabId }
      });

      expect(nextState.activeTabId).toBe(firstTabId);
    });

    it('returns state untouched when selecting non-existent tab id', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'SELECT_DEVICE_TAB',
        payload: { tabId: 'unknown-tab' }
      });
      expect(nextState).toBe(state);
    });

    it('returns state untouched when selecting the already active tab', () => {
      const state = workspaceReducer(initialWorkspaceState, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'utimaco-atalla-at1000' }
      });
      const activeId = state.activeTabId!;
      const frozenState = freeze(state);
      const nextState = workspaceReducer(frozenState, {
        type: 'SELECT_DEVICE_TAB',
        payload: { tabId: activeId }
      });
      expect(nextState).toBe(frozenState);
    });
  });

  describe('SET_LOCALE', () => {
    it('switches locale between Spanish and English', () => {
      const state = freeze(initialWorkspaceState);
      expect(state.locale).toBe('es');

      const enState = workspaceReducer(state, {
        type: 'SET_LOCALE',
        payload: 'en'
      });
      expect(enState.locale).toBe('en');

      const esState = workspaceReducer(freeze(enState), {
        type: 'SET_LOCALE',
        payload: 'es'
      });
      expect(esState.locale).toBe('es');
    });

    it('returns state untouched when setting current locale', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'SET_LOCALE',
        payload: 'es'
      });
      expect(nextState).toBe(state);
    });
  });

  describe('SET_THEME', () => {
    it('alternates theme between dark, light, and system', () => {
      const state = freeze(initialWorkspaceState);
      expect(state.theme).toBe('dark');

      const lightState = workspaceReducer(state, {
        type: 'SET_THEME',
        payload: 'light'
      });
      expect(lightState.theme).toBe('light');

      const systemState = workspaceReducer(freeze(lightState), {
        type: 'SET_THEME',
        payload: 'system'
      });
      expect(systemState.theme).toBe('system');

      const darkState = workspaceReducer(freeze(systemState), {
        type: 'SET_THEME',
        payload: 'dark'
      });
      expect(darkState.theme).toBe('dark');
    });

    it('returns state untouched when setting current theme', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'SET_THEME',
        payload: 'dark'
      });
      expect(nextState).toBe(state);
    });
  });

  describe('SET_SIDEBAR_QUERY', () => {
    it('updates the catalog search query string', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'SET_SIDEBAR_QUERY',
        payload: 'thales payshield'
      });
      expect(nextState.catalogSearchQuery).toBe('thales payshield');

      const clearedState = workspaceReducer(freeze(nextState), {
        type: 'SET_SIDEBAR_QUERY',
        payload: ''
      });
      expect(clearedState.catalogSearchQuery).toBe('');
    });

    it('returns state untouched when query has not changed', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'SET_SIDEBAR_QUERY',
        payload: ''
      });
      expect(nextState).toBe(state);
    });
  });

  describe('SET_SELECTED_CATEGORY', () => {
    it('filters catalog by hardware category or ALL', () => {
      const state = freeze(initialWorkspaceState);
      expect(state.selectedCategory).toBe('ALL');

      const kmsState = workspaceReducer(state, {
        type: 'SET_SELECTED_CATEGORY',
        payload: 'KMS'
      });
      expect(kmsState.selectedCategory).toBe('KMS');

      const finState = workspaceReducer(freeze(kmsState), {
        type: 'SET_SELECTED_CATEGORY',
        payload: 'HSM_FINANCIAL'
      });
      expect(finState.selectedCategory).toBe('HSM_FINANCIAL');

      const gpState = workspaceReducer(freeze(finState), {
        type: 'SET_SELECTED_CATEGORY',
        payload: 'HSM_GP'
      });
      expect(gpState.selectedCategory).toBe('HSM_GP');

      const cloudState = workspaceReducer(freeze(gpState), {
        type: 'SET_SELECTED_CATEGORY',
        payload: 'HSMAAS'
      });
      expect(cloudState.selectedCategory).toBe('HSMAAS');

      const allState = workspaceReducer(freeze(cloudState), {
        type: 'SET_SELECTED_CATEGORY',
        payload: 'ALL'
      });
      expect(allState.selectedCategory).toBe('ALL');
    });

    it('returns state untouched when category filter has not changed', () => {
      const state = freeze(initialWorkspaceState);
      const nextState = workspaceReducer(state, {
        type: 'SET_SELECTED_CATEGORY',
        payload: 'ALL'
      });
      expect(nextState).toBe(state);
    });
  });

  describe('SAVE_HARDWARE_CONNECTION', () => {
    it('saves a new connection and automatically assigns it to open tabs of the same device', () => {
      const openTabState = workspaceReducer(initialWorkspaceState, {
        type: 'OPEN_DEVICE_TAB',
        payload: { deviceId: 'thales-payshield-10k' },
      });

      const tabBefore = openTabState.tabs[0]!;
      expect(tabBefore.commands[0]?.selectedConnectionId).toBeUndefined();
      expect(tabBefore.commands[0]?.liveExecutionEnabled).toBeUndefined();

      const conn = {
        id: 'conn-thales-sim',
        deviceId: 'thales-payshield-10k',
        host: '127.0.0.1',
        port: 1500,
        connectionType: 'TCP' as const,
      };

      const nextState = workspaceReducer(freeze(openTabState), {
        type: 'SAVE_HARDWARE_CONNECTION',
        payload: { connection: conn },
      });

      expect(nextState.hardwareConnections).toHaveLength(1);
      expect(nextState.hardwareConnections[0]).toEqual(conn);

      const tabAfter = nextState.tabs[0]!;
      expect(tabAfter.commands[0]?.selectedConnectionId).toBe('conn-thales-sim');
      expect(tabAfter.commands[0]?.liveExecutionEnabled).toBe(true);
    });
  });
});
