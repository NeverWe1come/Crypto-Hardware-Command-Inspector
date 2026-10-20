import { PARSER_CORE_VERSION } from '@chci/parser-core';
import { DEVICE_SPECS_VERSION } from '@chci/device-specs';

/**
 * Root application component for Crypto Hardware Command Inspector (`chci`).
 */
export function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Crypto Hardware Command Inspector
      </h1>
      <p className="text-sm text-slate-400 mt-2">
        Parser Core v{PARSER_CORE_VERSION} · Device Specs v{DEVICE_SPECS_VERSION}
      </p>
    </main>
  );
}
