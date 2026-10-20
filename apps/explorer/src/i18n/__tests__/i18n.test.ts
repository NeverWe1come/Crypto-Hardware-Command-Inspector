/**
 * @packageDocumentation
 * Internationalization (i18n) test suite verifying locale file integrity and 1:1 key parity (`@chci/explorer`).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, getMessages, LOCALE_MESSAGES } from '../index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.resolve(__dirname, '../locales');
const esFilePath = path.join(localesDir, 'es.json');
const enFilePath = path.join(localesDir, 'en.json');

describe('i18n Locale Dictionaries', () => {
  it('verifies that es.json and en.json exist on disk in apps/explorer/src/i18n/locales/', () => {
    expect(fs.existsSync(esFilePath), 'es.json must exist').toBe(true);
    expect(fs.existsSync(enFilePath), 'en.json must exist').toBe(true);
  });

  it('validates that es.json is valid JSON with non-empty string values', () => {
    const rawContent = fs.readFileSync(esFilePath, 'utf-8');
    const parsed = JSON.parse(rawContent) as Record<string, unknown>;

    expect(typeof parsed).toBe('object');
    expect(parsed).not.toBeNull();
    expect(Object.keys(parsed).length).toBeGreaterThan(0);

    for (const [key, value] of Object.entries(parsed)) {
      expect(
        typeof value === 'string',
        `Key "${key}" in es.json must be a string value`
      ).toBe(true);
      expect(
        (value as string).trim().length,
        `Key "${key}" in es.json cannot be an empty or whitespace-only string`
      ).toBeGreaterThan(0);
    }
  });

  it('validates that en.json is valid JSON with non-empty string values', () => {
    const rawContent = fs.readFileSync(enFilePath, 'utf-8');
    const parsed = JSON.parse(rawContent) as Record<string, unknown>;

    expect(typeof parsed).toBe('object');
    expect(parsed).not.toBeNull();
    expect(Object.keys(parsed).length).toBeGreaterThan(0);

    for (const [key, value] of Object.entries(parsed)) {
      expect(
        typeof value === 'string',
        `Key "${key}" in en.json must be a string value`
      ).toBe(true);
      expect(
        (value as string).trim().length,
        `Key "${key}" in en.json cannot be an empty or whitespace-only string`
      ).toBeGreaterThan(0);
    }
  });

  it('enforces strict 1:1 key parity between es.json and en.json (no missing keys)', () => {
    const es = JSON.parse(fs.readFileSync(esFilePath, 'utf-8')) as Record<string, string>;
    const en = JSON.parse(fs.readFileSync(enFilePath, 'utf-8')) as Record<string, string>;

    const esKeys = Object.keys(es).sort();
    const enKeys = Object.keys(en).sort();

    const missingInEn = esKeys.filter((k) => !Object.hasOwn(en, k));
    const missingInEs = enKeys.filter((k) => !Object.hasOwn(es, k));

    expect(
      missingInEn,
      `The following keys exist in es.json but are missing in en.json: ${missingInEn.join(', ')}`
    ).toEqual([]);

    expect(
      missingInEs,
      `The following keys exist in en.json but are missing in es.json: ${missingInEs.join(', ')}`
    ).toEqual([]);

    expect(esKeys.length).toBe(enKeys.length);
  });

  it('validates that ICU / FormatJS placeholder brackets are balanced in all message strings', () => {
    for (const [locale, messages] of Object.entries(LOCALE_MESSAGES)) {
      for (const [key, text] of Object.entries(messages)) {
        const openBraces = (text.match(/\{/g) || []).length;
        const closeBraces = (text.match(/\}/g) || []).length;
        expect(
          openBraces,
          `Mismatched ICU braces in ${locale}.json for key "${key}": "${text}"`
        ).toBe(closeBraces);
      }
    }
  });

  it('provides getMessages helper returning the requested or default dictionary', () => {
    expect(DEFAULT_LOCALE).toBe('es');
    const es = getMessages('es');
    expect(es['app.title']).toBe('Crypto Hardware Command Inspector');
    const en = getMessages('en');
    expect(en['app.title']).toBe('Crypto Hardware Command Inspector');
    expect(en['sidebar.title']).toBe('Cryptographic Catalog');
  });
});
