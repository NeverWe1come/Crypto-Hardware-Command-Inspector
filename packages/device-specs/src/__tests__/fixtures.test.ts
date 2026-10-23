/**
 * @packageDocumentation
 * Test suite verifying real vendor command and response frames against `@chci/device-specs`.
 *
 * Exercises documentation-authentic frames for:
 * 1. Utimaco Atalla AT1000 (Echo, Generate Working Key, PIN Translation, Error responses)
 * 2. Thales payShield 10K (Diagnostics, Generate Key, PIN Translate, Error responses, Key Blocks)
 * 3. Futurex Excrypt (Echo, Status flags, Generate PEK, Error responses)
 *
 * Enforces `valid: true`, correct command code resolution, field values, and sensitive field masking.
 */

import { describe, expect, it } from 'vitest';
import { parseCommand } from '@chci/parser-core';
import {
  atallaAt1000Spec,
  futurexExcryptSpec,
  thalesPayshield10kSpec
} from '../index';

describe('Real Hardware Command Fixtures Suite', () => {
  // =========================================================================
  // 1. Utimaco Atalla AT1000 Fixtures (v8.50 & v8.60)
  // =========================================================================
  describe('Utimaco Atalla AT1000 Command Fixtures', () => {
    describe('Command 00: Echo Test Message', () => {
      it('parses real request frame (<00#1234#>)', () => {
        const raw = '<00#1234#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.60' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('00');
        expect(res.detectedDirection).toBe('request');
        expect(res.isErrorResponse).toBe(false);
        expect(res.fields.length).toBeGreaterThanOrEqual(1);

        const echoField = res.fields[0];
        expect(echoField?.rawValue).toBe('1234');
        expect(echoField?.decodedValue).toBe('1234');
      });

      it('parses real request frame with context tag (<00#1234#^MYCTX#>)', () => {
        const raw = '<00#1234#^MYCTX#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.60' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('00');
        expect(res.echoToken).toBe('MYCTX');
        expect(res.fields[0]?.rawValue).toBe('1234');
      });

      it('parses real response frame under firmware 8.60 (<00#000086#1234#>)', () => {
        const raw = '<00#000086#1234#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.60' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('00');
        expect(res.detectedDirection).toBe('response');
        expect(res.isErrorResponse).toBe(false);
        expect(res.errorCode).toBe('00');
        expect(res.firmwareVersionToken).toBe('86');
        expect(res.fields).toHaveLength(2);
        expect(res.fields[0]?.rawValue).toBe('000086');
        expect(res.fields[1]?.rawValue).toBe('1234');
      });

      it('parses real response frame under firmware 8.50 (<00#000085#1234#>)', () => {
        const raw = '<00#000085#1234#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.50' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('00');
        expect(res.detectedDirection).toBe('response');
        expect(res.isErrorResponse).toBe(false);
        expect(res.errorCode).toBe('00');
        expect(res.firmwareVersionToken).toBe('85');
        expect(res.fields[1]?.rawValue).toBe('1234');
      });
    });

    describe('Command 10 & 20: Generate Working Key', () => {
      it('parses real request frame (<10#1#1AKB12345678#16#>) masking master key cryptogram', () => {
        const raw = '<10#1#1AKB12345678#16#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.60' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('10');
        expect(res.detectedDirection).toBe('request');
        expect(res.fields).toHaveLength(3);

        // Key usage
        expect(res.fields[0]?.rawValue).toBe('1');
        // Master key (sensitive)
        expect(res.fields[1]?.sensitive).toBe(true);
        expect(res.fields[1]?.maskedValue).toBe('••••••••');
        expect(res.fields[1]?.rawValue).toBe('1AKB12345678');
        // Key length
        expect(res.fields[2]?.rawValue).toBe('16');
      });

      it('parses real response frame (<20#1AKB99998888#ABCD#>) masking generated key', () => {
        const raw = '<20#1AKB99998888#ABCD#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.60' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('20');
        expect(res.detectedDirection).toBe('response');
        expect(res.fields).toHaveLength(2);

        // Generated working key (sensitive)
        expect(res.fields[0]?.sensitive).toBe(true);
        expect(res.fields[0]?.maskedValue).toBe('••••••••');
        expect(res.fields[0]?.rawValue).toBe('1AKB99998888');
        // Check digits / KCV
        expect(res.fields[1]?.sensitive).toBeFalsy();
        expect(res.fields[1]?.rawValue).toBe('ABCD');
        expect(res.fields[1]?.maskedValue).toBe('ABCD');
      });
    });

    describe('Command 31 & 41: PIN Translation', () => {
      it('parses subcode 1 ANSI request (<31#1#8C2A7691A708A88D#72E7AEF691471872#7B58719B354B147A#987654321012#>)', () => {
        const raw = '<31#1#8C2A7691A708A88D#72E7AEF691471872#7B58719B354B147A#987654321012#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.60' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('31');
        expect(res.subCode).toBe('1');
        expect(res.detectedDirection).toBe('request');

        // Fields: format(0), incoming key(1), outgoing key(2), pin block(3), pan(4)
        expect(res.fields[0]?.rawValue).toBe('1');

        // Keys and PIN Block must be masked
        const pinBlockField = res.fields.find((f) => f.rawValue === '7B58719B354B147A');
        expect(pinBlockField).toBeDefined();
        expect(pinBlockField?.sensitive).toBe(true);
        expect(pinBlockField?.maskedValue).toBe('••••••••');

        const panField = res.fields.find((f) => f.rawValue === '987654321012');
        expect(panField).toBeDefined();
        expect(panField?.rawValue).toBe('987654321012');
      });

      it('parses subcode 7 DUKPT request (<31#7#4A79F2A0E61FEECF#72E7AEF691471872#8AEDF7F95963F4D8#987654321012#9876543210E00008#1#>)', () => {
        const raw = '<31#7#4A79F2A0E61FEECF#72E7AEF691471872#8AEDF7F95963F4D8#987654321012#9876543210E00008#1#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.60' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('31');
        expect(res.subCode).toBe('7');
        expect(res.detectedDirection).toBe('request');

        const pinBlockField = res.fields.find((f) => f.rawValue === '8AEDF7F95963F4D8');
        expect(pinBlockField).toBeDefined();
        expect(pinBlockField?.sensitive).toBe(true);
        expect(pinBlockField?.maskedValue).toBe('••••••••');
      });

      it('parses Command 41 response (<41#50DD506F53C3828A#Y#>) masking translated PIN block', () => {
        const raw = '<41#50DD506F53C3828A#Y#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.60' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('41');
        expect(res.detectedDirection).toBe('response');

        // Translated PIN Block (sensitive)
        expect(res.fields[0]?.sensitive).toBe(true);
        expect(res.fields[0]?.maskedValue).toBe('••••••••');
        expect(res.fields[0]?.rawValue).toBe('50DD506F53C3828A');

        // Sanity Check Indicator
        expect(res.fields[1]?.rawValue).toBe('Y');
      });
    });

    describe('Atalla Error Response Format', () => {
      it('parses real error frame (<00#020186#0000#>) with diagnostic and error code extraction', () => {
        const raw = '<00#020186#0000#>';
        const res = parseCommand(raw, atallaAt1000Spec, { version: '8.60' });

        expect(res.detectedDirection).toBe('response');
        expect(res.isErrorResponse).toBe(true);
        expect(res.errorCode).toBe('02');
        expect(res.offendingFieldOrTag).toBe('01');
        expect(res.firmwareVersionToken).toBe('86');
        expect(res.errorSpec?.code).toBe('02');
        expect(res.diagnostics.some((d) => d.code === 'ERROR_RESPONSE_CODE')).toBe(true);
      });
    });
  });

  // =========================================================================
  // 2. Thales payShield 10K Fixtures (v1.9 & v2.3)
  // =========================================================================
  describe('Thales payShield 10K Command Fixtures', () => {
    describe('Diagnostics: Commands NC & ND', () => {
      it('parses real request frame (0000NC)', () => {
        const raw = '0000NC';
        const res = parseCommand(raw, thalesPayshield10kSpec, { version: '2.3' });

        expect(res.valid).toBe(true);
        expect(res.headerValue).toBe('0000');
        expect(res.commandCode).toBe('NC');
        expect(res.detectedDirection).toBe('request');
        expect(res.fields).toHaveLength(0);
      });

      it('parses real response frame (0000ND000123456789ABCDEF1347-0900)', () => {
        const raw = '0000ND000123456789ABCDEF1347-0900';
        const res = parseCommand(raw, thalesPayshield10kSpec, { version: '2.3' });

        expect(res.valid).toBe(true);
        expect(res.headerValue).toBe('0000');
        expect(res.commandCode).toBe('ND');
        expect(res.detectedDirection).toBe('response');
        expect(res.isErrorResponse).toBe(false);
        expect(res.errorCode).toBe('00');
        expect(res.fields).toHaveLength(2);

        expect(res.fields[0]?.rawValue).toBe('0123456789ABCDEF'); // LMK check value
        expect(res.fields[1]?.rawValue).toBe('1347-0900'); // Firmware release number
      });
    });

    describe('Key Management: Commands A0 & A1', () => {
      it('parses real request frame (0001A00000U)', () => {
        const raw = '0001A00000U';
        const res = parseCommand(raw, thalesPayshield10kSpec, { version: '2.3' });

        expect(res.valid).toBe(true);
        expect(res.headerValue).toBe('0001');
        expect(res.commandCode).toBe('A0');
        expect(res.detectedDirection).toBe('request');
        expect(res.fields).toHaveLength(3);

        expect(res.fields[0]?.rawValue).toBe('0'); // Mode: generate
        expect(res.fields[1]?.rawValue).toBe('000'); // Key type
        expect(res.fields[2]?.rawValue).toBe('U'); // Scheme: double-length
      });

      it('parses real response frame with U-prefix double key masking clear key', () => {
        const keyU = 'U0123456789ABCDEF0123456789ABCDEF';
        const raw = `0001A100${keyU}A1B2C3`;
        const res = parseCommand(raw, thalesPayshield10kSpec, { version: '2.3' });

        expect(res.valid).toBe(true);
        expect(res.headerValue).toBe('0001');
        expect(res.commandCode).toBe('A1');
        expect(res.detectedDirection).toBe('response');
        expect(res.errorCode).toBe('00');
        expect(res.fields).toHaveLength(2);

        // Generated key under LMK (sensitive)
        expect(res.fields[0]?.sensitive).toBe(true);
        expect(res.fields[0]?.maskedValue).toBe('••••••••');
        expect(res.fields[0]?.rawValue).toBe(keyU);

        // KCV
        expect(res.fields[1]?.rawValue).toBe('A1B2C3');
        expect(res.fields[1]?.maskedValue).toBe('A1B2C3');
      });
    });

    describe('PIN Processing: Commands CA & CB', () => {
      it('parses real PIN Translate request (0001CA...) with sensitive masking on keys and PIN block', () => {
        const tpk = 'U11112222333344445555666677778888';
        const zpk = 'U9999AAAABBBBCCCCDDDDFFFF00001111';
        const pinBlock = '0123456789ABCDEF';
        const raw = `0001CA${tpk}${zpk}12${pinBlock}0101123456789012`;

        const res = parseCommand(raw, thalesPayshield10kSpec, { version: '2.3' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('CA');
        expect(res.detectedDirection).toBe('request');

        // Check that keys and PIN block are extracted and masked
        const tpkField = res.fields.find((f) => f.rawValue === tpk);
        expect(tpkField).toBeDefined();
        expect(tpkField?.sensitive).toBe(true);
        expect(tpkField?.maskedValue).toBe('••••••••');

        const zpkField = res.fields.find((f) => f.rawValue === zpk);
        expect(zpkField).toBeDefined();
        expect(zpkField?.sensitive).toBe(true);
        expect(zpkField?.maskedValue).toBe('••••••••');

        const pinField = res.fields.find((f) => f.rawValue === pinBlock);
        expect(pinField).toBeDefined();
        expect(pinField?.sensitive).toBe(true);
        expect(pinField?.maskedValue).toBe('••••••••');
      });

      it('parses real PIN Translate response (0001CB0005...) masking translated PIN block', () => {
        const translatedPin = '0123456789ABCDEF';
        const raw = `0001CB0005${translatedPin}01`;

        const res = parseCommand(raw, thalesPayshield10kSpec, { version: '2.3' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('CB');
        expect(res.detectedDirection).toBe('response');
        expect(res.errorCode).toBe('00');

        const pinField = res.fields.find((f) => f.rawValue === translatedPin);
        expect(pinField).toBeDefined();
        expect(pinField?.sensitive).toBe(true);
        expect(pinField?.maskedValue).toBe('••••••••');
      });
    });

    describe('Thales Key Block Frames (S and R schemes)', () => {
      it('parses S Key Block response frame (total length 96 chars) with sensitive masking', () => {
        const sKeyBlock = 'S0096' + 'E'.repeat(91);
        expect(sKeyBlock).toHaveLength(96);
        const raw = `0001A100${sKeyBlock}123456`;

        const res = parseCommand(raw, thalesPayshield10kSpec, { version: '2.3' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('A1');
        expect(res.fields[0]?.rawValue).toBe(sKeyBlock);
        expect(res.fields[0]?.rawValue).toHaveLength(96);
        expect(res.fields[0]?.sensitive).toBe(true);
        expect(res.fields[0]?.maskedValue).toBe('••••••••');
        expect(res.fields[1]?.rawValue).toBe('123456');
      });

      it('parses R TR-31 Key Block response frame (total length 80 chars) with sensitive masking', () => {
        const rKeyBlock = 'R0080' + 'F'.repeat(75);
        expect(rKeyBlock).toHaveLength(80);
        const raw = `0001A100${rKeyBlock}ABCDEF`;

        const res = parseCommand(raw, thalesPayshield10kSpec, { version: '2.3' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('A1');
        expect(res.fields[0]?.rawValue).toBe(rKeyBlock);
        expect(res.fields[0]?.rawValue).toHaveLength(80);
        expect(res.fields[0]?.sensitive).toBe(true);
        expect(res.fields[0]?.maskedValue).toBe('••••••••');
        expect(res.fields[1]?.rawValue).toBe('ABCDEF');
      });
    });

    describe('Thales Error Response', () => {
      it('parses error response 0001A115 with diagnostic and error code extraction', () => {
        const raw = '0001A115';
        const res = parseCommand(raw, thalesPayshield10kSpec, { version: '2.3' });

        expect(res.commandCode).toBe('A1');
        expect(res.detectedDirection).toBe('response');
        expect(res.isErrorResponse).toBe(true);
        expect(res.errorCode).toBe('15');
        expect(res.errorSpec?.code).toBe('15');
        expect(res.diagnostics.some((d) => d.code === 'ERROR_RESPONSE_CODE')).toBe(true);
      });
    });
  });

  // =========================================================================
  // 3. Futurex Excrypt Fixtures (v7.6.1)
  // =========================================================================
  describe('Futurex Excrypt Command Fixtures', () => {
    describe('Command ECHO: Communication Test', () => {
      it('parses real request frame ([AOECHO;AGHello;]) with echo token extraction', () => {
        const raw = '[AOECHO;AGHello;]';
        const res = parseCommand(raw, futurexExcryptSpec, { version: '7.6.1' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('ECHO');
        expect(res.detectedDirection).toBe('request');
        expect(res.echoToken).toBe('Hello');

        const agField = res.fields.find((f) => f.tag === 'AG');
        expect(agField?.rawValue).toBe('Hello');
      });

      it('parses real response frame ([AOECHO;AGHello;BB4000;])', () => {
        const raw = '[AOECHO;AGHello;BB4000;]';
        const res = parseCommand(raw, futurexExcryptSpec, { version: '7.6.1' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('ECHO');
        expect(res.detectedDirection).toBe('response');
        expect(res.echoToken).toBe('Hello');

        const bbField = res.fields.find((f) => f.tag === 'BB');
        expect(bbField?.rawValue).toBe('4000');
      });
    });

    describe('Command STAT: Extract Statistics', () => {
      it('parses real request frame ([AOSTAT;ZA;ZB;]) with flag-only empty tags', () => {
        const raw = '[AOSTAT;ZA;ZB;]';
        const res = parseCommand(raw, futurexExcryptSpec, { version: '7.6.1' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('STAT');
        expect(res.detectedDirection).toBe('request');
        expect(res.fields).toHaveLength(2);

        expect(res.fields[0]?.tag).toBe('ZA');
        expect(res.fields[0]?.rawValue).toBe('');
        expect(res.fields[1]?.tag).toBe('ZB');
        expect(res.fields[1]?.rawValue).toBe('');
      });
    });

    describe('Command GPEK: Generate PIN Encryption Key', () => {
      it('parses real request frame ([AOGPEK;FS1;])', () => {
        const raw = '[AOGPEK;FS1;]';
        const res = parseCommand(raw, futurexExcryptSpec, { version: '7.6.1' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('GPEK');
        expect(res.detectedDirection).toBe('request');

        const fsField = res.fields.find((f) => f.tag === 'FS');
        expect(fsField?.rawValue).toBe('1');
      });

      it('parses real response frame with cryptogram ([AOGPEK;GP1FE3410656493A1B;AE341E1D0B;AGContext;]) masking GP', () => {
        const raw = '[AOGPEK;GP1FE3410656493A1B;AE341E1D0B;AGContext;]';
        const res = parseCommand(raw, futurexExcryptSpec, { version: '7.6.1' });

        expect(res.valid).toBe(true);
        expect(res.commandCode).toBe('GPEK');
        expect(res.detectedDirection).toBe('response');
        expect(res.echoToken).toBe('Context');

        const gpField = res.fields.find((f) => f.tag === 'GP');
        expect(gpField).toBeDefined();
        expect(gpField?.sensitive).toBe(true);
        expect(gpField?.maskedValue).toBe('••••••••');
        expect(gpField?.rawValue).toBe('1FE3410656493A1B');

        const aeField = res.fields.find((f) => f.tag === 'AE');
        expect(aeField?.rawValue).toBe('341E1D0B');
      });
    });

    describe('Futurex Dedicated Error Response (ERRO)', () => {
      it('parses real error frame ([AOERRO;AM02;ANAF;BBInvalid tag;]) with diagnostic and tag extraction', () => {
        const raw = '[AOERRO;AM02;ANAF;BBInvalid tag;]';
        const res = parseCommand(raw, futurexExcryptSpec, { version: '7.6.1' });

        expect(res.commandCode).toBe('ERRO');
        expect(res.detectedDirection).toBe('response');
        expect(res.isErrorResponse).toBe(true);
        expect(res.errorCode).toBe('02');
        expect(res.offendingFieldOrTag).toBe('AF');
        expect(res.errorSpec?.code).toBe('02');
        expect(res.diagnostics.some((d) => d.code === 'ERROR_RESPONSE_CODE')).toBe(true);

        const bbField = res.fields.find((f) => f.tag === 'BB');
        expect(bbField?.rawValue).toBe('Invalid tag');
      });
    });
  });
});
