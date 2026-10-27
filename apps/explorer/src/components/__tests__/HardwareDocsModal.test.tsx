/**
 * @packageDocumentation
 * Unit test suite for HardwareDocsModal component (`@chci/explorer`).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { HardwareDocsModal } from '../HardwareDocsModal';
import type { DeviceSpec } from '@chci/parser-core';
import esMessages from '../../i18n/locales/es.json';

const mockDeviceWithDocs: DeviceSpec = {
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
  documentationSections: [
    {
      id: 'overview',
      title: { es: 'Visión General', en: 'Overview' },
      category: 'overview',
      markdown: {
        es: '# Visión General\n\nManual de referencia oficial de Atalla AT1000.',
        en: '# Overview\n\nOfficial Atalla AT1000 Reference Manual.'
      }
    },
    {
      id: 'ch01-intro',
      title: { es: 'Capítulo 1 - Introducción', en: 'Chapter 1 - Introduction' },
      category: 'chapter',
      markdown: {
        es: '# Capítulo 1\n\n> **NOTE:** Arquitectura del sistema.',
        en: '# Chapter 1\n\n> **NOTE:** System architecture.'
      }
    }
  ],
  versions: {
    '8.60': {
      version: '8.60',
      label: { es: 'v8.60', en: 'v8.60' },
      commands: [],
      errorCodes: {}
    }
  }
};

describe('HardwareDocsModal Component', () => {
  it('renders modal with device title, chapters list and markdown content', () => {
    const onClose = vi.fn();
    render(
      <IntlProvider locale="es" messages={esMessages}>
        <HardwareDocsModal
          isOpen={true}
          onClose={onClose}
          deviceSpec={mockDeviceWithDocs}
          locale="es"
        />
      </IntlProvider>
    );

    expect(screen.getByTestId('hardware-docs-modal')).toBeInTheDocument();
    expect(screen.getByText(/Documentación Hardware: Utimaco Atalla AT1000/)).toBeInTheDocument();
    expect(screen.getByTestId('hardware-doc-item-overview')).toBeInTheDocument();
    expect(screen.getByTestId('hardware-doc-item-ch01-intro')).toBeInTheDocument();
    expect(screen.getByText('Manual de referencia oficial de Atalla AT1000.')).toBeInTheDocument();
  });

  it('navigates between chapters on click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <IntlProvider locale="es" messages={esMessages}>
        <HardwareDocsModal
          isOpen={true}
          onClose={onClose}
          deviceSpec={mockDeviceWithDocs}
          locale="es"
        />
      </IntlProvider>
    );

    const ch1Btn = screen.getByTestId('hardware-doc-item-ch01-intro');
    await user.click(ch1Btn);

    expect(screen.getByText('Arquitectura del sistema.')).toBeInTheDocument();
  });

  it('filters chapters using search input', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <IntlProvider locale="es" messages={esMessages}>
        <HardwareDocsModal
          isOpen={true}
          onClose={onClose}
          deviceSpec={mockDeviceWithDocs}
          locale="es"
        />
      </IntlProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Buscar en el manual/);
    await user.type(searchInput, 'Introducción');

    expect(screen.getByTestId('hardware-doc-item-ch01-intro')).toBeInTheDocument();
    expect(screen.queryByTestId('hardware-doc-item-overview')).not.toBeInTheDocument();
  });
});
