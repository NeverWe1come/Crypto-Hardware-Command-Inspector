/**
 * @packageDocumentation
 * Unit test suite for CommandInfoModal component (`@chci/explorer`).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { CommandInfoModal } from '../CommandInfoModal';
import type { CommandSpec, DeviceSpec } from '@chci/parser-core';
import esMessages from '../../i18n/locales/es.json';

const mockDevice: DeviceSpec = {
  id: 'utimaco-atalla-at1000',
  name: 'Utimaco Atalla AT1000',
  vendor: 'Utimaco',
  category: 'HSM_FINANCIAL',
  status: 'supported',
  summary: { es: 'Resumen', en: 'Summary' },
  defaultVersion: '8.60',
  framing: {
    type: 'delimited-positional',
    startDelimiter: '<',
    endDelimiter: '>',
    fieldDelimiter: '#'
  },
  versions: {
    '8.60': {
      version: '8.60',
      label: { es: 'v8.60', en: 'v8.60' },
      commands: []
    }
  }
};

const mockCommand: CommandSpec = {
  id: 'atalla-10-req',
  code: '10',
  direction: 'request',
  name: { es: 'Generar Clave de Trabajo', en: 'Generate Working Key' },
  summary: { es: 'Genera claves 3DES bajo MFK o KEK', en: 'Generates 3DES keys under MFK or KEK' },
  description: {
    es: 'Genera criptogramas de claves para PIN, datos o MAC.',
    en: 'Generates working key cryptograms for PIN, data, or MAC.'
  },
  category: { es: 'Gestión de Claves', en: 'Key Management' },
  fields: [
    {
      id: 'key-usage',
      name: { es: 'Uso de Clave', en: 'Key Usage' },
      description: { es: 'Tipo de clave a generar', en: 'Type of key to generate' },
      position: 0,
      length: { kind: 'fixed', length: 1 },
      encoding: 'decimal',
      required: true
    },
    {
      id: 'master-key',
      name: { es: 'Clave Maestra', en: 'Master Key' },
      description: { es: 'Clave maestra bajo la cual se cifra la clave', en: 'Master key under which key is encrypted' },
      position: 1,
      length: { kind: 'range', min: 4, max: 256 },
      encoding: 'ascii',
      required: true,
      sensitive: true
    }
  ],
  notes: [
    { es: '[CAUTION] Precaución crítica de seguridad', en: '[CAUTION] Critical security caution' },
    { es: '[IMPORTANT] Instrucción obligatoria', en: '[IMPORTANT] Mandatory instruction' },
    { es: '[TIP] Consejo de rendimiento', en: '[TIP] Performance tip' },
    { es: '[NOTE] Nota informativa adicional', en: '[NOTE] Additional informational note' }
  ],
  source: 'Atalla AT1000 HSM Command Reference Manual v8.60, Section 4.2'
};

function renderModal(props: Partial<React.ComponentProps<typeof CommandInfoModal>> = {}) {
  const onClose = vi.fn();
  const user = userEvent.setup();
  const utils = render(
    <IntlProvider locale="es" messages={esMessages}>
      <CommandInfoModal
        isOpen={true}
        onClose={onClose}
        commandSpec={mockCommand}
        deviceSpec={mockDevice}
        locale="es"
        {...props}
      />
    </IntlProvider>
  );
  return { ...utils, user, onClose };
}

describe('CommandInfoModal Component', () => {
  it('renders modal dialog with command code, title, and device name', () => {
    renderModal();

    expect(screen.getByTestId('command-info-modal')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Generar Clave de Trabajo')).toBeInTheDocument();
    expect(screen.getByText(/Utimaco Atalla AT1000/)).toBeInTheDocument();
  });

  it('renders parameters list with "Requerido" and "Sensible" badges', () => {
    renderModal();

    expect(screen.getByText(/0\. Uso de Clave/)).toBeInTheDocument();
    expect(screen.getByText(/1\. Clave Maestra/)).toBeInTheDocument();
    expect(screen.getAllByText('Requerido')).toHaveLength(2);
    expect(screen.getByText(/Sensible/)).toBeInTheDocument();
  });

  it('renders notes and official notices', () => {
    renderModal();

    expect(screen.getByText(/Precaución crítica de seguridad/)).toBeInTheDocument();
    expect(screen.getByText(/Instrucción obligatoria/)).toBeInTheDocument();
  });

  it('renders source document citation', () => {
    renderModal();

    expect(
      screen.getByText('Atalla AT1000 HSM Command Reference Manual v8.60, Section 4.2')
    ).toBeInTheDocument();
  });
});
