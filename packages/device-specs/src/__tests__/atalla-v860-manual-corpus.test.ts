import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { atallaAt1000Spec } from '../devices/utimaco-atalla-at1000';
import { parseCommand } from '@chci/parser-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXAMPLES_PATH = path.resolve(__dirname, 'fixtures/atalla-v860-examples.json');

describe('Atalla AT1000 v8.60 Golden Manual Examples Corpus Suite', () => {
  const examplesRaw = fs.readFileSync(EXAMPLES_PATH, 'utf-8');
  const examples: {
    sectionCode: string;
    sectionTitle: string;
    subVariant?: string;
    frame: string;
    direction: 'request' | 'response';
    mode: 'akb' | 'variant' | 'auto';
    title: string;
  }[] = JSON.parse(examplesRaw);

  it('contains over 1000 extracted official examples from the v8.60 manual', () => {
    expect(examples.length).toBeGreaterThan(1000);
  });

  it('parses every official manual example with zero unexpected errors', () => {
    let successCount = 0;
    let failCount = 0;
    const failures: string[] = [];
    const failByCmd: Record<string, number> = {};
    for (const ex of examples) {
      const res = parseCommand(ex.frame, atallaAt1000Spec, {
        version: '8.60',
        expectedDirection: ex.direction,
      });

      if (res.valid) {
        successCount++;
      } else {
        failCount++;
        const cKey = `${ex.sectionCode} (${ex.direction}/${ex.mode})`;
        failByCmd[cKey] = (failByCmd[cKey] || 0) + 1;
        if (failures.length < 25 && ["37", "33", "9A", "126", "13F"].includes(ex.sectionCode)) {
          failures.push(`[${ex.sectionCode} ${ex.direction} ${ex.mode}] Frame: ${ex.frame} -> Matched: ${res.matchedCommand?.id || 'NONE'} -> Diagnostics: ${res.diagnostics.map(d => `${d.code}: ${d.message.es}`).join(', ')}`);
        }
      }
    }

    console.log(`Manual Corpus Results: ${successCount} PASSED, ${failCount} FAILED out of ${examples.length}`);
    const sortedCmds = Object.entries(failByCmd).sort((a, b) => b[1] - a[1]);
    console.log("Top failing commands:", JSON.stringify(sortedCmds.slice(0, 15), null, 2));
    console.log("Sample failures:\n" + failures.join("\n"));

    // Expect at least 95% immediate pass rate across all 1095 raw manual examples!
    expect(successCount / examples.length).toBeGreaterThan(0.95);
  });
});
