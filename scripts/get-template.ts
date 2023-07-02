import { readdir } from 'fs/promises';
import { pathExists } from 'fs-extra';
import { program } from 'commander';
import dedent from 'ts-dedent';
import {
  allTemplates,
  templatesByCadence,
  type Cadence,
  type Template as TTemplate,
  type SkippableTask,
} from '../code/lib/cli/src/sandbox-templates';
import { SANDBOX_DIRECTORY } from './utils/constants';

const sandboxDir = process.env.SANDBOX_ROOT || SANDBOX_DIRECTORY;

type Template = Pick<TTemplate, 'inDevelopment' | 'skipTasks'>;
export type TemplateKey = keyof typeof allTemplates;
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
        return Object.keys(allTemplates).find(
          (templateKey) => templateKey.replace('/', '-') === dirName
        );
      })
      .filter(Boolean) as TemplateKey[];
  }

  if (potentialTemplateKeys.length === 0) {
    const cadenceTemplates = Object.entries(allTemplates).filter(([key]) =>
      templatesByCadence[cadence].includes(key as TemplateKey)
    );
    potentialTemplateKeys = cadenceTemplates.map(([k]) => k) as TemplateKey[];
  }

  potentialTemplateKeys = potentialTemplateKeys.filter((t) => {
    const currentTemplate = allTemplates[t] as Template;
    return (
      currentTemplate.inDevelopment !== true &&
      !currentTemplate.skipTasks?.includes(scriptName as SkippableTask)
    );
  });

  if (potentialTemplateKeys.length !== total) {
    throw new Error(dedent`Circle parallelism set incorrectly.
    
      Parallelism is set to ${total}, but there are ${
      potentialTemplateKeys.length
    } templates to run for the "${scriptName}" task:
      ${potentialTemplateKeys.map((v) => `- ${v}`).join('\n')}
    
      ${await getParallelismSummary(cadence)}
    `);
  }

  return potentialTemplateKeys[index];
}

const tasks = [
  'sandbox',
  'build',
  'chromatic',
  'e2e-tests',
  'e2e-tests-dev',
  'test-runner',
  // 'test-runner-dev', TODO: bring this back when the task is enabled again
  'bench',
];

async function getParallelismSummary(cadence?: Cadence, scriptName?: string) {
  let potentialTemplateKeys: TemplateKey[] = [];
  const cadences = cadence ? [cadence] : (Object.keys(templatesByCadence) as Cadence[]);
  const scripts = scriptName ? [scriptName] : tasks;
  const summary = [];
  summary.push('These are the values you should have in .circleci/config.yml:');
  cadences.forEach((cad) => {
    summary.push(`\n${cad}`);
    const cadenceTemplates = Object.entries(allTemplates).filter(([key]) =>
      templatesByCadence[cad].includes(key as TemplateKey)
    );
    potentialTemplateKeys = cadenceTemplates.map(([k]) => k) as TemplateKey[];

    scripts.forEach((script) => {
      const templateKeysPerScript = potentialTemplateKeys.filter((t) => {
        const currentTemplate = allTemplates[t] as Template;
        return (
          currentTemplate.inDevelopment !== true &&
          !currentTemplate.skipTasks?.includes(script as SkippableTask)
        );
      });
      if (templateKeysPerScript.length > 0) {
        summary.push(
          `-- ${script} - parallelism: ${templateKeysPerScript.length}${
            templateKeysPerScript.length === 2 ? ' (default)' : ''
          }`
        );
      } else {
        summary.push(`-- ${script} - this script is fully skipped for this cadence.`);
      }
    });
  });

  return summary.concat('\n').join('\n');
}

type RunOptions = { cadence?: Cadence; task?: string; debug: boolean };
async function run({ cadence, task, debug }: RunOptions) {
  if (debug) {
    if (task && !tasks.includes(task)) {
      throw new Error(
        dedent`The "${task}" task you provided is not valid. Valid tasks (found in .circleci/config.yml) are: 
        ${tasks.map((v) => `- ${v}`).join('\n')}`
      );
    }
    console.log(await getParallelismSummary(cadence as Cadence, task));
    return;
  }

  if (!cadence) throw new Error('Need to supply cadence to get template script');

  const { CIRCLE_NODE_INDEX = 0, CIRCLE_NODE_TOTAL = 1 } = process.env;

  console.log(
    await getTemplate(cadence as Cadence, task, {
      index: +CIRCLE_NODE_INDEX,
      total: +CIRCLE_NODE_TOTAL,
    })
  );
}

if (require.main === module) {
  program
    .description('Retrieve the template to run for a given cadence and task')
    .option('--cadence <cadence>', 'Which cadence you want to run the script for')
    .option('--task <task>', 'Which task you want to run the script for')
    .option('--debug', 'Whether to list the parallelism counts for tasks by cadence', false);

  program.parse(process.argv);

  const options = program.opts() as RunOptions;

  run(options).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
