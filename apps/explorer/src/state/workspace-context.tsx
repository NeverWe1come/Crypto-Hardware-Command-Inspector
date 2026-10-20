/**
 * @packageDocumentation
 * React Context and Provider for global workspace state management (`@chci/explorer`).
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode
} from 'react';
import { IntlProvider } from 'react-intl';
import { initialWorkspaceState, workspaceReducer } from './workspace-reducer';
import type { WorkspaceAction, WorkspaceState } from './types';
import { getMessages } from '../i18n';
import { loadActiveSession, saveActiveSession } from '../storage/indexeddb';
import { WorkspaceStateSchema } from '../storage/session-schema';

interface WorkspaceContextValue {
  readonly state: WorkspaceState;
  readonly dispatch: React.Dispatch<WorkspaceAction>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export interface WorkspaceProviderProps {
  readonly children: ReactNode;
  readonly initialState?: Partial<WorkspaceState>;
  readonly enableAutosave?: boolean;
}

/**
 * Root provider injecting the workspace state reducer and react-intl translation messages.
 * Automatically saves and restores the active session from IndexedDB if enableAutosave is active.
 */
export function WorkspaceProvider({
  children,
  initialState,
  enableAutosave = initialState === undefined
}: WorkspaceProviderProps) {
  const mergedInitialState: WorkspaceState = {
    ...initialWorkspaceState,
    ...initialState
  };

  const [state, dispatch] = useReducer(workspaceReducer, mergedInitialState);
  const messages = getMessages(state.locale);

  // Guard against autosave race condition before initial load resolves
  const isRestoredRef = useRef(initialState !== undefined || !enableAutosave);

  // Restore active session on initial load if no custom initialState was provided
  useEffect(() => {
    if (!enableAutosave || initialState !== undefined) return;
    let mounted = true;

    void loadActiveSession()
      .then((saved) => {
        if (!mounted || !saved) return;
        const result = WorkspaceStateSchema.safeParse(saved);
        if (result.success && result.data.tabs.length > 0) {
          dispatch({ type: 'LOAD_WORKSPACE', payload: result.data });
        } else if (!result.success) {
          console.warn('[CHCI Storage] Active session schema mismatch:', result.error);
        }
      })
      .catch((err) => {
        console.warn('[CHCI Storage] Error restoring active session:', err);
      })
      .finally(() => {
        if (mounted) {
          isRestoredRef.current = true;
        }
      });

    return () => {
      mounted = false;
    };
  }, [enableAutosave, initialState]);

  // Debounced auto-save active session to IndexedDB
  useEffect(() => {
    if (!enableAutosave || !isRestoredRef.current) return;
    const timer = setTimeout(() => {
      void saveActiveSession(state).catch((err) => {
        console.warn('[CHCI Storage] Autosave failed:', err);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [state, enableAutosave]);

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
