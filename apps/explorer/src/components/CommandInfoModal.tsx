/**
 * @packageDocumentation
 * Detailed command information modal dialog (`@chci/explorer`).
 * Renders complete official documentation in rich Markdown, including syntax frames,
 * field descriptions, AKB/Variant key management badges, and color-coded notices.
 */

import React, { useState } from 'react';
import type { CommandSpec, DeviceSpec } from '@chci/parser-core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { BookOpen, Layers, ShieldCheck, Tag, FileText } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Button } from './ui/button';

export interface CommandInfoModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly commandSpec?: CommandSpec | null;
  readonly deviceSpec?: DeviceSpec | null;
  readonly locale: 'es' | 'en' | 'gl';
}

/**
 * Modal displaying complete architectural details, full Markdown documentation,
 * parameter breakdown, and citations for the selected cryptographic command.
 */
export function CommandInfoModal({
  isOpen,
  onClose,
  commandSpec,
  deviceSpec,
  locale
}: CommandInfoModalProps) {
  const [activeView, setActiveView] = useState<'markdown' | 'fields'>('markdown');

  if (!commandSpec) return null;

  const resolve = (ls?: { es: string; en: string; gl?: string } | null) => {
    if (!ls) return '';
    return (ls as Record<string, string>)[locale] ?? ls.es ?? ls.en ?? '';
  };

  const rawDoc = resolve(commandSpec.markdownDoc);
  const hasMarkdownDoc = Boolean(rawDoc && rawDoc.trim().length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="command-info-modal"
        className="max-w-4xl w-[92vw] max-h-[88vh] flex flex-col bg-[#1a2236] border-[#2e3b5b] text-[#feffff] p-0 overflow-hidden"
      >
        <DialogHeader className="space-y-1.5 px-6 pt-5 pb-3 border-b border-[#2e3b5b] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#ff7800] text-[#131927]">
                {commandSpec.code}
              </span>
              <DialogTitle className="text-sm font-semibold text-[#feffff]">
                {resolve(commandSpec.name)}
              </DialogTitle>
            </div>
            {hasMarkdownDoc && (
              <div className="flex items-center gap-1 bg-[#131927] p-0.5 rounded border border-[#2e3b5b]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('markdown')}
                  className={`h-7 px-2.5 text-xs gap-1 rounded-xs ${
                    activeView === 'markdown'
                      ? 'bg-[#ff7800] text-[#131927] font-semibold'
                      : 'text-[#94a3b8] hover:text-[#feffff]'
                  }`}
                >
                  <FileText className="size-3.5" />
                  <span>Manual Oficial (.md)</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('fields')}
                  className={`h-7 px-2.5 text-xs gap-1 rounded-xs ${
                    activeView === 'fields'
                      ? 'bg-[#ff7800] text-[#131927] font-semibold'
                      : 'text-[#94a3b8] hover:text-[#feffff]'
                  }`}
                >
                  <Layers className="size-3.5" />
                  <span>Parámetros ({commandSpec.fields.length})</span>
                </Button>
              </div>
            )}
          </div>
          <DialogDescription className="text-xs text-[#94a3b8]">
            {deviceSpec?.name} • {resolve(commandSpec.category)}
            {commandSpec.source && ` • ${commandSpec.source}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
          {hasMarkdownDoc && activeView === 'markdown' ? (
            <div data-testid="command-markdown-view" className="space-y-4">
              <MarkdownRenderer markdown={rawDoc} />
            </div>
          ) : (
            <div data-testid="command-fields-view" className="space-y-4">
              {/* Summary / Description */}
              <div>
                <h4 className="font-semibold text-xs text-[#38bdf8] mb-1 flex items-center gap-1.5">
                  <BookOpen className="size-3.5" />
                  <span>Descripción Oficial</span>
                </h4>
                <p className="text-[#94a3b8] leading-relaxed whitespace-pre-line bg-[#131927] p-3 rounded border border-[#2e3b5b]">
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
                  <p className="text-[11px] font-mono text-[#94a3b8] bg-[#131927] p-2.5 rounded border border-[#2e3b5b]">
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
                  <div className="space-y-2">
                    {commandSpec.fields.map((f, idx) => (
                      <div
                        key={f.id || idx}
                        className="p-2.5 rounded bg-[#131927] border border-[#2e3b5b] text-xs flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#feffff]">
                            {idx}. {resolve(f.name)}
                          </span>
                          <div className="flex items-center gap-1.5">
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
                        {f.variants && f.variants.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {f.variants.map((v, vIdx) => {
                              const isAkb = v.mode === 'akb';
                              const isVariant = v.mode === 'variant';
                              return (
                                <div
                                  key={vIdx}
                                  className={`p-2 rounded text-[11px] border ${
                                    isAkb
                                      ? 'bg-[#FBD5CD]/10 border-[#f472b6]/30 text-[#f472b6]'
                                      : isVariant
                                      ? 'bg-[#B5B1D2]/10 border-purple-500/30 text-purple-300'
                                      : 'bg-[#1e293b]/60 border-[#2e3b5b] text-[#cbd5e1]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold">
                                      {isAkb ? 'AKB' : isVariant ? 'Variant' : 'Standard'}
                                    </span>
                                    <span className="font-mono text-[10px] opacity-80">
                                      Longitud: {v.lengthText ?? (v.length.kind === 'fixed' ? v.length.length : 'var')}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#94a3b8] leading-tight">
                                    {resolve(v.description)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
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
                  <div className="space-y-2">
                    {commandSpec.notes.map((n, idx) => {
                      const text = resolve(n);
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded bg-[#131927] border-l-4 border-l-[#ff7800] border border-[#2e3b5b] text-[11px] text-[#94a3b8] leading-relaxed"
                        >
                          {text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
