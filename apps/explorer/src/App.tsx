/**
 * @packageDocumentation
 * Root application component tree (`@chci/explorer`).
 */

import { useEffect } from 'react';
import { WorkspaceProvider } from './state/workspace-context';
import { Shell } from './components/Shell';
import { Toaster } from 'sonner';
import { stopAtallaSimulator } from './services/simulator-client';

/**
 * Root application component for Crypto Hardware Command Inspector (`chci`).
 */
export function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Best-effort cleanup on frontend page unload / window close
      void stopAtallaSimulator().catch(() => {});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <WorkspaceProvider>
      <Shell />
      <Toaster richColors closeButton position="top-right" theme="dark" />
    </WorkspaceProvider>
  );
}

