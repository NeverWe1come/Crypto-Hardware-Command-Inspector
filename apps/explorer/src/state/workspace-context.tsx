/**
 * @packageDocumentation
 * React Context and Provider for global workspace state management (`@chci/explorer`).
 */

import React, { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { initialWorkspaceState, workspaceReducer } from './workspace-reducer';
import type { WorkspaceAction, WorkspaceState } from './types';
import { getMessages } from '../i18n';

interface WorkspaceContextValue {
  readonly state: WorkspaceState;
  readonly dispatch: React.Dispatch<WorkspaceAction>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export interface WorkspaceProviderProps {
  readonly children: ReactNode;
  readonly initialState?: Partial<WorkspaceState>;
}

/**
 * Root provider injecting the workspace state reducer and react-intl translation messages.
 */
export function WorkspaceProvider({ children, initialState }: WorkspaceProviderProps) {
  const mergedInitialState: WorkspaceState = {
    ...initialWorkspaceState,
    ...initialState
  };

  const [state, dispatch] = useReducer(workspaceReducer, mergedInitialState);
  const messages = getMessages(state.locale);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <WorkspaceContext.Provider value={contextValue}>
      <IntlProvider
        locale={state.locale}
        messages={messages}
        defaultLocale="es"
      >
        {children}
      </IntlProvider>
    </WorkspaceContext.Provider>
  );
}

/**
 * Optional hook to access workspace state and dispatch actions.
 * Returns undefined if used outside a `<WorkspaceProvider />` instead of throwing.
 */
export function useOptionalWorkspace(): WorkspaceContextValue | undefined {
  return useContext(WorkspaceContext);
}

/**
 * Custom hook to access workspace state and dispatch actions.
 * Throws an error if used outside a `<WorkspaceProvider />`.
 */
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a <WorkspaceProvider />');
  }
  return context;
}
