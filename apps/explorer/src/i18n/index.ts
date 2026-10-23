/**
 * @packageDocumentation
 * Internationalization (i18n) setup and catalog dictionary loaders (`@chci/explorer`).
 */

import esMessages from './locales/es.json';
import enMessages from './locales/en.json';
import glMessages from './locales/gl.json';
import type { AppLocale } from '../state/types';

/**
 * Message catalogs per supported locale.
 */
export const LOCALE_MESSAGES: Record<AppLocale, Record<string, string>> = {
  es: esMessages,
  en: enMessages,
  gl: glMessages
};

/**
 * Default fallback locale for the application.
 */
export const DEFAULT_LOCALE: AppLocale = 'es';

/**
 * Returns the message dictionary for the requested application locale.
 *
 * @param locale - Supported application locale ('es' | 'en').
 * @returns Key-value map of localized strings.
 */
export function getMessages(locale: AppLocale): Record<string, string> {
  return LOCALE_MESSAGES[locale] ?? LOCALE_MESSAGES[DEFAULT_LOCALE];
}
