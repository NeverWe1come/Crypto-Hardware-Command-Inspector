/**
 * @packageDocumentation
 * Error dialog presenting hardware communication and execution failures (`@chci/explorer`).
 */

import React from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { ServerOff } from 'lucide-react';

export interface ExecutionErrorModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly errorTitle?: string;
  readonly errorMessage: string;
}

export function ExecutionErrorModal({
  open,
  onOpenChange,
  errorTitle = 'Fallo de Conexión con el Hardware',
  errorMessage
}: ExecutionErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="execution-error-modal"
        className="max-w-md p-6 gap-4 border-destructive/40"
        showCloseButton
      >
        <DialogHeader className="mb-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-destructive/15 text-destructive flex items-center justify-center border border-destructive/40 shrink-0">
              <ServerOff className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                {errorTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                No se pudo completar el envío o la recepción del comando contra el dispositivo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="p-3.5 rounded-md bg-[#131927] border border-destructive/30 text-xs font-mono text-[#feffff] whitespace-pre-wrap leading-relaxed">
            {errorMessage}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onOpenChange(false)}
              data-testid="execution-error-dismiss"
              className="h-8 text-xs bg-[#283350] hover:bg-[#324066] text-[#feffff]"
            >
              Cerrar
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
