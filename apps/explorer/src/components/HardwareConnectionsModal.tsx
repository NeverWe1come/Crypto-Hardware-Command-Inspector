/**
 * @packageDocumentation
 * Modal dialog for managing direct hardware device connections (TCP, TLS, mTLS) (`@chci/explorer`).
 */

import React, { useState } from 'react';
import { getDeviceSpec } from '@chci/device-specs';
import { useWorkspace } from '../state/workspace-context';
import type { HardwareConnectionConfig, HardwareConnectionType } from '../state/types';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Server,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export interface HardwareConnectionsModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly deviceId: string | null;
}

export function HardwareConnectionsModal({
  open,
  onOpenChange,
  deviceId
}: HardwareConnectionsModalProps) {
  const { state, dispatch } = useWorkspace();

  const deviceSpec = deviceId ? getDeviceSpec(deviceId) : undefined;
  const connections = deviceId
    ? state.hardwareConnections.filter((c) => c.deviceId === deviceId)
    : [];

  // Form state for adding/editing a connection
  const [isAdding, setIsAdding] = useState(false);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('7000');
  const [connectionType, setConnectionType] = useState<HardwareConnectionType>('TCP');
  const [caCertPem, setCaCertPem] = useState('');
  const [clientCertPem, setClientCertPem] = useState('');
  const [clientKeyPem, setClientKeyPem] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setHost('');
    setPort('7000');
    setConnectionType('TCP');
    setCaCertPem('');
    setClientCertPem('');
    setClientKeyPem('');
    setFormError(null);
    setIsAdding(false);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedHost = host.trim();
    if (!trimmedHost) {
      setFormError('La dirección IP o Host es obligatoria.');
      return;
    }

    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setFormError('El puerto debe ser un número entero entre 1 y 65535.');
      return;
    }

    if (connectionType === 'mTLS') {
      if (!clientCertPem.trim() || !clientKeyPem.trim()) {
        setFormError('Para mTLS es obligatorio proporcionar el certificado y la clave privada de cliente en formato PEM.');
        return;
      }
    }

    if (!deviceId) return;

    const newConnection: HardwareConnectionConfig = {
      id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      deviceId,
      host: trimmedHost,
      port: portNum,
      connectionType,
      caCertPem: caCertPem.trim() || undefined,
      clientCertPem: clientCertPem.trim() || undefined,
      clientKeyPem: clientKeyPem.trim() || undefined
    };

    dispatch({
      type: 'SAVE_HARDWARE_CONNECTION',
      payload: { connection: newConnection }
    });

    resetForm();
  };

  const handleDeleteConnection = (connectionId: string) => {
    dispatch({
      type: 'DELETE_HARDWARE_CONNECTION',
      payload: { connectionId }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="hardware-connections-modal"
        className="max-w-2xl max-h-[85vh] flex flex-col p-6 gap-4"
        showCloseButton
      >
        <DialogHeader className="mb-0">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-[#283350] text-[#ff7800] flex items-center justify-center border border-[#ff7800]/30 shadow-xs">
              <Server className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-[#feffff]">
                Conexiones Hardware — {deviceSpec?.name ?? deviceId}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configura conexiones directas (IP, Puerto, TCP, TLS o mTLS) para ejecutar comandos en vivo contra este hardware.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 overflow-y-auto pr-1">
          {/* Header Action: Add Connection Button */}
          {!isAdding && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Conexiones Configuradas ({connections.length})
              </span>
              <Button
                type="button"
                size="sm"
                data-testid="add-connection-button"
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="h-8 text-xs gap-1.5 bg-[#ff7800] hover:bg-[#e66c00] text-[#131927] font-semibold"
              >
                <Plus className="size-3.5" />
                <span>Nueva Conexión</span>
              </Button>
            </div>
          )}

          {/* Form to Add New Connection */}
          {isAdding && (
            <form
              onSubmit={handleSaveConnection}
              data-testid="connection-form"
              className="p-4 rounded-md bg-[#131927] border border-[#2e3b5b] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#2e3b5b] pb-2">
                <span className="text-xs font-bold text-[#feffff]">Nueva Conexión Directa</span>
                <span className="text-[11px] font-mono text-[#ff7800]">
                  {connectionType}
                </span>
              </div>

              {formError && (
                <div
                  data-testid="connection-form-error"
                  className="p-2.5 rounded bg-destructive/15 border border-destructive/40 text-xs text-destructive flex items-center gap-2"
                >
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Dirección IP / Host:
                  </label>
                  <Input
                    type="text"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="ej. 192.168.1.100 o hsm.internal"
                    data-testid="connection-host-input"
                    className="h-8 text-xs bg-[#1a2236] border-[#2e3b5b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Puerto:
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={65535}
                    required
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="7000"
                    data-testid="connection-port-input"
                    className="h-8 text-xs bg-[#1a2236] border-[#2e3b5b] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Tipo de Protocolo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['TCP', 'TLS', 'mTLS'] as const).map((proto) => (
                    <button
                      type="button"
                      key={proto}
                      onClick={() => setConnectionType(proto)}
                      data-testid={`connection-type-${proto}`}
                      className={`py-1.5 px-3 rounded text-xs font-semibold uppercase tracking-wider border transition-colors ${
                        connectionType === proto
                          ? 'bg-[#283350] border-[#ff7800] text-[#feffff] shadow-xs'
                          : 'bg-[#1a2236] border-[#2e3b5b] text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {proto}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Certificate Inputs */}
              {(connectionType === 'TLS' || connectionType === 'mTLS') && (
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Certificado CA del Servidor / HSM (PEM):
                  </label>
                  <textarea
                    rows={3}
                    value={caCertPem}
                    onChange={(e) => setCaCertPem(e.target.value)}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    data-testid="connection-ca-cert-input"
                    className="w-full text-xs font-mono p-2 rounded bg-[#1a2236] border border-[#2e3b5b] text-[#feffff] resize-none focus:outline-hidden focus:border-[#ff7800]"
                  />
                </div>
              )}

              {connectionType === 'mTLS' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Certificado de Cliente (PEM):
                    </label>
                    <textarea
                      rows={3}
                      value={clientCertPem}
                      onChange={(e) => setClientCertPem(e.target.value)}
                      placeholder="-----BEGIN CERTIFICATE-----..."
                      data-testid="connection-client-cert-input"
                      className="w-full text-xs font-mono p-2 rounded bg-[#1a2236] border border-[#2e3b5b] text-[#feffff] resize-none focus:outline-hidden focus:border-[#ff7800]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Clave Privada de Cliente (PEM):
                    </label>
                    <textarea
                      rows={3}
                      value={clientKeyPem}
                      onChange={(e) => setClientKeyPem(e.target.value)}
                      placeholder="-----BEGIN PRIVATE KEY-----..."
                      data-testid="connection-client-key-input"
                      className="w-full text-xs font-mono p-2 rounded bg-[#1a2236] border border-[#2e3b5b] text-[#feffff] resize-none focus:outline-hidden focus:border-[#ff7800]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e3b5b]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="h-8 text-xs text-muted-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  data-testid="connection-submit-button"
                  className="h-8 text-xs bg-[#018934] hover:bg-[#0da845] text-[#feffff] font-semibold"
                >
                  Guardar Conexión
                </Button>
              </div>
            </form>
          )}

          {/* Connection List */}
          <div className="space-y-2" data-testid="connections-list">
            {connections.length === 0 && !isAdding && (
              <div
                data-testid="connections-empty"
                className="border border-dashed border-[#2e3b5b] rounded-lg p-8 text-center text-muted-foreground"
              >
                <Server className="size-8 mx-auto mb-2 opacity-40 text-[#ff7800]" />
                <h3 className="text-sm font-medium text-foreground">
                  No hay conexiones configuradas
                </h3>
                <p className="text-xs mt-1">
                  Pulsa "Nueva Conexión" para registrar una IP y puerto para lanzar comandos a este dispositivo.
                </p>
              </div>
            )}

            {connections.map((conn) => (
              <div
                key={conn.id}
                data-testid={`connection-item-${conn.id}`}
                className="flex items-center justify-between p-3 rounded-md bg-[#161f33] border border-[#2e3b5b] text-xs select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded bg-[#202940] border border-[#2e3b5b] text-[#38bdf8] flex items-center justify-center font-bold text-[10px]">
                    {conn.connectionType}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#feffff] text-xs">
                        {conn.host}:{conn.port}
                      </span>
                      {conn.connectionType === 'mTLS' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <ShieldCheck className="size-2.5" />
                          mTLS
                        </span>
                      )}
                      {conn.connectionType === 'TLS' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40">
                          TLS
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {conn.connectionType === 'TCP' ? 'Conexión Socket TCP directa' : 'Conexión cifrada TLS con certificados PEM'}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteConnection(conn.id)}
                  data-testid={`delete-connection-${conn.id}`}
                  className="size-7 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                  aria-label="Eliminar conexión"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
