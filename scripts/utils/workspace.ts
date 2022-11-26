import memoize from 'memoizerific';
import { resolve } from 'path';
import { execaCommand } from './exec';

export type Workspace = { name: string; location: string };

const codeDir = resolve(__dirname, '../../code');

async function getWorkspaces() {
  const { stdout } = await execaCommand('yarn workspaces list --json', {
    cwd: codeDir,
    shell: true,
  });
  return JSON.parse(`[${stdout.split('\n').join(',')}]`) as Workspace[];
}

const getWorkspacesMemo = memoize(1)(getWorkspaces);

export async function workspacePath(type: string, packageName: string) {
  const workspaces = await getWorkspacesMemo();
  const workspace = workspaces.find((w) => w.name === packageName);
  if (!workspace) {
    throw new Error(`Unknown ${type} '${packageName}', not in yarn workspace!`);
  }
  return workspace.location;
}
