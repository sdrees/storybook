import { AbortController } from 'node-abort-controller';
import path from 'path';
import { exec } from './exec';

const codeDir = path.resolve(__dirname, '../../code');

export async function servePackages({ dryRun, debug }: { dryRun?: boolean; debug?: boolean }) {
  const controller = new AbortController();
  exec(
    'CI=true yarn local-registry --open',
    { cwd: codeDir },
    { dryRun, debug, signal: controller.signal as AbortSignal }
  ).catch((err) => {
    // If aborted, we want to make sure the rejection is handled.
    if (!err.killed) throw err;
  });
  await exec('yarn wait-on http://localhost:6001', { cwd: codeDir }, { dryRun, debug });

  return controller;
}
