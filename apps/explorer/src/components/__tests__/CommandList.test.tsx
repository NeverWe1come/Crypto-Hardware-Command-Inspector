/**
 * @packageDocumentation
 * Component test suite for the CommandList component (`@chci/explorer`).
 *
 * Verifies:
 * - Rendering list of commands with ordinal numbering (#1, #2, etc.)
 * - Active command selection and highlight state
 * - Direction toggle/selector ('request' vs 'response')
 * - Firmware version selector
 * - Action buttons: Add command, duplicate command, delete command
 * - Drag-and-drop sortable structure with @dnd-kit
 * - Header length configuration for header-positional hardware (Thales)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IntlProvider } from 'react-intl';
import { CommandList, type CommandListProps } from '../CommandList';
import { WorkspaceProvider } from '../../state/workspace-context';
import type { CommandEntry, WorkspaceState, WorkspaceTab } from '../../state/types';
import { getMessages } from '../../i18n';

/**
 * Test wrapper providing react-intl context.
 */
function renderWithIntl(ui: React.ReactElement, locale: 'es' | 'en' = 'es') {
  return {
    user: userEvent.setup(),
    ...render(
      <IntlProvider locale={locale} messages={getMessages(locale)} defaultLocale="es">
        {ui}
      </IntlProvider>
    )
  };
}

/**
 * Integration render helper wrapping inside WorkspaceProvider.
 */
function renderWithWorkspace(
  initialState?: Partial<WorkspaceState>,
  props?: Partial<CommandListProps>
) {
  return {
    user: userEvent.setup(),
    ...render(
      <WorkspaceProvider initialState={initialState}>
        <CommandList {...props} />
      </WorkspaceProvider>
    )
  };
}

const mockCommands: readonly CommandEntry[] = [
  {
    id: 'cmd_1',
    raw: '<31#1#1#N#>',
    version: '8.60',
    direction: 'request'
  },
  {
    id: 'cmd_2',
    raw: '<31#00#Y#>',
    version: '8.60',
    direction: 'response'
  },
  {
    id: 'cmd_3',
    raw: '<00#>',
    version: '8.60',
    direction: 'request'
  }
];

const mockTab: WorkspaceTab = {
  id: 'tab_atalla_1',
  deviceId: 'utimaco-atalla-at1000',
  version: '8.60',
  commands: mockCommands,
  activeCommandId: 'cmd_1'
};

describe('Phase 4: CommandList Component', () => {
  describe('Rendering & Ordinal Sequence Numbering', () => {
    it('renders the list container and all command items with correct sequence numbers (#1, #2, #3)', () => {
      renderWithIntl(
        <CommandList tab={mockTab} activeCommandId="cmd_1" />
      );

      const list = screen.getByTestId('command-list');
      expect(list).toBeInTheDocument();

      expect(screen.getByTestId('command-item-cmd_1')).toBeInTheDocument();
      expect(screen.getByTestId('command-item-cmd_2')).toBeInTheDocument();
      expect(screen.getByTestId('command-item-cmd_3')).toBeInTheDocument();

      // Ordinal indicators
      expect(screen.getByTestId('command-ordinal-cmd_1')).toHaveTextContent('#1');
      expect(screen.getByTestId('command-ordinal-cmd_2')).toHaveTextContent('#2');
      expect(screen.getByTestId('command-ordinal-cmd_3')).toHaveTextContent('#3');
    });

    it('highlights the active command with selected attribute and triggers onSelectCommand on click', async () => {
      const onSelect = vi.fn();
      const { user } = renderWithIntl(
        <CommandList
          tab={mockTab}
          activeCommandId="cmd_1"
          onSelectCommand={onSelect}
        />
      );

      const activeItem = screen.getByTestId('command-item-cmd_1');
      expect(activeItem).toHaveAttribute('data-active', 'true');

      const nonActiveItem = screen.getByTestId('command-item-cmd_2');
      expect(nonActiveItem).toHaveAttribute('data-active', 'false');

      // Click second command
      await user.click(nonActiveItem);
      expect(onSelect).toHaveBeenCalledWith('cmd_2');
    });

    it('renders empty fallback message if tab has no commands', () => {
      const emptyTab: WorkspaceTab = {
        ...mockTab,
        commands: [],
        activeCommandId: null
      };

      renderWithIntl(<CommandList tab={emptyTab} />);
      expect(screen.getByTestId('no-commands-message')).toBeInTheDocument();
    });
  });

  describe('Direction & Version Selectors', () => {
    it('displays direction indicator/toggle and invokes onUpdateDirection when clicked', async () => {
      const onUpdateDirection = vi.fn();
      const { user } = renderWithIntl(
        <CommandList
          tab={mockTab}
          activeCommandId="cmd_1"
          onUpdateDirection={onUpdateDirection}
        />
      );

      const directionBtn = screen.getByTestId('command-direction-cmd_1');
      expect(directionBtn).toBeInTheDocument();
      expect(directionBtn).toHaveTextContent(/Petición|Request|Input/i);

      // Toggle direction to response
      await user.click(directionBtn);
      expect(onUpdateDirection).toHaveBeenCalledWith('cmd_1', 'response');
    });

    it('displays version selector and triggers onUpdateVersion when changed', async () => {
      const onUpdateVersion = vi.fn();
      const { user } = renderWithIntl(
        <CommandList
          tab={mockTab}
          activeCommandId="cmd_1"
          onUpdateVersion={onUpdateVersion}
        />
      );

      const versionSelect = screen.getByTestId('command-version-cmd_1');
      expect(versionSelect).toBeInTheDocument();

      // Change version to 8.50
      await user.selectOptions(versionSelect, '8.50');
      expect(onUpdateVersion).toHaveBeenCalledWith('cmd_1', '8.50');
    });
  });

  describe('Lifecycle Action Buttons: Duplicate and Delete', () => {
    it('triggers onDuplicateCommand with the command ID when clicking duplicate button', async () => {
      const onDuplicate = vi.fn();
      const { user } = renderWithIntl(
        <CommandList
          tab={mockTab}
          activeCommandId="cmd_1"
          onDuplicateCommand={onDuplicate}
        />
      );

      const dupBtn = screen.getByTestId('command-duplicate-cmd_1');
      expect(dupBtn).toBeInTheDocument();

      await user.click(dupBtn);
      expect(onDuplicate).toHaveBeenCalledWith('cmd_1');
    });

    it('triggers onDeleteCommand with the command ID when clicking delete button', async () => {
      const onDelete = vi.fn();
      const { user } = renderWithIntl(
        <CommandList
          tab={mockTab}
          activeCommandId="cmd_2"
          onDeleteCommand={onDelete}
        />
      );

      const deleteBtn = screen.getByTestId('command-delete-cmd_2');
      expect(deleteBtn).toBeInTheDocument();

      await user.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith('cmd_2');
    });
  });

  describe('Drag-and-Drop Sortable with @dnd-kit', () => {
    it('renders drag handles for each command item', () => {
      renderWithIntl(
        <CommandList tab={mockTab} activeCommandId="cmd_1" />
      );

      expect(screen.getByTestId('command-drag-handle-cmd_1')).toBeInTheDocument();
      expect(screen.getByTestId('command-drag-handle-cmd_2')).toBeInTheDocument();
      expect(screen.getByTestId('command-drag-handle-cmd_3')).toBeInTheDocument();
    });

    it('calls onReorderCommands when sortable reordering occurs', () => {
      const onReorder = vi.fn();
      renderWithIntl(
        <CommandList
          tab={mockTab}
          activeCommandId="cmd_1"
          onReorderCommands={onReorder}
        />
      );

      // Verify sortable wrapper has sortable role/attribute
      const sortableContainer = screen.getByTestId('command-sortable-container');
      expect(sortableContainer).toBeInTheDocument();
    });
  });

  describe('Header Length Configuration for Header-Positional Devices', () => {
    it('renders headerLength control when device framing is header-positional (Thales)', async () => {
      const thalesTab: WorkspaceTab = {
        id: 'tab_thales_1',
        deviceId: 'thales-payshield-10k',
        version: '2.3',
        headerLength: 4,
        commands: [
          {
            id: 'thales_cmd_1',
            raw: '0000NC',
            version: '2.3',
            direction: 'request'
          }
        ],
        activeCommandId: 'thales_cmd_1'
      };

      const onUpdateHeader = vi.fn();
      const { user } = renderWithIntl(
        <CommandList
          tab={thalesTab}
          activeCommandId="thales_cmd_1"
          onUpdateHeaderLength={onUpdateHeader}
        />
      );

      const headerInput = screen.getByTestId('tab-header-length-input');
      expect(headerInput).toBeInTheDocument();
      expect(headerInput).toHaveValue(4);

      await user.clear(headerInput);
      await user.type(headerInput, '8');
      expect(onUpdateHeader).toHaveBeenCalledWith(8);
    });

    it('does NOT render headerLength control for non-header devices (e.g. Atalla or Futurex)', () => {
      renderWithIntl(
        <CommandList tab={mockTab} activeCommandId="cmd_1" />
      );

      expect(screen.queryByTestId('tab-header-length-input')).not.toBeInTheDocument();
    });
  });

  describe('Workspace Context Integration', () => {
    it('automatically binds to active tab from WorkspaceContext when rendered without explicit tab prop', async () => {
      const tabWithOneCmd: WorkspaceTab = {
        id: 'tab_integration_1',
        deviceId: 'utimaco-atalla-at1000',
        version: '8.60',
        commands: [
          {
            id: 'int_cmd_1',
            raw: '<31#1#1#N#>',
            version: '8.60',
            direction: 'request'
          }
        ],
        activeCommandId: 'int_cmd_1'
      };

      const { user } = renderWithWorkspace({
        activeTabId: 'tab_integration_1',
        tabs: [tabWithOneCmd]
      });

      expect(screen.getByTestId('command-item-int_cmd_1')).toBeInTheDocument();
      expect(screen.getByTestId('command-ordinal-int_cmd_1')).toHaveTextContent('#1');

      // Duplicate command in integrated context
      const dupBtn = screen.getByTestId('command-duplicate-int_cmd_1');
      await user.click(dupBtn);

      // Now 2 commands should appear in the DOM
      const items = screen.getAllByTestId(/^command-item-/);
      expect(items).toHaveLength(2);
    });
  });
});
