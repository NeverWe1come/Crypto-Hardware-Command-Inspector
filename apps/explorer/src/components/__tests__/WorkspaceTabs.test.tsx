import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { WorkspaceTabs } from '../WorkspaceTabs';
import { WorkspaceContext } from '../../state/workspace-context';
import type { WorkspaceState, WorkspaceAction } from '../../state/types';

describe('WorkspaceTabs', () => {
  const mockState: WorkspaceState = {
    tabs: [
      {
        id: 'tab-atalla',
        deviceId: 'utimaco-atalla-at1000',
        version: '8.60',
        commands: [],
        activeCommandId: null,
      },
      {
        id: 'tab-thales',
        deviceId: 'thales-payshield-10k',
        version: '2.3',
        commands: [],
        activeCommandId: null,
      },
    ],
    activeTabId: 'tab-atalla',
    selectedCategory: 'ALL',
    theme: 'dark',
    catalogSearchQuery: '',
    hardwareConnections: [],
    locale: 'es',
  };

  const renderWithContext = (dispatch = vi.fn()) => {
    return {
      dispatch,
      ...render(
        <IntlProvider locale="es" messages={{}}>
          <WorkspaceContext.Provider value={{ state: mockState, dispatch: dispatch as React.Dispatch<WorkspaceAction> }}>
            <WorkspaceTabs />
          </WorkspaceContext.Provider>
        </IntlProvider>
      ),
    };
  };

  it('renders tabs bar with open tabs', () => {
    renderWithContext();
    expect(screen.getByTestId('workspace-tabs-bar')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-tab-utimaco-atalla-at1000')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-tab-thales-payshield-10k')).toBeInTheDocument();
  });

  it('dispatches SELECT_DEVICE_TAB on left click', () => {
    const { dispatch } = renderWithContext();
    const thalesTab = screen.getByTestId('workspace-tab-thales-payshield-10k');
    fireEvent.click(thalesTab);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SELECT_DEVICE_TAB',
      payload: { tabId: 'tab-thales' },
    });
  });

  it('dispatches CLOSE_DEVICE_TAB when middle-clicking (wheel click, button: 1) on tab', () => {
    const { dispatch } = renderWithContext();
    const thalesTab = screen.getByTestId('workspace-tab-thales-payshield-10k');

    fireEvent.mouseUp(thalesTab, { button: 1 });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'CLOSE_DEVICE_TAB',
      payload: { tabId: 'tab-thales' },
    });
  });

  it('does not dispatch CLOSE_DEVICE_TAB when mouseUp button is not 1 (e.g. right click or back button)', () => {
    const { dispatch } = renderWithContext();
    const thalesTab = screen.getByTestId('workspace-tab-thales-payshield-10k');

    fireEvent.mouseUp(thalesTab, { button: 2 });
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'CLOSE_DEVICE_TAB' }));
  });

  it('dispatches CLOSE_DEVICE_TAB when clicking the close X button', () => {
    const { dispatch } = renderWithContext();
    const closeBtn = screen.getByTestId('close-tab-utimaco-atalla-at1000');
    fireEvent.click(closeBtn);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'CLOSE_DEVICE_TAB',
      payload: { tabId: 'tab-atalla' },
    });
  });
});
