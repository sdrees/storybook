import prompts from 'prompts';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';
import { dedent } from 'ts-dedent';
import { downloadTemplate } from 'giget';

import { existsSync } from 'fs-extra';
import { allTemplates as TEMPLATES } from './repro-templates';

const logger = console;

interface ReproOptions {
  filterValue?: string;
  output?: string;
  branch?: string;
  init?: boolean;
}
type Choice = keyof typeof TEMPLATES;

const toChoices = (c: Choice): prompts.Choice => ({ title: TEMPLATES[c].name, value: c });

export const reproNext = async ({
  output: outputDirectory,
  filterValue,
  branch,
  init,
}: ReproOptions) => {
  const keys = Object.keys(TEMPLATES) as Choice[];
  // get value from template and reduce through TEMPLATES to filter out the correct template
  const choices = keys.reduce<Choice[]>((acc, group) => {
    const current = TEMPLATES[group];

    const filterRegex = new RegExp(filterValue, 'i');
    if (!filterValue) {
      acc.push(group);
      return acc;
    }

    if (
      current.name.match(filterRegex) ||
      group.match(filterRegex) ||
      current.expected.builder.match(filterRegex) ||
      current.expected.framework.match(filterRegex) ||
      current.expected.renderer.match(filterRegex)
    ) {
      acc.push(group);
      return acc;
    }

    return acc;
  }, []);

  if (choices.length === 0) {
    logger.info(
      boxen(
        dedent`
          🔎 You filtered out all templates. 🔍
          
          After filtering all the templates with "${chalk.yellow(
            filterValue
          )}", we found no results. Please try again with a different filter.

          Available templates:
          ${keys.map((key) => chalk.blue`- ${key}`).join('\n')}
          `.trim(),
        { borderStyle: 'round', padding: 1, borderColor: '#F1618C' } as any
      )
    );
    process.exit(1);
  }

  let selectedTemplate: Choice | null = null;

  if (choices.length === 1) {
    [selectedTemplate] = choices;
  } else {
    logger.info(
      boxen(
        dedent`
          🤗 Welcome to ${chalk.yellow('sb repro NEXT')}! 🤗 
  
          Create a ${chalk.green('new project')} to minimally reproduce Storybook issues.
          
          1. select an environment that most closely matches your project setup.
          2. select a location for the reproduction, outside of your project.
          
          After the reproduction is ready, we'll guide you through the next steps.
          `.trim(),
        { borderStyle: 'round', padding: 1, borderColor: '#F1618C' } as any
      )
    );

    selectedTemplate = await promptSelectedTemplate(choices);
  }

  const hasSelectedTemplate = !!(selectedTemplate ?? null);
  if (!hasSelectedTemplate) {
    logger.error('Somehow we got no templates. Please rerun this command!');
    return;
  }

  const selectedConfig = TEMPLATES[selectedTemplate];

  if (!selectedConfig) {
    throw new Error('🚨 Repro: please specify a valid template type');
  }

  let selectedDirectory = outputDirectory;
  const outputDirectoryName = outputDirectory || selectedTemplate;
  if (selectedDirectory && existsSync(`${selectedDirectory}`)) {
    logger.info(`⚠️  ${selectedDirectory} already exists! Overwriting...`);
  }

  if (!selectedDirectory) {
    const { directory } = await prompts({
      type: 'text',
      message: 'Enter the output directory',
      name: 'directory',
      initial: outputDirectoryName,
      validate: async (directoryName) =>
        existsSync(directoryName)
          ? `${directoryName} already exists. Please choose another name.`
          : true,
    });
    selectedDirectory = directory;
  }

  try {
    const templateDestination = path.isAbsolute(selectedDirectory)
      ? selectedDirectory
      : path.join(process.cwd(), selectedDirectory);

    logger.info(`🏃 Adding ${selectedConfig.name} into ${templateDestination}`);

    logger.log('📦 Downloading repro template...');
    try {
      const templateType = init ? 'after-storybook' : 'before-storybook';
      // Download the repro based on subfolder "after-storybook" and selected branch
      await downloadTemplate(
        `github:storybookjs/repro-templates-temp/${selectedTemplate}/${templateType}#${branch}`,
        {
          force: true,
          dir: templateDestination,
        }
      );
    } catch (err) {
      logger.error(`🚨 Failed to download repro template: ${err.message}`);
      throw err;
    }

    const initMessage = init
      ? chalk.yellow(`yarn storybook`)
      : `Recreate your setup, then ${chalk.yellow(`run npx storybook init`)}`;

    logger.info(
      boxen(
        dedent`
        🎉 Your Storybook reproduction project is ready to use! 🎉

        ${chalk.yellow(`cd ${selectedDirectory}`)}
        ${initMessage}

        Once you've recreated the problem you're experiencing, please:
        
        1. Document any additional steps in ${chalk.cyan('README.md')}
        2. Publish the repository to github
        3. Link to the repro repository in your issue

        Having a clean repro helps us solve your issue faster! 🙏
      `.trim(),
        { borderStyle: 'round', padding: 1, borderColor: '#F1618C' } as any
      )
    );
  } catch (error) {
    logger.error('🚨 Failed to create repro');
    throw error;
  }
};

async function promptSelectedTemplate(choices: Choice[]): Promise<Choice | null> {
  const { template } = await prompts({
    type: 'select',
    message: '🌈 Select the template',
    name: 'template',
    choices: choices.map(toChoices),
  });

  return template || null;
}
