/**
 * @packageDocumentation
 * Test suite for schema validation, bilingual completeness, and version inheritance.
 *
 * Verifies that all modeled specifications conform to Zod schemas in `@chci/parser-core`,
 * enforces 100% Spanish/English parity across all text strings, and confirms version
 * inheritance hierarchies (`2.3` extends `1.9`, `8.60` extends `8.50`).
 */

import { describe, expect, it } from 'vitest';
import {
  parseCommand,
  resolveDeviceVersion,
  validateDeviceSpec,
  type LocalizedString
} from '@chci/parser-core';
import {
  atallaAt1000Spec,
  futurexExcryptSpec,
  getSupportedDevices,
  thalesPayshield10kSpec
} from '../index';

/**
 * Asserts that a localized string contract provides non-empty, trimmed strings
 * in both Spanish (`es`) and English (`en`).
 */
function assertBilingual(loc: LocalizedString, context: string): void {
  expect(loc, `Missing LocalizedString at ${context}`).toBeDefined();
  expect(typeof loc.es, `Expected 'es' string at ${context}`).toBe('string');
  expect(loc.es.trim().length, `'es' must not be empty at ${context}`).toBeGreaterThan(0);
  expect(typeof loc.en, `Expected 'en' string at ${context}`).toBe('string');
  expect(loc.en.trim().length, `'en' must not be empty at ${context}`).toBeGreaterThan(0);
}

describe('Device Specifications Formal Validation (`validateDeviceSpec`)', () => {
  it('validates that every supported device satisfies the root DeviceSpecSchema', () => {
    const supported = getSupportedDevices();
    expect(supported.length).toBeGreaterThanOrEqual(3);

    for (const spec of supported) {
      expect(() => validateDeviceSpec(spec), `Failed validation for ${spec.id}`).not.toThrow();
      const validated = validateDeviceSpec(spec);
      expect(validated.id).toBe(spec.id);
      expect(validated.status).toBe('supported');
      expect(validated.defaultVersion in validated.versions).toBe(true);
    }
  });

  describe('Vendor-Specific Framing Configurations', () => {
    it('validates Atalla AT1000 delimited-positional framing configuration', () => {
      expect(atallaAt1000Spec).toBeDefined();
      expect(atallaAt1000Spec.framing.type).toBe('delimited-positional');
      if (atallaAt1000Spec.framing.type === 'delimited-positional') {
        expect(atallaAt1000Spec.framing.startDelimiter).toBe('<');
        expect(atallaAt1000Spec.framing.endDelimiter).toBe('>');
        expect(atallaAt1000Spec.framing.fieldDelimiter).toBe('#');
        expect(atallaAt1000Spec.framing.requireTrailingDelimiter).toBe(true);
        expect(atallaAt1000Spec.framing.contextTagPrefix).toBe('^');
      }
    });

    it('validates Thales payShield 10K header-positional framing configuration', () => {
      expect(thalesPayshield10kSpec).toBeDefined();
      expect(thalesPayshield10kSpec.framing.type).toBe('header-positional');
      if (thalesPayshield10kSpec.framing.type === 'header-positional') {
        expect(thalesPayshield10kSpec.framing.defaultHeaderLength).toBe(4);
        expect(thalesPayshield10kSpec.framing.commandCodeLength).toBe(2);
        expect(thalesPayshield10kSpec.framing.responseErrorCodeLength).toBe(2);
        expect(thalesPayshield10kSpec.framing.successErrorCode).toBe('00');
        expect(thalesPayshield10kSpec.framing.endMessageDelimiter).toBe('\x19');
        expect(thalesPayshield10kSpec.framing.lmkIdDelimiter).toBe('%');
      }
    });

    it('validates Futurex Excrypt tag-value framing configuration', () => {
      expect(futurexExcryptSpec).toBeDefined();
      expect(futurexExcryptSpec.framing.type).toBe('tag-value');
      if (futurexExcryptSpec.framing.type === 'tag-value') {
        expect(futurexExcryptSpec.framing.startDelimiter).toBe('[');
        expect(futurexExcryptSpec.framing.endDelimiter).toBe(']');
        expect(futurexExcryptSpec.framing.pairDelimiter).toBe(';');
        expect(futurexExcryptSpec.framing.commandTag).toBe('AO');
        expect(futurexExcryptSpec.framing.tagLength).toBe(2);
        expect(futurexExcryptSpec.framing.errorCommandCode).toBe('ERRO');
        expect(futurexExcryptSpec.framing.errorCodeTag).toBe('AM');
        expect(futurexExcryptSpec.framing.offendingTagTag).toBe('AN');
        expect(futurexExcryptSpec.framing.errorMessageTag).toBe('BB');
      }
    });
  });
});

describe('Bilingual Completeness Audit (ES / EN Parity)', () => {
  const supported = [atallaAt1000Spec, thalesPayshield10kSpec, futurexExcryptSpec];

  for (const device of supported) {
    describe(`Bilingual audit for device: ${device?.id ?? 'unknown'}`, () => {
      it('has non-empty bilingual summary at device level', () => {
        expect(device).toBeDefined();
        assertBilingual(device.summary, `${device.id}.summary`);
      });

      it('has non-empty bilingual labels and release notes across all versions', () => {
        for (const [vKey, ver] of Object.entries(device.versions)) {
          assertBilingual(ver.label, `${device.id}.${vKey}.label`);
          if (ver.releaseNotes) {
            assertBilingual(ver.releaseNotes, `${device.id}.${vKey}.releaseNotes`);
          }
        }
      });

      it('has non-empty bilingual metadata and citations across all commands', () => {
        for (const [vKey, ver] of Object.entries(device.versions)) {
          for (const cmd of ver.commands) {
            const ctx = `${device.id}.${vKey}.commands[${cmd.id}]`;
            expect(cmd.id.trim().length, `Command id empty at ${ctx}`).toBeGreaterThan(0);
            expect(cmd.code.trim().length, `Command code empty at ${ctx}`).toBeGreaterThan(0);
            expect(['request', 'response']).toContain(cmd.direction);

            assertBilingual(cmd.name, `${ctx}.name`);
            assertBilingual(cmd.summary, `${ctx}.summary`);
            assertBilingual(cmd.description, `${ctx}.description`);
            assertBilingual(cmd.category, `${ctx}.category`);

            expect(typeof cmd.source, `Source citation missing at ${ctx}`).toBe('string');
            expect(cmd.source.trim().length, `Source citation empty at ${ctx}`).toBeGreaterThan(0);

            if (cmd.notes) {
              cmd.notes.forEach((note, idx) => {
                assertBilingual(note, `${ctx}.notes[${idx}]`);
              });
            }

            if (cmd.examples) {
              cmd.examples.forEach((ex, idx) => {
                assertBilingual(ex.title, `${ctx}.examples[${idx}].title`);
                expect(ex.raw.trim().length, `Example raw empty at ${ctx}.examples[${idx}]`).toBeGreaterThan(0);
                if (ex.description) {
                  assertBilingual(ex.description, `${ctx}.examples[${idx}].description`);
                }
              });
            }

            // Inspect all command fields
            for (const field of cmd.fields) {
              const fieldCtx = `${ctx}.fields[${field.id}]`;
              expect(field.id.trim().length, `Field id empty at ${fieldCtx}`).toBeGreaterThan(0);
              assertBilingual(field.name, `${fieldCtx}.name`);
              assertBilingual(field.description, `${fieldCtx}.description`);

              if (field.notes) {
                assertBilingual(field.notes, `${fieldCtx}.notes`);
              }

              if (field.enumValues) {
                field.enumValues.forEach((opt, oIdx) => {
                  expect(opt.value.trim().length, `Enum value empty at ${fieldCtx}.enumValues[${oIdx}]`).toBeGreaterThan(0);
                  assertBilingual(opt.label, `${fieldCtx}.enumValues[${oIdx}].label`);
                  if (opt.description) {
                    assertBilingual(opt.description, `${fieldCtx}.enumValues[${oIdx}].description`);
                  }
                });
              }
            }
          }
        }
      });

      it('has non-empty bilingual titles and descriptions across all error codes', () => {
        for (const [vKey, ver] of Object.entries(device.versions)) {
          for (const [errCode, errSpec] of Object.entries(ver.errorCodes)) {
            const errCtx = `${device.id}.${vKey}.errorCodes[${errCode}]`;
            expect(errSpec.code).toBe(errCode);
            assertBilingual(errSpec.title, `${errCtx}.title`);
            assertBilingual(errSpec.description, `${errCtx}.description`);

            if (errSpec.troubleshooting) {
              assertBilingual(errSpec.troubleshooting, `${errCtx}.troubleshooting`);
            }
          }
        }
      });
    });
  }
});

describe('Version Inheritance Hierarchy (`resolveDeviceVersion`)', () => {
  describe('Thales payShield 10K (v2.3 extends v1.9)', () => {
    it('declares extends: "1.9" in version 2.3 specification', () => {
      const v23 = thalesPayshield10kSpec.versions['2.3'];
      expect(v23).toBeDefined();
      expect(v23?.extends).toBe('1.9');
    });

    it('resolves base version 1.9 containing core commands and error codes', () => {
      const resolved19 = resolveDeviceVersion(thalesPayshield10kSpec, '1.9');
      expect(resolved19.version).toBe('1.9');

      const cmdCodes = resolved19.commands.map((c) => c.code);
      expect(cmdCodes).toContain('NC'); // Diagnostics Request
      expect(cmdCodes).toContain('ND'); // Diagnostics Response
      expect(cmdCodes).toContain('A0'); // Generate Key Request
      expect(cmdCodes).toContain('A1'); // Generate Key Response
      expect(cmdCodes).toContain('CA'); // PIN Translate Request
      expect(cmdCodes).toContain('CB'); // PIN Translate Response

      expect(resolved19.errorCodes['00']).toBeDefined();
      expect(resolved19.errorCodes['15']).toBeDefined();
    });

    it('resolves derived version 2.3 inheriting all commands and error codes from 1.9', () => {
      const resolved19 = resolveDeviceVersion(thalesPayshield10kSpec, '1.9');
      const resolved23 = resolveDeviceVersion(thalesPayshield10kSpec, '2.3');

      expect(resolved23.version).toBe('2.3');
      expect(resolved23.commands.length).toBeGreaterThanOrEqual(resolved19.commands.length);

      // Verify each 1.9 command is accessible in 2.3
      for (const cmd19 of resolved19.commands) {
        const found = resolved23.commands.find((c) => c.id === cmd19.id);
        expect(found, `Command ${cmd19.id} not inherited into v2.3`).toBeDefined();
      }

      // Verify each 1.9 error code is accessible in 2.3
      for (const errCode of Object.keys(resolved19.errorCodes)) {
        expect(resolved23.errorCodes[errCode], `Error code ${errCode} not inherited into v2.3`).toBeDefined();
      }
    });
  });

  describe('Utimaco Atalla AT1000 (v8.60 extends v8.50)', () => {
    it('declares extends: "8.50" in version 8.60 specification', () => {
      const v86 = atallaAt1000Spec.versions['8.60'];
      expect(v86).toBeDefined();
      expect(v86?.extends).toBe('8.50');
    });

    it('resolves base version 8.50 containing core commands and error codes', () => {
      const resolved85 = resolveDeviceVersion(atallaAt1000Spec, '8.50');
      expect(resolved85.version).toBe('8.50');

      const cmdCodes = resolved85.commands.map((c) => c.code);
      expect(cmdCodes).toContain('00'); // Echo Request & Response
      expect(cmdCodes).toContain('10'); // Generate Working Key Request
      expect(cmdCodes).toContain('20'); // Generate Working Key Response
      expect(cmdCodes).toContain('31'); // PIN Translation Request
      expect(cmdCodes).toContain('41'); // PIN Translation Response

      expect(resolved85.errorCodes['00']).toBeDefined();
      expect(resolved85.errorCodes['02']).toBeDefined();
    });

    it('resolves derived version 8.60 inheriting all commands and error codes from 8.50', () => {
      const resolved85 = resolveDeviceVersion(atallaAt1000Spec, '8.50');
      const resolved86 = resolveDeviceVersion(atallaAt1000Spec, '8.60');

      expect(resolved86.version).toBe('8.60');
      expect(resolved86.commands.length).toBeGreaterThanOrEqual(resolved85.commands.length);

      // Verify all commands from 8.50 are accessible in 8.60
      for (const cmd85 of resolved85.commands) {
        const found = resolved86.commands.find((c) => c.id === cmd85.id);
        expect(found, `Command ${cmd85.id} not inherited into v8.60`).toBeDefined();
      }

      // Verify error codes from 8.50 are accessible in 8.60
      for (const errCode of Object.keys(resolved85.errorCodes)) {
        expect(resolved86.errorCodes[errCode], `Error code ${errCode} not inherited into v8.60`).toBeDefined();
      }
    });

    it('accurately parses Command BF (Verify VSVC S3 Signature) with all 7 parameters broken down', () => {
      const rawCmd =
        '<BF#1mVNE000,238046ABFEB1D0FEBDBF663EFA990245087B3A4D7EBA33C5,E63E7035EEAEB721#451861#0000000011#970731#000E#0000002E0000015A9000#1B48ED0AF1BA1A98#>';
      const parsed = parseCommand(rawCmd, atallaAt1000Spec, { version: '8.60' });

      expect(parsed.valid).toBe(true);
      expect(parsed.commandCode).toBe('BF');
      expect(parsed.matchedCommand?.id).toBe('atalla-bf-req');
      expect(parsed.fields.length).toBe(7);

      // Field 0: VSVC Master Key (AKB mode detected, length 74)
      expect(parsed.fields[0]?.id).toBe('vsvc-master-key');
      expect(parsed.fields[0]?.sensitive).toBe(true);
      expect(parsed.fields[0]?.maskedValue).toBe('••••••••');
      expect(parsed.fields[0]?.rawValue).toContain('1mVNE000');
      expect(parsed.fields[0]?.detectedMode).toBe('akb');
      expect(parsed.fields[0]?.variants?.length).toBe(2);
      expect(parsed.fields[0]?.variants?.[0]?.mode).toBe('akb');
      expect(parsed.fields[0]?.variants?.[0]?.lengthText).toBe('74');
      expect(parsed.fields[0]?.variants?.[1]?.mode).toBe('variant');
      expect(parsed.fields[0]?.variants?.[1]?.lengthText).toBe('32');

      // Field 1: Ppiep
      expect(parsed.fields[1]?.id).toBe('ppiep');
      expect(parsed.fields[1]?.rawValue).toBe('451861');

      // Field 2: IEPid
      expect(parsed.fields[2]?.id).toBe('iepid');
      expect(parsed.fields[2]?.rawValue).toBe('0000000011');

      // Field 3: DEXPiep
      expect(parsed.fields[3]?.id).toBe('dexpiep');
      expect(parsed.fields[3]?.rawValue).toBe('970731');

      // Field 4: NTiep
      expect(parsed.fields[4]?.id).toBe('ntiep');
      expect(parsed.fields[4]?.rawValue).toBe('000E');

      // Field 5: S3 Data
      expect(parsed.fields[5]?.id).toBe('s3-data');
      expect(parsed.fields[5]?.rawValue).toBe('0000002E0000015A9000');

      // Field 6: S3 Signature
      expect(parsed.fields[6]?.id).toBe('s3-signature');
      expect(parsed.fields[6]?.rawValue).toBe('1B48ED0AF1BA1A98');
      expect(parsed.fields[6]?.sensitive).toBe(true);
      expect(parsed.fields[6]?.maskedValue).toBe('••••••••');
    });

    it('accurately parses Command BF with Variant key (32 hex characters)', () => {
      const rawVariantCmd =
        '<BF#0123456789ABCDEF0123456789ABCDEF#451861#0000000011#970731#000E#0000002E0000015A9000#1B48ED0AF1BA1A98#>';
      const parsedVariant = parseCommand(rawVariantCmd, atallaAt1000Spec, { version: '8.60' });

      expect(parsedVariant.valid).toBe(true);
      expect(parsedVariant.commandCode).toBe('BF');
      expect(parsedVariant.fields[0]?.detectedMode).toBe('variant');
      expect(parsedVariant.fields[0]?.rawValue).toBe('0123456789ABCDEF0123456789ABCDEF');
    });

    it('resolves all 453 command specifications for Atalla AT1000 v8.60', () => {
      expect(atallaAt1000Spec.versions['8.60']?.commands.length).toBe(453);
      const resolved86 = resolveDeviceVersion(atallaAt1000Spec, '8.60');
      expect(resolved86.commands.length).toBe(460);
    });
  });

  it('throws when attempting to resolve a non-existent version string', () => {
    expect(() => resolveDeviceVersion(thalesPayshield10kSpec, '99.99')).toThrow(
      /does not exist/
    );
    expect(() => resolveDeviceVersion(atallaAt1000Spec, '0.00')).toThrow(
      /does not exist/
    );
  });
});
