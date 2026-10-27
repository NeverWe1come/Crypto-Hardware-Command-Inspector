/**
 * @packageDocumentation
 * Unit test suite for Phase 4 command actions in the workspace reducer (`@chci/explorer`).
 *
 * Verifies all command lifecycle operations:
 * - ADD_COMMAND
 * - DELETE_COMMAND
 * - DUPLICATE_COMMAND
 * - UPDATE_COMMAND_RAW
 * - UPDATE_COMMAND_DIRECTION
 * - UPDATE_COMMAND_VERSION
 * - UPDATE_TAB_HEADER_LENGTH
 * - REORDER_COMMANDS
 * - SELECT_COMMAND
 *
 * Ensures strict immutability, unique ID generation, edge cases (single command deletion,
 * missing tab/command fallbacks), and pure state transitions.
 */

import { describe, expect, it } from 'vitest';
import { initialWorkspaceState, workspaceReducer } from '../workspace-reducer';
import type { CommandEntry, WorkspaceState, WorkspaceTab } from '../types';

/**
 * Deep-freeze helper to guarantee that pure reducer operations never mutate state in-place.
 */
function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

/**
 * Helper to build a test state with one open device tab and specified commands.
 */
function createTestStateWithTab(options?: {
  readonly deviceId?: string;
  readonly tabId?: string;
  readonly commands?: readonly CommandEntry[];
  readonly activeCommandId?: string | null;
  readonly headerLength?: number;
}): WorkspaceState {
  const tabId = options?.tabId ?? 'tab_test_1';
  const deviceId = options?.deviceId ?? 'utimaco-atalla-at1000';
  const initialCommands: readonly CommandEntry[] = options?.commands ?? [
    {
      id: 'cmd_1',
      raw: '<31#1#1#N#>',
      version: '8.60',
      direction: 'request',
      linkedCommandId: null
    }
  ];

  const tab: WorkspaceTab = {
    id: tabId,
    deviceId,
    version: '8.60',
    headerLength: options?.headerLength,
    commands: initialCommands,
    activeCommandId: options?.activeCommandId ?? initialCommands[0]?.id ?? null
  };

  return {
    ...initialWorkspaceState,
    activeTabId: tabId,
    tabs: [tab]
  };
}

describe('Phase 4: Workspace Command Actions Reducer', () => {
  describe('ADD_COMMAND', () => {
    it('adds an empty command with request direction and unique ID to the active tab', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'ADD_COMMAND'
      });

      const tab = nextState.tabs.find((t) => t.id === state.activeTabId)!;
      expect(tab.commands).toHaveLength(2);

      const added = tab.commands[1]!;
      expect(added.id).toBeDefined();
      expect(added.id).not.toBe('cmd_1');
      expect(added.raw).toBe('');
      expect(added.direction).toBe('request');
      expect(added.version).toBe('8.60');
      expect(added.linkedCommandId).toBeNull();

      // The new command becomes active
      expect(tab.activeCommandId).toBe(added.id);
    });

    it('supports custom initial raw, direction, and version via payload', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'ADD_COMMAND',
        payload: {
          initialRaw: '0000NC',
          initialDirection: 'response',
          initialVersion: '8.50',
          commandId: 'cmd_custom_id'
        }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands).toHaveLength(2);

      const added = tab.commands[1]!;
      expect(added.id).toBe('cmd_custom_id');
      expect(added.raw).toBe('0000NC');
      expect(added.direction).toBe('response');
      expect(added.version).toBe('8.50');
      expect(tab.activeCommandId).toBe('cmd_custom_id');
    });

    it('adds command to a specifically targeted tabId even if not activeTabId', () => {
      const tab1 = createTestStateWithTab({ tabId: 'tab_1' }).tabs[0]!;
      const tab2 = createTestStateWithTab({ tabId: 'tab_2', deviceId: 'thales-payshield-10k' }).tabs[0]!;
      const state = deepFreeze({
        ...initialWorkspaceState,
        activeTabId: 'tab_1',
        tabs: [tab1, tab2]
      });

      const nextState = workspaceReducer(state, {
        type: 'ADD_COMMAND',
        payload: { tabId: 'tab_2', commandId: 'cmd_for_tab_2' }
      });

      const updatedTab2 = nextState.tabs.find((t) => t.id === 'tab_2')!;
      expect(updatedTab2.commands).toHaveLength(2);
      expect(updatedTab2.commands[1]?.id).toBe('cmd_for_tab_2');
      expect(updatedTab2.activeCommandId).toBe('cmd_for_tab_2');

      // tab 1 should be untouched
      const tab1After = nextState.tabs.find((t) => t.id === 'tab_1')!;
      expect(tab1After.commands).toHaveLength(1);
    });

    it('returns state untouched when there is no active tab and no tabId specified', () => {
      const state = deepFreeze({
        ...initialWorkspaceState,
        activeTabId: null,
        tabs: []
      });

      const nextState = workspaceReducer(state, {
        type: 'ADD_COMMAND'
      });

      expect(nextState).toBe(state);
    });

    it('returns state untouched when specified tabId does not exist', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'ADD_COMMAND',
        payload: { tabId: 'non_existent_tab' }
      });

      expect(nextState).toBe(state);
    });
  });

  describe('DELETE_COMMAND', () => {
    it('deletes command by ID and selects adjacent command if deleted was active', () => {
      const commands: CommandEntry[] = [
        { id: 'cmd_1', raw: '<31#>', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_2', raw: '<32#>', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_3', raw: '<33#>', version: '8.60', direction: 'request', linkedCommandId: null }
      ];
      const state = deepFreeze(createTestStateWithTab({ commands, activeCommandId: 'cmd_2' }));

      const nextState = workspaceReducer(state, {
        type: 'DELETE_COMMAND',
        payload: { commandId: 'cmd_2' }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands).toHaveLength(2);
      expect(tab.commands.map((c) => c.id)).toEqual(['cmd_1', 'cmd_3']);
      // Active command transitions to adjacent command (cmd_1)
      expect(tab.activeCommandId).toBe('cmd_1');
    });

    it('selects next command if the first command was deleted and was active', () => {
      const commands: CommandEntry[] = [
        { id: 'cmd_1', raw: '<31#>', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_2', raw: '<32#>', version: '8.60', direction: 'request', linkedCommandId: null }
      ];
      const state = deepFreeze(createTestStateWithTab({ commands, activeCommandId: 'cmd_1' }));

      const nextState = workspaceReducer(state, {
        type: 'DELETE_COMMAND',
        payload: { commandId: 'cmd_1' }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands).toHaveLength(1);
      expect(tab.commands[0]?.id).toBe('cmd_2');
      expect(tab.activeCommandId).toBe('cmd_2');
    });

    it('keeps activeCommandId unchanged if the deleted command was not the active one', () => {
      const commands: CommandEntry[] = [
        { id: 'cmd_1', raw: '<31#>', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_2', raw: '<32#>', version: '8.60', direction: 'request', linkedCommandId: null }
      ];
      const state = deepFreeze(createTestStateWithTab({ commands, activeCommandId: 'cmd_1' }));

      const nextState = workspaceReducer(state, {
        type: 'DELETE_COMMAND',
        payload: { commandId: 'cmd_2' }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands).toHaveLength(1);
      expect(tab.activeCommandId).toBe('cmd_1');
    });

    it('automatically generates a new empty command if the ONLY command in the tab is deleted', () => {
      const commands: CommandEntry[] = [
        { id: 'cmd_solo', raw: '<31#1#1#N#>', version: '8.60', direction: 'request', linkedCommandId: null }
      ];
      const state = deepFreeze(createTestStateWithTab({ commands, activeCommandId: 'cmd_solo' }));

      const nextState = workspaceReducer(state, {
        type: 'DELETE_COMMAND',
        payload: { commandId: 'cmd_solo' }
      });

      const tab = nextState.tabs[0]!;
      // A tab must never have 0 commands; a fresh command is created
      expect(tab.commands).toHaveLength(1);
      const newCmd = tab.commands[0]!;
      expect(newCmd.id).not.toBe('cmd_solo');
      expect(newCmd.raw).toBe('');
      expect(newCmd.direction).toBe('request');
      expect(newCmd.version).toBe('8.60');
      expect(tab.activeCommandId).toBe(newCmd.id);
    });

    it('returns state untouched when commandId is not found', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'DELETE_COMMAND',
        payload: { commandId: 'cmd_unknown' }
      });

      expect(nextState).toBe(state);
    });
  });

  describe('DUPLICATE_COMMAND', () => {
    it('duplicates command with unique ID and inserts it immediately following the source command', () => {
      const commands: CommandEntry[] = [
        { id: 'cmd_1', raw: '<31#1#>', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_2', raw: '<32#2#>', version: '8.60', direction: 'request', linkedCommandId: null }
      ];
      const state = deepFreeze(createTestStateWithTab({ commands, activeCommandId: 'cmd_1' }));

      const nextState = workspaceReducer(state, {
        type: 'DUPLICATE_COMMAND',
        payload: { commandId: 'cmd_1' }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands).toHaveLength(3);

      // Order should be: cmd_1, duplicated, cmd_2
      expect(tab.commands[0]?.id).toBe('cmd_1');
      const duplicated = tab.commands[1]!;
      expect(duplicated.id).toBeDefined();
      expect(duplicated.id).not.toBe('cmd_1');
      expect(duplicated.id).not.toBe('cmd_2');
      expect(duplicated.raw).toBe('<31#1#>');
      expect(duplicated.version).toBe('8.60');
      expect(duplicated.direction).toBe('request');
      expect(duplicated.linkedCommandId).toBeNull();

      expect(tab.commands[2]?.id).toBe('cmd_2');
      // The duplicated command becomes active
      expect(tab.activeCommandId).toBe(duplicated.id);
    });

    it('returns state untouched if commandId does not exist', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'DUPLICATE_COMMAND',
        payload: { commandId: 'missing_id' }
      });

      expect(nextState).toBe(state);
    });
  });

  describe('UPDATE_COMMAND_RAW', () => {
    it('updates raw text of the specified command', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'UPDATE_COMMAND_RAW',
        payload: {
          commandId: 'cmd_1',
          raw: '<31#1#1#N#Y#>'
        }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands[0]?.raw).toBe('<31#1#1#N#Y#>');
    });

    it('handles empty raw string and raw text with control characters correctly', () => {
      const state = deepFreeze(createTestStateWithTab());
      const rawWithControl = '0000NC\x19TRAILER';
      const nextState = workspaceReducer(state, {
        type: 'UPDATE_COMMAND_RAW',
        payload: {
          commandId: 'cmd_1',
          raw: rawWithControl
        }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands[0]?.raw).toBe(rawWithControl);
    });

    it('returns state untouched if raw text is identical', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'UPDATE_COMMAND_RAW',
        payload: {
          commandId: 'cmd_1',
          raw: '<31#1#1#N#>' // same as initial
        }
      });

      expect(nextState).toBe(state);
    });

    it('returns state untouched if commandId is not found', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'UPDATE_COMMAND_RAW',
        payload: {
          commandId: 'non_existent_cmd',
          raw: 'test'
        }
      });

      expect(nextState).toBe(state);
    });
  });

  describe('UPDATE_COMMAND_DIRECTION', () => {
    it('updates direction from request to response', () => {
      const state = deepFreeze(createTestStateWithTab());
      expect(state.tabs[0]?.commands[0]?.direction).toBe('request');

      const nextState = workspaceReducer(state, {
        type: 'UPDATE_COMMAND_DIRECTION',
        payload: {
          commandId: 'cmd_1',
          direction: 'response'
        }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands[0]?.direction).toBe('response');
    });

    it('returns state untouched if direction has not changed', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'UPDATE_COMMAND_DIRECTION',
        payload: {
          commandId: 'cmd_1',
          direction: 'request'
        }
      });

      expect(nextState).toBe(state);
    });
  });

  describe('UPDATE_COMMAND_VERSION', () => {
    it('updates version of the specified command', () => {
      const state = deepFreeze(createTestStateWithTab());
      expect(state.tabs[0]?.commands[0]?.version).toBe('8.60');

      const nextState = workspaceReducer(state, {
        type: 'UPDATE_COMMAND_VERSION',
        payload: {
          commandId: 'cmd_1',
          version: '8.50'
        }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands[0]?.version).toBe('8.50');
    });

    it('returns state untouched if version has not changed', () => {
      const state = deepFreeze(createTestStateWithTab());
      const nextState = workspaceReducer(state, {
        type: 'UPDATE_COMMAND_VERSION',
        payload: {
          commandId: 'cmd_1',
          version: '8.60'
        }
      });

      expect(nextState).toBe(state);
    });
  });

  describe('UPDATE_TAB_HEADER_LENGTH', () => {
    it('updates headerLength on the specified tab (e.g. for Thales payShield 10K)', () => {
      const state = deepFreeze(
        createTestStateWithTab({
          deviceId: 'thales-payshield-10k',
          headerLength: 4
        })
      );
      expect(state.tabs[0]?.headerLength).toBe(4);

      const nextState = workspaceReducer(state, {
        type: 'UPDATE_TAB_HEADER_LENGTH',
        payload: {
          headerLength: 8
        }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.headerLength).toBe(8);
    });

    it('supports setting headerLength to 0 (no header mode)', () => {
      const state = deepFreeze(
        createTestStateWithTab({
          deviceId: 'thales-payshield-10k',
          headerLength: 4
        })
      );

      const nextState = workspaceReducer(state, {
        type: 'UPDATE_TAB_HEADER_LENGTH',
        payload: {
          headerLength: 0
        }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.headerLength).toBe(0);
    });

    it('returns state untouched if headerLength is identical or negative', () => {
      const state = deepFreeze(
        createTestStateWithTab({
          deviceId: 'thales-payshield-10k',
          headerLength: 4
        })
      );

      const sameState = workspaceReducer(state, {
        type: 'UPDATE_TAB_HEADER_LENGTH',
        payload: { headerLength: 4 }
      });
      expect(sameState).toBe(state);

      const negativeState = workspaceReducer(state, {
        type: 'UPDATE_TAB_HEADER_LENGTH',
        payload: { headerLength: -1 }
      });
      expect(negativeState).toBe(state);
    });
  });

  describe('REORDER_COMMANDS', () => {
    it('reorders commands according to provided ID list resulting from drag-and-drop', () => {
      const commands: CommandEntry[] = [
        { id: 'cmd_1', raw: '1', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_2', raw: '2', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_3', raw: '3', version: '8.60', direction: 'request', linkedCommandId: null }
      ];
      const state = deepFreeze(createTestStateWithTab({ commands }));

      const nextState = workspaceReducer(state, {
        type: 'REORDER_COMMANDS',
        payload: {
          commandIds: ['cmd_3', 'cmd_1', 'cmd_2']
        }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.commands.map((c) => c.id)).toEqual(['cmd_3', 'cmd_1', 'cmd_2']);
      expect(tab.commands[0]?.raw).toBe('3');
      expect(tab.commands[1]?.raw).toBe('1');
      expect(tab.commands[2]?.raw).toBe('2');
    });

    it('returns state untouched if the new order is identical to the current order', () => {
      const commands: CommandEntry[] = [
        { id: 'cmd_1', raw: '1', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_2', raw: '2', version: '8.60', direction: 'request', linkedCommandId: null }
      ];
      const state = deepFreeze(createTestStateWithTab({ commands }));

      const nextState = workspaceReducer(state, {
        type: 'REORDER_COMMANDS',
        payload: {
          commandIds: ['cmd_1', 'cmd_2']
        }
      });

      expect(nextState).toBe(state);
    });

    it('returns state untouched if commandIds array does not match the set of commands', () => {
      const commands: CommandEntry[] = [
        { id: 'cmd_1', raw: '1', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_2', raw: '2', version: '8.60', direction: 'request', linkedCommandId: null }
      ];
      const state = deepFreeze(createTestStateWithTab({ commands }));

      const invalidState = workspaceReducer(state, {
        type: 'REORDER_COMMANDS',
        payload: {
          commandIds: ['cmd_1', 'unknown_id']
        }
      });

      expect(invalidState).toBe(state);
    });
  });

  describe('SELECT_COMMAND', () => {
    it('updates activeCommandId to the requested commandId', () => {
      const commands: CommandEntry[] = [
        { id: 'cmd_1', raw: '1', version: '8.60', direction: 'request', linkedCommandId: null },
        { id: 'cmd_2', raw: '2', version: '8.60', direction: 'request', linkedCommandId: null }
      ];
      const state = deepFreeze(createTestStateWithTab({ commands, activeCommandId: 'cmd_1' }));

      const nextState = workspaceReducer(state, {
        type: 'SELECT_COMMAND',
        payload: { commandId: 'cmd_2' }
      });

      const tab = nextState.tabs[0]!;
      expect(tab.activeCommandId).toBe('cmd_2');
    });

    it('returns state untouched if selected command is already the activeCommandId', () => {
      const state = deepFreeze(createTestStateWithTab({ activeCommandId: 'cmd_1' }));
      const nextState = workspaceReducer(state, {
        type: 'SELECT_COMMAND',
        payload: { commandId: 'cmd_1' }
      });

      expect(nextState).toBe(state);
    });

    it('returns state untouched if commandId does not exist in the tab', () => {
      const state = deepFreeze(createTestStateWithTab({ activeCommandId: 'cmd_1' }));
      const nextState = workspaceReducer(state, {
        type: 'SELECT_COMMAND',
        payload: { commandId: 'cmd_nonexistent' }
      });

      expect(nextState).toBe(state);
    });
  });
});
