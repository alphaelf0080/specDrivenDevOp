#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { validateSpec } from '../specs/validate';
import { SlotSpecSchema, type SlotSpec } from '../specs/slot.schema';
import { SeededRNG } from '../engine/rng';
import { spinGrid, evaluateSpin } from '../engine/slotEngine';
import { simulate } from '../sim/simulator';
import { optimize } from '../agent/optimizer';

const program = new Command();
program.name('slot-cli').description('規格驅動老虎機引擎 CLI').version('0.1.0');

function loadSpec(p: string): SlotSpec {
  const abs = path.resolve(process.cwd(), p);
  const raw = JSON.parse(fs.readFileSync(abs, 'utf-8'));
  const parsed = SlotSpecSchema.parse(raw);
  return parsed;
}

program
  .command('validate')
  .description('驗證規格檔是否符合 Schema')
  .requiredOption('-s, --spec <file>', 'Slot 規格 JSON 檔路徑')
  .action((opts: { spec: string }) => {
    const raw = JSON.parse(fs.readFileSync(path.resolve(opts.spec), 'utf-8'));
    const res = validateSpec(raw);
    if (!res.ok) {
      console.error('規格無效：', res.errors);
      process.exitCode = 1;
    } else {
      console.log('規格有效。');
    }
  });

program
  .command('spin')
  .description('執行單次旋轉並輸出結果')
  .requiredOption('-s, --spec <file>', 'Slot 規格 JSON 檔路徑')
  .option('--seed <seed>', '亂數種子（RNG seed）', 'demo')
  .action((opts: { spec: string; seed?: string }) => {
    const spec = loadSpec(opts.spec);
    const rng = new SeededRNG(opts.seed ?? 'demo');
    const grid = spinGrid(spec, rng);
    const result = evaluateSpin(spec, grid);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('simulate')
  .description('執行多次旋轉模擬並輸出指標（RTP、波動度、命中率）')
  .requiredOption('-s, --spec <file>', 'Slot 規格 JSON 檔路徑')
  .option('--seed <seed>', '亂數種子（RNG seed）', 'demo')
  .option('--spins <n>', '旋轉次數', '5000')
  .action((opts: { spec: string; seed?: string; spins?: string }) => {
    const spec = loadSpec(opts.spec);
    const res = simulate(spec, {
      seed: opts.seed ?? 'demo',
      spins: parseInt(opts.spins ?? '5000', 10),
    });
    console.log(JSON.stringify(res, null, 2));
  });

program
  .command('optimize')
  .description('以啟發式搜尋調整輪帶以逼近目標 RTP／波動度')
  .requiredOption('-s, --spec <file>', 'Slot 規格 JSON 檔路徑')
  .option('--seed <seed>', '亂數種子（RNG seed）', 'demo')
  .option('--spins <n>', '每次迭代的旋轉數', '2000')
  .option('--iters <n>', '迭代次數', '20')
  .option('--targetRTP <r>', '目標 RTP（0-1）', '0.95')
  .option('--targetVol <v>', '目標波動度（可選）')
  .option('--lambda <l>', '波動度權重', '0.2')
  .action(
    (opts: {
      spec: string;
      seed?: string;
      spins?: string;
      iters?: string;
      targetRTP?: string;
      targetVol?: string;
      lambda?: string;
    }) => {
      const spec = loadSpec(opts.spec);
      const res = optimize(spec, {
        seed: opts.seed ?? 'demo',
        spins: parseInt(opts.spins ?? '2000', 10),
        iterations: parseInt(opts.iters ?? '20', 10),
        targetRTP: parseFloat(opts.targetRTP ?? '0.95'),
        targetVol: opts.targetVol != null ? parseFloat(opts.targetVol) : undefined,
        lambda: parseFloat(opts.lambda ?? '0.2'),
      });
      console.log(JSON.stringify(res, null, 2));
    },
  );

program.parseAsync(process.argv);
