/**
 * @packageDocumentation
 * Golden Corpus Test Suite for Thales payShield 10K v2.3 Commands and Error Handling.
 * Verifies that all 512 command specifications (256 requests + 256 responses)
 * and Chapter 12 error codes are accurately recognized and processed by @chci/parser-core.
 */

import { describe, expect, it } from 'vitest';
import { parseCommand, type CommandSpec } from '@chci/parser-core';
import { thalesPayshield10kSpec, thalesPayshieldCommandsV23, THALES_PAYSHIELD_V23_ERRORS } from '../index';

function synthesizeThalesFrame(cmd: CommandSpec, errorCode?: string): string {
  const header = '0000';
  let body = cmd.code;

  if (cmd.direction === 'response') {
    body += errorCode ?? '00';
  }

  for (const f of cmd.fields) {
    if (f.id === 'header' || f.id === 'commandCode' || f.id === 'errorCode') continue;
    if (f.length.kind === 'thales-key') {
      body += 'U0123456789ABCDEFFEDCBA9876543210';
    } else if (f.length.kind === 'fixed') {
      const len = f.length.length;
      if (f.encoding === 'hex-ascii' || f.encoding === 'binary-hex') {
        const sample = '0123456789ABCDEF0123456789ABCDEF';
        body += sample.repeat(Math.ceil(len / sample.length)).slice(0, len);
      } else if (f.encoding === 'decimal') {
        const sample = '12345678901234567890';
        body += sample.repeat(Math.ceil(len / sample.length)).slice(0, len);
      } else {
        const sample = 'A1B2C3D4E5F6G7H8';
        body += sample.repeat(Math.ceil(len / sample.length)).slice(0, len);
      }
    } else if (f.length.kind === 'delimited') {
      body += 'TEST' + f.length.delimiter;
    } else if (f.length.kind === 'variable') {
      const len = Math.max(1, f.length.min ?? 1);
      body += '0'.repeat(len);
    } else {
      body += '00';
    }
  }

  return header + body;
}

describe('Thales payShield 10K v2.3 Golden Corpus & Error Catalog Suite', () => {
  const requestCommands = thalesPayshieldCommandsV23.filter((c) => c.direction === 'request');
  const responseCommands = thalesPayshieldCommandsV23.filter((c) => c.direction === 'response');

  it('verifies that all 256 request commands match their specification and direction', () => {
    let passed = 0;

    for (const cmd of requestCommands) {
      const raw = synthesizeThalesFrame(cmd);
      const res = parseCommand(raw, thalesPayshield10kSpec, {
        version: '2.3',
        headerLength: 4,
        expectedDirection: 'request'
      });

      expect(res.commandCode).toBe(cmd.code);
      expect(res.detectedDirection).toBe('request');
      expect(res.matchedCommand).not.toBeNull();
      if (res.matchedCommand?.code === cmd.code) {
        passed++;
      }
    }

    const rate = passed / requestCommands.length;
    expect(rate).toBeGreaterThanOrEqual(0.95);
    expect(passed).toBe(256);
  });

  it('verifies that all 256 response commands parse success status and extract fields', () => {
    let passed = 0;

    for (const cmd of responseCommands) {
      const raw = synthesizeThalesFrame(cmd, '00');
      const res = parseCommand(raw, thalesPayshield10kSpec, {
        version: '2.3',
        headerLength: 4,
        expectedDirection: 'response'
      });

      expect(res.commandCode).toBe(cmd.code);
      expect(res.detectedDirection).toBe('response');
      expect(res.isErrorResponse).toBe(false);
      expect(res.errorCode).toBe('00');
      expect(res.matchedCommand).not.toBeNull();
      if (res.matchedCommand?.code === cmd.code) {
        passed++;
      }
    }

    const rate = passed / responseCommands.length;
    expect(rate).toBeGreaterThanOrEqual(0.95);
    expect(passed).toBe(256);
  });

  it('verifies that Chapter 12 error responses attach official error titles and descriptions', () => {
    const errorCodesToTest = ['01', '10', '11', '14', '15', '20', '23', '24', '26', '80', '83', 'A4', 'D3'];
    const sampleResponseCmd = responseCommands[0]!;

    for (const errCode of errorCodesToTest) {
      const raw = synthesizeThalesFrame(sampleResponseCmd, errCode);
      const res = parseCommand(raw, thalesPayshield10kSpec, {
        version: '2.3',
        headerLength: 4,
        expectedDirection: 'response'
      });

      expect(res.isErrorResponse).toBe(true);
      expect(res.errorCode).toBe(errCode);
      expect(res.errorSpec).not.toBeNull();
      expect(res.errorSpec?.code).toBe(errCode);
      expect(res.errorSpec?.title.es).toBeDefined();
      expect(res.errorSpec?.title.en).toBeDefined();
      expect(res.errorSpec?.description.es).toBeDefined();
      expect(res.errorSpec?.description.en).toBeDefined();

      const expectedSpec = THALES_PAYSHIELD_V23_ERRORS[errCode];
      expect(res.errorSpec?.title.en).toBe(expectedSpec?.title.en);
    }
  });

  it('gracefully handles unknown error code in response frame', () => {
    // Response frame with unknown error code 'ZZ'
    const unknownErrFrame = 'HDR1NDZZ';
    const res = parseCommand(unknownErrFrame, thalesPayshield10kSpec, {
      version: '2.3',
      headerLength: 4,
      expectedDirection: 'response'
    });

    expect(res.isErrorResponse).toBe(true);
    expect(res.errorCode).toBe('ZZ');
    expect(res.errorSpec).toBeNull();
  });

  it('verifies raw mode with headerLength 0 (without 4-byte header)', () => {
    const sampleCmd = requestCommands[0]!;
    const rawNoHeader = sampleCmd.code + '0000U';
    const res = parseCommand(rawNoHeader, thalesPayshield10kSpec, {
      version: '2.3',
      headerLength: 0,
      expectedDirection: 'request'
    });

    expect(res.commandCode).toBe(sampleCmd.code);
    expect(res.matchedCommand).not.toBeNull();
    expect(res.segments[0]?.role).toBe('command-code');
  });
});
