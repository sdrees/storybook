import { readdir } from 'fs/promises';
import { pathExists } from 'fs-extra';
import { resolve } from 'path';
import TEMPLATES from '../code/lib/cli/src/repro-templates';

const sandboxDir = resolve(__dirname, '../sandbox');

export type Cadence = 'ci' | 'daily' | 'weekly';
export type Template = {
  cadence?: readonly Cadence[];
  skipScripts?: string[];
  // there are other fields but we don't use them here
};
export type TemplateKey = string;
export type Templates = Record<TemplateKey, Template>;

async function getDirectories(source: string) {
  return (await readdir(source, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

export async function getTemplate(
  cadence: Cadence,
  scriptName: string,
  { index, total }: { index: number; total: number }
) {
  let potentialTemplateKeys: TemplateKey[] = [];
  if (await pathExists(sandboxDir)) {
    const sandboxes = await getDirectories(sandboxDir);
    potentialTemplateKeys = sandboxes
      .map((dirName) => {
        return Object.keys(TEMPLATES).find(
          (templateKey) => templateKey.replace('/', '-') === dirName
        );
      })
      .filter(Boolean);
  }

  if (potentialTemplateKeys.length === 0) {
    const allTemplates = Object.entries(TEMPLATES as Templates);
    const cadenceTemplates = allTemplates.filter(([, template]) =>
      template.cadence.includes(cadence)
    );
    const jobTemplates = cadenceTemplates.filter(([, t]) => !t.skipScripts?.includes(scriptName));
    potentialTemplateKeys = jobTemplates.map(([k]) => k);
  }

  if (potentialTemplateKeys.length !== total) {
    throw new Error(`Circle parallelism set incorrectly.
    
      Parallelism is set to ${total}, but there are ${
      potentialTemplateKeys.length
    } templates to run:
      ${potentialTemplateKeys.join(', ')}
    `);
  }

  return potentialTemplateKeys[index];
}

async function run() {
  const [, , cadence, scriptName] = process.argv;

  if (!cadence) throw new Error('Need to supply cadence to get template script');

  const { CIRCLE_NODE_INDEX = 0, CIRCLE_NODE_TOTAL = 1 } = process.env;

  console.log(
    await getTemplate(cadence as Cadence, scriptName, {
      index: +CIRCLE_NODE_INDEX,
      total: +CIRCLE_NODE_TOTAL,
    })
  );
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
