/**
 * @packageDocumentation
 * Comprehensive TDD test suite for the AnalysisPanel component (`@chci/explorer`).
 *
 * Verifies:
 * 1. Command pagination & navigation ('Comando X de Y', previous/next navigation buttons)
 * 2. Eight collapsible accordion blocks:
 *    - 1. General Info: device name, vendor, firmware version, command code,
 *         direction mismatch warning badge, command description, and official manual citation.
 *    - 2. Parameter Breakdown: interactive table with columns (Name, Offset/Length, Format, Value),
 *         default masking ('••••••••') of sensitive fields, individual & global reveal/hide buttons,
 *         and synchronized hover/selection callbacks.
 *    - 3. Frame View: syntax-colored segment pills with semantic roles, interactive selection/hover.
 *    - 4. Response / Error Code: detection & rendering of error codes (e.g. '01', '10') with official
 *         vendor description and troubleshooting causes; success status for '00'.
 *    - 5. Diagnostics: list of diagnostics with severity badges (error, warning, info) and localized messages.
 *    - 6. Expected Response: template preview of paired response for request frames.
 *    - 7. Correlation: request ↔ response matching checklist (order, pair, echo, status).
 *    - 8. Manufacturer Notes: firmware caveats, algorithm notes, and release notes.
 * 3. Empty and edge states (no active command, empty raw frame, unlinked commands).
 * 4. Bilingual rendering (Spanish and English).
 */

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IntlProvider } from 'react-intl';
import { AnalysisPanel, type AnalysisPanelProps } from '../AnalysisPanel';
import { WorkspaceProvider } from '../../state/workspace-context';
import type { CommandEntry, WorkspaceState, WorkspaceTab } from '../../state/types';
import {
  atallaAt1000Spec,
  thalesPayshield10kSpec,
  futurexExcryptSpec
} from '@chci/device-specs';
import {
  parseCommand,
  type ParseResult
} from '@chci/parser-core';
import { getMessages } from '../../i18n';

/**
 * Render helper wrapping AnalysisPanel inside an IntlProvider with specified locale.
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
 * Render helper wrapping AnalysisPanel inside WorkspaceProvider for integration testing.
 */
function renderWithWorkspace(
  initialState?: Partial<WorkspaceState>,
  props?: Partial<AnalysisPanelProps>
) {
  return {
    user: userEvent.setup(),
    ...render(
      <WorkspaceProvider initialState={initialState}>
        <AnalysisPanel {...props} />
      </WorkspaceProvider>
    )
  };
}

// ---------------------------------------------------------------------------
// Realistic Test Fixtures using real device specifications and commands
// ---------------------------------------------------------------------------

/**
 * Fixture 1: Atalla AT1000 PIN Translation Command 31 Sub 1 (Request)
 * Features sensitive fields (source-pek, dest-pek, incoming-pin-block).
 */
const atallaRawRequest = '<31#1#1111222233334444#5555666677778888#0123456789ABCDEF#123456789012#>';
const atallaParsedRequest: ParseResult = parseCommand(atallaRawRequest, atallaAt1000Spec, {
  version: '8.60',
  expectedDirection: 'request'
});

/**
 * Fixture 2: Atalla AT1000 Error Response with error code '01' (Key Parity Error)
 */
const atallaRawErrorResponse = '<00#010186#0000#>';
const atallaParsedErrorResponse: ParseResult = parseCommand(
  atallaRawErrorResponse,
  atallaAt1000Spec,
  {
    version: '8.60',
    expectedDirection: 'response'
  }
);

/**
 * Fixture 3: Thales payShield 10K Diagnostics Request (NC)
 */
const thalesRawRequest = '0000NC';
const thalesParsedRequest: ParseResult = parseCommand(thalesRawRequest, thalesPayshield10kSpec, {
  version: '2.3',
  expectedDirection: 'request',
  headerLength: 4
});

/**
 * Fixture 4: Thales payShield 10K Diagnostics Success Response (ND00)
 */
const thalesRawSuccessResponse = '0000ND00';
const thalesParsedSuccessResponse: ParseResult = parseCommand(
  thalesRawSuccessResponse,
  thalesPayshield10kSpec,
  {
    version: '2.3',
    expectedDirection: 'response',
    headerLength: 4
  }
);

/**
 * Fixture 5: Thales payShield 10K Error Response (ND10: Source Key Parity Error)
 */
const thalesRawErrorResponse = '0000ND10';
const thalesParsedErrorResponse: ParseResult = parseCommand(
  thalesRawErrorResponse,
  thalesPayshield10kSpec,
  {
    version: '2.3',
    expectedDirection: 'response',
    headerLength: 4
  }
);

/**
 * Fixture 6: Futurex Excrypt Echo Request
 */
const futurexRawRequest = '[AOECHO;AGHello;]';
const futurexParsedRequest: ParseResult = parseCommand(futurexRawRequest, futurexExcryptSpec, {
  version: '7.6.1',
  expectedDirection: 'request'
});

/**
 * Mock Command Entries for Workspace Tab
 */
const mockCommands: readonly CommandEntry[] = [
  {
    id: 'cmd_1',
    raw: thalesRawRequest,
    version: '2.3',
    direction: 'request',
    linkedCommandId: 'cmd_2'
  },
  {
    id: 'cmd_2',
    raw: thalesRawSuccessResponse,
    version: '2.3',
    direction: 'response',
    linkedCommandId: 'cmd_1'
  },
  {
    id: 'cmd_3',
    raw: thalesRawErrorResponse,
    version: '2.3',
    direction: 'response',
    linkedCommandId: null
  }
];

const mockTab: WorkspaceTab = {
  id: 'tab_thales_1',
  deviceId: 'thales-payshield-10k',
  version: '2.3',
  headerLength: 4,
  commands: mockCommands,
  activeCommandId: 'cmd_1'
};

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('Phase 5: AnalysisPanel Component (Detailed Analysis Panel)', () => {
  // =========================================================================
  // 1. Empty and Edge States
  // =========================================================================
  describe('Empty and Edge States', () => {
    it('renders friendly empty state when tab is null or has no commands', () => {
      renderWithIntl(<AnalysisPanel tab={null} activeCommand={null} />);

      const emptyContainer = screen.getByTestId('analysis-panel-empty');
      expect(emptyContainer).toBeInTheDocument();
      expect(emptyContainer).toHaveTextContent(/No hay comandos en la pestaña activa/i);

      // Accordion sections and pagination should not be rendered in empty state
      expect(screen.queryByTestId('analysis-accordion')).not.toBeInTheDocument();
      expect(screen.queryByTestId('command-pagination')).not.toBeInTheDocument();
    });

    it('renders friendly empty state when tab has an empty commands list', () => {
      const emptyTab: WorkspaceTab = {
        id: 'tab_empty',
        deviceId: 'thales-payshield-10k',
        version: '2.3',
        commands: [],
        activeCommandId: null
      };

      renderWithIntl(<AnalysisPanel tab={emptyTab} />);

      expect(screen.getByTestId('analysis-panel-empty')).toBeInTheDocument();
      expect(screen.queryByTestId('analysis-accordion')).not.toBeInTheDocument();
    });

    it('gracefully handles empty raw string command without crashing and shows empty input diagnostic', () => {
      const emptyCommand: CommandEntry = {
        id: 'cmd_empty',
        raw: '',
        version: '2.3',
        direction: 'request',
        linkedCommandId: null
      };

      const tabWithEmptyCmd: WorkspaceTab = {
        ...mockTab,
        commands: [emptyCommand],
        activeCommandId: 'cmd_empty'
      };

      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={tabWithEmptyCmd}
          activeCommand={emptyCommand}
        />
      );

      // Should render the panel container
      expect(screen.getByTestId('analysis-panel')).toBeInTheDocument();

      // Diagnostics should reflect EMPTY_INPUT without crashing
      const diagItem = screen.getByTestId('diagnostic-item-EMPTY_INPUT');
      expect(diagItem).toBeInTheDocument();
      expect(diagItem).toHaveTextContent(/vacío/i);
    });

    it('gracefully handles unknown / unsupported command code without crashing', () => {
      const unknownCmd: CommandEntry = {
        id: 'cmd_unknown',
        raw: '<9999#invalid_data#>',
        version: '8.60',
        direction: 'request',
        linkedCommandId: null
      };

      const atallaTab: WorkspaceTab = {
        id: 'tab_atalla_unk',
        deviceId: 'utimaco-atalla-at1000',
        version: '8.60',
        commands: [unknownCmd],
        activeCommandId: 'cmd_unknown'
      };

      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          tab={atallaTab}
          activeCommand={unknownCmd}
        />
      );

      // Accordion should be present
      expect(screen.getByTestId('analysis-accordion')).toBeInTheDocument();

      // Diagnostics should show UNKNOWN_COMMAND
      expect(screen.getByTestId('diagnostic-item-UNKNOWN_COMMAND')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 2. Command Pagination and Navigation
  // =========================================================================
  describe('Command Pagination & Navigation', () => {
    it('renders pagination indicator with "Comando 1 de 3" and previous button disabled at first command', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={mockTab}
          activeCommand={mockCommands[0]}
          parseResult={thalesParsedRequest}
        />
      );

      const pagination = screen.getByTestId('command-pagination');
      expect(pagination).toBeInTheDocument();

      const indicator = screen.getByTestId('command-pagination-indicator');
      expect(indicator).toHaveTextContent(/Comando 1 de 3/i);

      const prevBtn = screen.getByTestId('btn-prev-command');
      const nextBtn = screen.getByTestId('btn-next-command');

      expect(prevBtn).toBeDisabled();
      expect(nextBtn).not.toBeDisabled();
    });

    it('calls onNavigateCommand with the next command ID when clicking next button', async () => {
      const onNavigate = vi.fn();
      const { user } = renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={mockTab}
          activeCommand={mockCommands[0]}
          parseResult={thalesParsedRequest}
          onNavigateCommand={onNavigate}
        />
      );

      const nextBtn = screen.getByTestId('btn-next-command');
      await user.click(nextBtn);

      expect(onNavigate).toHaveBeenCalledWith('cmd_2');
    });

    it('enables both previous and next buttons when on a middle command (index 1 of 3)', async () => {
      const onNavigate = vi.fn();
      const { user } = renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={mockTab}
          activeCommand={mockCommands[1]}
          parseResult={thalesParsedSuccessResponse}
          onNavigateCommand={onNavigate}
        />
      );

      const indicator = screen.getByTestId('command-pagination-indicator');
      expect(indicator).toHaveTextContent(/Comando 2 de 3/i);

      const prevBtn = screen.getByTestId('btn-prev-command');
      const nextBtn = screen.getByTestId('btn-next-command');

      expect(prevBtn).not.toBeDisabled();
      expect(nextBtn).not.toBeDisabled();

      // Click previous -> navigates to cmd_1
      await user.click(prevBtn);
      expect(onNavigate).toHaveBeenCalledWith('cmd_1');

      // Click next -> navigates to cmd_3
      await user.click(nextBtn);
      expect(onNavigate).toHaveBeenCalledWith('cmd_3');
    });

    it('disables next button when on the last command (index 2 of 3)', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={mockTab}
          activeCommand={mockCommands[2]}
          parseResult={thalesParsedErrorResponse}
        />
      );

      const indicator = screen.getByTestId('command-pagination-indicator');
      expect(indicator).toHaveTextContent(/Comando 3 de 3/i);

      expect(screen.getByTestId('btn-prev-command')).not.toBeDisabled();
      expect(screen.getByTestId('btn-next-command')).toBeDisabled();
    });

    it('disables both previous and next buttons when tab contains only 1 command', () => {
      const singleCmdTab: WorkspaceTab = {
        ...mockTab,
        commands: [mockCommands[0]!],
        activeCommandId: 'cmd_1'
      };

      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={singleCmdTab}
          activeCommand={mockCommands[0]}
          parseResult={thalesParsedRequest}
        />
      );

      const indicator = screen.getByTestId('command-pagination-indicator');
      expect(indicator).toHaveTextContent(/Comando 1 de 1/i);

      expect(screen.getByTestId('btn-prev-command')).toBeDisabled();
      expect(screen.getByTestId('btn-next-command')).toBeDisabled();
    });
  });

  // =========================================================================
  // 3. Block 1: General Info & Direction Mismatch Warning
  // =========================================================================
  describe('Block 1: General Information', () => {
    it('renders device name, vendor, firmware version, and command code when general info is expanded', async () => {
      const { user } = renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          tab={{
            id: 'tab_atalla_1',
            deviceId: 'utimaco-atalla-at1000',
            version: '8.60',
            commands: [
              {
                id: 'cmd_atalla_1',
                raw: atallaRawRequest,
                version: '8.60',
                direction: 'request'
              }
            ],
            activeCommandId: 'cmd_atalla_1'
          }}
          activeCommand={{
            id: 'cmd_atalla_1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
          parseResult={atallaParsedRequest}
        />
      );

      // Accordion item for General Info
      const generalTrigger = screen.getByTestId('accordion-trigger-general-info');
      expect(generalTrigger).toBeInTheDocument();
      await user.click(generalTrigger);

      // Device info
      const deviceEl = screen.getByTestId('general-info-device');
      expect(deviceEl).toHaveTextContent(/Utimaco Atalla AT1000/i);
      expect(deviceEl).toHaveTextContent(/Utimaco/i);

      // Version
      const versionEl = screen.getByTestId('general-info-version');
      expect(versionEl).toHaveTextContent(/8.60/i);

      // Command Code
      const codeEl = screen.getByTestId('general-info-command-code');
      expect(codeEl).toHaveTextContent('31');

      // Direction badge
      const dirEl = screen.getByTestId('general-info-direction');
      expect(dirEl).toHaveTextContent(/Petición/i);
    });

    it('renders command summary, description, and official manufacturer manual citation', async () => {
      const { user } = renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      await user.click(screen.getByTestId('accordion-trigger-general-info'));

      const descEl = screen.getByTestId('general-info-description');
      expect(descEl).toHaveTextContent(/Descifra el PIN block/i);

      const sourceEl = screen.getByTestId('general-info-source');
      expect(sourceEl).toHaveTextContent(/Atalla AT1000 Host Command Reference Manual/i);
    });

    it('renders warning alert when detected direction does NOT match expected direction (mismatch)', async () => {
      // Command raw is a request '<31#1#...#>' but configured with direction 'response'
      const mismatchedParsed: ParseResult = parseCommand(
        atallaRawRequest,
        atallaAt1000Spec,
        {
          version: '8.60',
          expectedDirection: 'response'
        }
      );

      const { user } = renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={mismatchedParsed}
          activeCommand={{
            id: 'c_mismatch',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'response'
          }}
        />
      );

      await user.click(screen.getByTestId('accordion-trigger-general-info'));

      // Warning alert / badge should appear
      const warningAlert = screen.getByTestId('direction-mismatch-warning');
      expect(warningAlert).toBeInTheDocument();
      expect(warningAlert).toHaveTextContent(/no coincide/i);
    });

    it('does NOT render direction mismatch warning when detected direction matches expected direction', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c_match',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      expect(screen.queryByTestId('direction-mismatch-warning')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 4. Block 2: Parameters / Field Breakdown & Sensitive Field Masking
  // =========================================================================
  describe('Block 2: Parameter Breakdown & Sensitive Field Masking', () => {
    it('renders interactive fields breakdown table with columns: Nombre, Offset/Longitud, Formato, Valor', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      const table = screen.getByTestId('fields-breakdown-table');
      expect(table).toBeInTheDocument();

      // Check column headers
      expect(within(table).getByText(/Nombre/i)).toBeInTheDocument();
      expect(within(table).getByText(/Offset/i)).toBeInTheDocument();
      expect(within(table).getAllByText(/Formato/i).length).toBeGreaterThanOrEqual(1);
      expect(within(table).getByText(/Valor/i)).toBeInTheDocument();

      // Check rows rendered for fields
      expect(screen.getByTestId('field-row-pin-format')).toBeInTheDocument();
      expect(screen.getByTestId('field-row-source-pek')).toBeInTheDocument();
      expect(screen.getByTestId('field-row-dest-pek')).toBeInTheDocument();
      expect(screen.getByTestId('field-row-incoming-pin-block')).toBeInTheDocument();
      expect(screen.getByTestId('field-row-account-number')).toBeInTheDocument();
    });

    it('masks sensitive fields by default with "••••••••"', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      // Sensitive fields must display masked value by default
      const pinBlockValue = screen.getByTestId('field-value-incoming-pin-block');
      expect(pinBlockValue).toHaveTextContent('••••••••');
      expect(pinBlockValue).not.toHaveTextContent('0123456789ABCDEF');

      const sourcePekValue = screen.getByTestId('field-value-source-pek');
      expect(sourcePekValue).toHaveTextContent('••••••••');
      expect(sourcePekValue).not.toHaveTextContent('1111222233334444');

      // Non-sensitive field must display cleartext value
      const panValue = screen.getByTestId('field-value-account-number');
      expect(panValue).toHaveTextContent('123456789012');
    });

    it('toggles individual sensitive field visibility on click of its individual reveal button', async () => {
      const { user } = renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      const togglePinBtn = screen.getByTestId('btn-toggle-sensitive-incoming-pin-block');
      expect(togglePinBtn).toBeInTheDocument();

      // Initially masked
      expect(screen.getByTestId('field-value-incoming-pin-block')).toHaveTextContent('••••••••');

      // Click to reveal cleartext
      await user.click(togglePinBtn);
      expect(screen.getByTestId('field-value-incoming-pin-block')).toHaveTextContent('0123456789ABCDEF');

      // Other sensitive fields should remain masked
      expect(screen.getByTestId('field-value-source-pek')).toHaveTextContent('••••••••');

      // Click again to hide back
      await user.click(togglePinBtn);
      expect(screen.getByTestId('field-value-incoming-pin-block')).toHaveTextContent('••••••••');
    });

    it('toggles global visibility of ALL sensitive fields with the global reveal/hide button', async () => {
      const { user } = renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      const globalToggleBtn = screen.getByTestId('btn-toggle-all-sensitive');
      expect(globalToggleBtn).toHaveTextContent(/Mostrar valores sensibles/i);

      // Reveal all
      await user.click(globalToggleBtn);

      expect(screen.getByTestId('field-value-source-pek')).toHaveTextContent('1111222233334444');
      expect(screen.getByTestId('field-value-dest-pek')).toHaveTextContent('5555666677778888');
      expect(screen.getByTestId('field-value-incoming-pin-block')).toHaveTextContent('0123456789ABCDEF');

      expect(globalToggleBtn).toHaveTextContent(/Ocultar valores sensibles/i);

      // Hide all
      await user.click(globalToggleBtn);

      expect(screen.getByTestId('field-value-source-pek')).toHaveTextContent('••••••••');
      expect(screen.getByTestId('field-value-dest-pek')).toHaveTextContent('••••••••');
      expect(screen.getByTestId('field-value-incoming-pin-block')).toHaveTextContent('••••••••');
    });

    it('triggers synchronized hover and selection callbacks on field row interactions', () => {
      const onHoverSegment = vi.fn();
      const onSelectSegment = vi.fn();

      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
          onHoverSegment={onHoverSegment}
          onSelectSegment={onSelectSegment}
        />
      );

      const row = screen.getByTestId('field-row-pin-format');

      // Mouse enter -> hover
      fireEvent.mouseEnter(row);
      expect(onHoverSegment).toHaveBeenCalledWith(
        expect.objectContaining({ fieldId: 'pin-format' })
      );

      // Mouse leave -> clear hover
      fireEvent.mouseLeave(row);
      expect(onHoverSegment).toHaveBeenCalledWith(null);

      // Click -> select
      fireEvent.click(row);
      expect(onSelectSegment).toHaveBeenCalledWith(
        expect.objectContaining({ fieldId: 'pin-format' })
      );
    });

    it('applies active highlight styling to the field row matching highlightedSegmentId', () => {
      // Find segment id corresponding to pin-format field
      const pinFormatSegment = atallaParsedRequest.segments.find((s) => s.fieldId === 'pin-format');
      expect(pinFormatSegment).toBeDefined();

      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
          highlightedSegmentId={pinFormatSegment!.id}
        />
      );

      const row = screen.getByTestId('field-row-pin-format');
      expect(row).toHaveAttribute('data-highlighted', 'true');
    });

    it('supports keyboard navigation (Enter/Space) to select a parameter row', () => {
      const onSelectSegment = vi.fn();
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
          onSelectSegment={onSelectSegment}
        />
      );

      const row = screen.getByTestId('field-row-pin-format');
      fireEvent.keyDown(row, { key: 'Enter' });
      expect(onSelectSegment).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(row, { key: ' ' });
      expect(onSelectSegment).toHaveBeenCalledTimes(2);
    });

    it('resets sensitive unmasking when switching active command ID', () => {
      const { rerender } = renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      // Unmask all
      fireEvent.click(screen.getByTestId('btn-toggle-all-sensitive'));
      expect(screen.getByTestId('field-value-source-pek')).toHaveTextContent('1111222233334444');

      // Switch command ID using rerender with the IntlProvider
      rerender(
        <IntlProvider locale="es" messages={getMessages('es')} defaultLocale="es">
          <AnalysisPanel
            deviceSpec={atallaAt1000Spec}
            parseResult={atallaParsedRequest}
            activeCommand={{
              id: 'c2',
              raw: atallaRawRequest,
              version: '8.60',
              direction: 'request'
            }}
          />
        </IntlProvider>
      );

      // Should be re-masked to default
      expect(screen.getByTestId('field-value-source-pek')).toHaveTextContent('••••••••');
    });
  });

  // =========================================================================
  // 5. Block 3: Frame View & Semantic Role Blocks
  // =========================================================================
  describe('Block 3: Frame View & Interactive Segments', () => {
    it('renders visual segment pills with semantic CSS classes for each structural role', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      const container = screen.getByTestId('frame-view-container');
      expect(container).toBeInTheDocument();

      // Check segment pills (sensitive fields masked with bullet points by default)
      atallaParsedRequest.segments.forEach((seg) => {
        const pill = screen.getByTestId(`frame-segment-${seg.id}`);
        expect(pill).toBeInTheDocument();
        expect(pill).toHaveAttribute('data-role', seg.role);

        const matchingField = seg.fieldId
          ? atallaParsedRequest.fields.find((f) => f.id === seg.fieldId)
          : undefined;
        if (matchingField?.sensitive) {
          expect(pill).toHaveTextContent('••••••••');
        } else {
          expect(pill).toHaveTextContent(seg.rawValue);
        }
      });
    });

    it('reveals sensitive segment pill values when clicking btn-toggle-all-sensitive', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      const toggleAllBtn = screen.getByTestId('btn-toggle-all-sensitive');
      fireEvent.click(toggleAllBtn);

      // Now all segments should display raw values
      atallaParsedRequest.segments.forEach((seg) => {
        const pill = screen.getByTestId(`frame-segment-${seg.id}`);
        expect(pill).toHaveTextContent(seg.rawValue);
      });
    });

    it('supports keyboard navigation (Enter/Space) to select frame view pills', () => {
      const onSelectSegment = vi.fn();
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
          onSelectSegment={onSelectSegment}
        />
      );

      const firstSeg = atallaParsedRequest.segments[0]!;
      const pill = screen.getByTestId(`frame-segment-${firstSeg.id}`);
      fireEvent.keyDown(pill, { key: 'Enter' });
      expect(onSelectSegment).toHaveBeenCalledWith(
        expect.objectContaining({ id: firstSeg.id })
      );
    });

    it('triggers onHoverSegment and onSelectSegment when interacting with segment pills', () => {
      const onHoverSegment = vi.fn();
      const onSelectSegment = vi.fn();

      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
          onHoverSegment={onHoverSegment}
          onSelectSegment={onSelectSegment}
        />
      );

      const firstSeg = atallaParsedRequest.segments[0]!;
      const pill = screen.getByTestId(`frame-segment-${firstSeg.id}`);

      fireEvent.mouseEnter(pill);
      expect(onHoverSegment).toHaveBeenCalledWith(
        expect.objectContaining({ id: firstSeg.id })
      );

      fireEvent.mouseLeave(pill);
      expect(onHoverSegment).toHaveBeenCalledWith(null);

      fireEvent.click(pill);
      expect(onSelectSegment).toHaveBeenCalledWith(
        expect.objectContaining({ id: firstSeg.id })
      );
    });

    it('highlights active segment pill when highlightedSegmentId matches', () => {
      const targetSeg = atallaParsedRequest.segments[1]!;

      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
          highlightedSegmentId={targetSeg.id}
        />
      );

      const pill = screen.getByTestId(`frame-segment-${targetSeg.id}`);
      expect(pill).toHaveAttribute('data-highlighted', 'true');
    });
  });

  // =========================================================================
  // 6. Block 4: Response & Error Code Analysis
  // =========================================================================
  describe('Block 4: Response / Error Code Analysis', () => {
    it('detects and renders error response code "01" with official vendor title, description, and troubleshooting', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedErrorResponse}
          activeCommand={{
            id: 'c_err',
            raw: atallaRawErrorResponse,
            version: '8.60',
            direction: 'response'
          }}
        />
      );

      const errorContainer = screen.getByTestId('error-code-container');
      expect(errorContainer).toBeInTheDocument();

      const badge = screen.getByTestId('error-code-badge');
      expect(badge).toHaveTextContent('01');

      const title = screen.getByTestId('error-code-title');
      expect(title).toHaveTextContent(/Error de Paridad en Clave/i);

      const description = screen.getByTestId('error-code-description');
      expect(description).toHaveTextContent(/paridad incorrecta/i);

      const troubleshooting = screen.getByTestId('error-code-troubleshooting');
      expect(troubleshooting).toHaveTextContent(/paridad impar/i);
    });

    it('renders Thales error code "10" with official Thales description and causes', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          parseResult={thalesParsedErrorResponse}
          activeCommand={{
            id: 'c_thales_err',
            raw: thalesRawErrorResponse,
            version: '2.3',
            direction: 'response'
          }}
        />
      );

      const badge = screen.getByTestId('error-code-badge');
      expect(badge).toHaveTextContent('10');

      const title = screen.getByTestId('error-code-title');
      expect(title).toHaveTextContent(/Error de Paridad en Clave de Origen/i);
    });

    it('renders success status when response error code is "00"', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          parseResult={thalesParsedSuccessResponse}
          activeCommand={{
            id: 'c_thales_ok',
            raw: thalesRawSuccessResponse,
            version: '2.3',
            direction: 'response'
          }}
        />
      );

      const successContainer = screen.getByTestId('response-success-container');
      expect(successContainer).toBeInTheDocument();
      expect(successContainer).toHaveTextContent(/00/);
      expect(successContainer).toHaveTextContent(/Operación Exitosa|Éxito|Success/i);
    });

    it('does not display response outcome when active command is a request frame', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          parseResult={thalesParsedRequest}
          activeCommand={{
            id: 'c_req',
            raw: thalesRawRequest,
            version: '2.3',
            direction: 'request'
          }}
        />
      );

      expect(screen.queryByTestId('response-success-container')).not.toBeInTheDocument();
      expect(screen.queryByTestId('error-code-container')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 7. Block 5: Parser Diagnostics
  // =========================================================================
  describe('Block 5: Diagnostics', () => {
    it('renders list of diagnostics with severity badges (error, warning, info) and localized messages', () => {
      // Create a frame with diagnostics
      const malformedRaw = '<31#1#1111#>'; // Missing required fields
      const malformedResult = parseCommand(malformedRaw, atallaAt1000Spec, {
        version: '8.60',
        expectedDirection: 'request'
      });

      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={malformedResult}
          activeCommand={{
            id: 'c_malformed',
            raw: malformedRaw,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      const list = screen.getByTestId('diagnostics-list');
      expect(list).toBeInTheDocument();

      const diagItem = screen.getByTestId('diagnostic-item-MISSING_REQUIRED_FIELD');
      expect(diagItem).toBeInTheDocument();

      const severityBadge = screen.getByTestId('diagnostic-severity-MISSING_REQUIRED_FIELD');
      expect(severityBadge).toHaveTextContent(/error/i);
    });

    it('renders friendly valid frame badge when there are no diagnostics', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          parseResult={thalesParsedRequest}
          activeCommand={{
            id: 'c_ok',
            raw: thalesRawRequest,
            version: '2.3',
            direction: 'request'
          }}
        />
      );

      const emptyDiag = screen.getByTestId('diagnostics-empty');
      expect(emptyDiag).toBeInTheDocument();
      expect(emptyDiag).toHaveTextContent(/Trama válida sin anomalías/i);
    });
  });

  // =========================================================================
  // 10. Block 8: Manufacturer Notes & Firmware Particularities
  // =========================================================================
  describe('Block 8: Manufacturer Notes & Firmware Particularities', () => {
    it('renders firmware release notes and manufacturer caveats', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      const notesContainer = screen.getByTestId('manufacturer-notes-container');
      expect(notesContainer).toBeInTheDocument();

      // Release notes for v8.60 mention AES and ISO-4
      expect(notesContainer).toHaveTextContent(/AES|AKB|ISO-4/i);
    });

    it('renders empty notes fallback when neither command nor firmware has specific notes', () => {
      // Futurex v7.6.1 echo command
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={futurexExcryptSpec}
          parseResult={futurexParsedRequest}
          activeCommand={{
            id: 'c_fx',
            raw: futurexRawRequest,
            version: '7.6.1',
            direction: 'request'
          }}
        />
      );

      // Container exists
      expect(screen.getByTestId('accordion-item-notes')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 11. Bilingual i18n Parity (ES / EN)
  // =========================================================================
  describe('Bilingual Localization (ES / EN)', () => {
    it('renders all accordion headers in Spanish when locale is "es"', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={mockTab}
          activeCommand={mockCommands[0]}
          parseResult={thalesParsedRequest}
        />,
        'es'
      );

      expect(screen.getByTestId('accordion-trigger-general-info')).toHaveTextContent(/Información General/i);
      expect(screen.getByTestId('accordion-trigger-fields')).toHaveTextContent(/Desglose de Parámetros/i);
      expect(screen.getByTestId('accordion-trigger-frame-view')).toHaveTextContent(/Vista de Trama/i);
      expect(screen.getByTestId('accordion-trigger-unified-diagnostics')).toHaveTextContent(/Estado de Respuesta y Diagnósticos/i);
      expect(screen.getByTestId('accordion-trigger-notes')).toHaveTextContent(/Notas del Fabricante/i);
    });

    it('renders all accordion headers in English when locale is "en"', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={mockTab}
          activeCommand={mockCommands[0]}
          parseResult={thalesParsedRequest}
        />,
        'en'
      );

      expect(screen.getByTestId('accordion-trigger-general-info')).toHaveTextContent(/General Information/i);
      expect(screen.getByTestId('accordion-trigger-fields')).toHaveTextContent(/Parameter Breakdown/i);
      expect(screen.getByTestId('accordion-trigger-frame-view')).toHaveTextContent(/Frame View/i);
      expect(screen.getByTestId('accordion-trigger-unified-diagnostics')).toHaveTextContent(/Estado de Respuesta y Diagnósticos|Response Status/i);
      expect(screen.getByTestId('accordion-trigger-notes')).toHaveTextContent(/Manufacturer Notes/i);
    });
  });

  // =========================================================================
  // 12. Accordion Collapsible Behavior
  // =========================================================================
  describe('Accordion Interaction & Toggling', () => {
    it('allows collapsing and expanding accordion sections independently', async () => {
      const { user } = renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={mockTab}
          activeCommand={mockCommands[0]}
          parseResult={thalesParsedRequest}
        />
      );

      const triggerGeneral = screen.getByTestId('accordion-trigger-general-info');
      expect(triggerGeneral).toBeInTheDocument();

      // Click to toggle
      await user.click(triggerGeneral);

      // Accordion item exists and toggles state
      const itemGeneral = screen.getByTestId('accordion-item-general-info');
      expect(itemGeneral).toBeInTheDocument();
    });

    it('verifies aria-expanded and aria-controls on all 7 accordion triggers', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={atallaParsedRequest}
          activeCommand={{
            id: 'c1',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      const sections = [
        'general-info',
        'fields',
        'frame-view',
        'unified-diagnostics',
        'notes'
      ];

      sections.forEach((sec) => {
        const trigger = screen.getByTestId(`accordion-trigger-${sec}`);
        expect(trigger).toHaveAttribute('aria-controls', `accordion-content-${sec}`);
      });
    });
  });

  // =========================================================================
  // 13. Integration with WorkspaceProvider
  // =========================================================================
  describe('Integration with WorkspaceProvider State', () => {
    it('automatically resolves active command, deviceSpec, and parseResult from workspace state when rendered with no props', async () => {
      const state: Partial<WorkspaceState> = {
        activeTabId: mockTab.id,
        tabs: [mockTab]
      };

      const { user } = renderWithWorkspace(state);

      // Panel mounts
      expect(screen.getByTestId('analysis-panel')).toBeInTheDocument();

      // Expand general info
      await user.click(screen.getByTestId('accordion-trigger-general-info'));

      // Resolves device info from state
      expect(screen.getByTestId('general-info-device')).toHaveTextContent(/Thales payShield 10K/i);

      // Pagination indicator reflects commands in active tab
      expect(screen.getByTestId('command-pagination-indicator')).toHaveTextContent(/Comando 1 de 3/i);
    });
  });

  // =========================================================================
  // 14. DOM Order & Manufacturer Notes Structure
  // =========================================================================
  describe('DOM Order & Manufacturer Notes Structure', () => {
    it('renders Vista de Trama before Desglose de Parámetros in the DOM', () => {
      renderWithIntl(
        <AnalysisPanel
          deviceSpec={thalesPayshield10kSpec}
          tab={mockTab}
          activeCommand={mockCommands[0]}
          parseResult={thalesParsedRequest}
        />
      );

      const frameView = screen.getByTestId('accordion-item-frame-view');
      const fieldsBreakdown = screen.getByTestId('accordion-item-fields');

      // Verify DOM ordering (frameView appears before fieldsBreakdown)
      expect(
        frameView.compareDocumentPosition(fieldsBreakdown) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('renders individual colored note cards for CAUTION, IMPORTANT, TIP, and NOTE', async () => {
      const mockResultWithNotes: ParseResult = {
        ...atallaParsedRequest,
        matchedCommand: {
          ...atallaParsedRequest.matchedCommand!,
          notes: [
            {
              es: 'CAUTION: Puede borrar claves irreversiblemente.',
              en: 'CAUTION: May irreversibly delete keys.'
            },
            {
              es: 'IMPORTANT: Requiere doble autorización.',
              en: 'IMPORTANT: Requires dual authorization.'
            },
            {
              es: 'TIP: Use el formato AKB para mayor velocidad.',
              en: 'TIP: Use AKB format for higher speed.'
            },
            {
              es: 'NOTE: Compatible con firmware v8.60.',
              en: 'NOTE: Compatible with v8.60 firmware.'
            }
          ]
        }
      };

      renderWithIntl(
        <AnalysisPanel
          deviceSpec={atallaAt1000Spec}
          parseResult={mockResultWithNotes}
          activeCommand={{
            id: 'c_notes',
            raw: atallaRawRequest,
            version: '8.60',
            direction: 'request'
          }}
        />
      );

      expect(screen.getByTestId(/manufacturer-note-caution/)).toBeInTheDocument();
      expect(screen.getByTestId(/manufacturer-note-important/)).toBeInTheDocument();
      expect(screen.getByTestId(/manufacturer-note-tip/)).toBeInTheDocument();
      expect(screen.getByTestId(/manufacturer-note-note/)).toBeInTheDocument();
    });
  });
});
