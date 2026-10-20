import { WorkspaceProvider } from './state/workspace-context';
import { Shell } from './components/Shell';

/**
 * Root application component for Crypto Hardware Command Inspector (`chci`).
 */
export function App() {
  return (
    <WorkspaceProvider>
      <Shell />
    </WorkspaceProvider>
  );
}

