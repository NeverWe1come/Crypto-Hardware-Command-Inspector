/**
 * @packageDocumentation
 * Root application component tree (`@chci/explorer`).
 */

import { WorkspaceProvider } from './state/workspace-context';
import { Shell } from './components/Shell';
import { Toaster } from 'sonner';

/**
 * Root application component for Crypto Hardware Command Inspector (`chci`).
 */
export function App() {
  return (
    <WorkspaceProvider>
      <Shell />
      <Toaster richColors closeButton position="top-right" theme="dark" />
    </WorkspaceProvider>
  );
}

