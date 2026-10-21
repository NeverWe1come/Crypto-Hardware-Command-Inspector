/**
 * @packageDocumentation
 * Detailed command information modal dialog (`@chci/explorer`).
 */

import React from 'react';
import type { CommandSpec, DeviceSpec } from '@chci/parser-core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { BookOpen, Layers, ShieldCheck, Tag } from 'lucide-react';

export interface CommandInfoModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly commandSpec?: CommandSpec | null;
  readonly deviceSpec?: DeviceSpec | null;
  readonly locale: 'es' | 'en';
}

/**
 * Modal displaying complete architectural details, parameter breakdown, and citations
 * for the selected cryptographic command.
 */
export function CommandInfoModal({
  isOpen,
  onClose,
  commandSpec,
  deviceSpec,
  locale
}: CommandInfoModalProps) {
  if (!commandSpec) return null;

  const resolve = (ls?: { es: string; en: string } | null) => {
    if (!ls) return '';
    return ls[locale] ?? ls.es ?? ls.en ?? '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="command-info-modal"
        className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#1a2236] border-[#2e3b5b] text-[#feffff]"
      >
        <DialogHeader className="space-y-1.5 border-b border-[#2e3b5b] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#ff7800] text-[#131927]">
              {commandSpec.code}
            </span>
            <DialogTitle className="text-sm font-semibold text-[#feffff]">
              {resolve(commandSpec.name)}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#94a3b8]">
            {deviceSpec?.name} • {resolve(commandSpec.category)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Summary / Description */}
          <div>
            <h4 className="font-semibold text-xs text-[#38bdf8] mb-1 flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              <span>Descripción Oficial</span>
            </h4>
            <p className="text-[#94a3b8] leading-relaxed whitespace-pre-line bg-[#131927] p-2.5 rounded border border-[#2e3b5b]">
              {resolve(commandSpec.description) || resolve(commandSpec.summary)}
            </p>
          </div>

          {/* Source Document Citation */}
          {commandSpec.source && (
            <div>
              <h4 className="font-semibold text-xs text-[#38bdf8] mb-1 flex items-center gap-1.5">
                <Tag className="size-3.5" />
                <span>Referencia Documental</span>
              </h4>
              <p className="text-[11px] font-mono text-[#94a3b8] bg-[#131927] p-2 rounded border border-[#2e3b5b]">
                {commandSpec.source}
              </p>
            </div>
          )}

          {/* Fields list */}
          {commandSpec.fields && commandSpec.fields.length > 0 && (
            <div>
              <h4 className="font-semibold text-xs text-[#38bdf8] mb-1.5 flex items-center gap-1.5">
                <Layers className="size-3.5" />
                <span>Estructura de Parámetros ({commandSpec.fields.length})</span>
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {commandSpec.fields.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className="p-2 rounded bg-[#131927] border border-[#2e3b5b] text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#feffff]">
                        {idx}. {resolve(f.name)}
                      </span>
                      <div className="flex items-center gap-1">
                        {f.required && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#018934]/20 text-[#0da845] border border-[#018934]/40">
                            Requerido
                          </span>
                        )}
                        {f.sensitive && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#ff7800]/20 text-[#ff7800] border border-[#ff7800]/40 flex items-center gap-1">
                            <ShieldCheck className="size-2.5" /> Sensible
                          </span>
                        )}
                      </div>
                    </div>
                    {f.description && (
                      <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                        {resolve(f.description)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes / Notices */}
          {commandSpec.notes && commandSpec.notes.length > 0 && (
            <div>
              <h4 className="font-semibold text-xs text-[#ff7800] mb-1.5">
                Avisos y Restricciones del Manual
              </h4>
              <div className="space-y-1.5">
                {commandSpec.notes.map((n, idx) => {
                  const text = resolve(n);
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded bg-[#131927] border-l-4 border-l-[#ff7800] border border-[#2e3b5b] text-[11px] text-[#94a3b8] leading-relaxed"
                    >
                      {text}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
