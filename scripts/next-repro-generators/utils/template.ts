import { render } from 'ejs';
import { readFile } from 'fs-extra';
import { format } from 'prettier';
import { GeneratorConfig } from './types';
import { allTemplates as reproTemplates } from '../../../code/lib/cli/src/repro-templates';

export async function renderTemplate(templatePath: string, templateData: Record<string, any>) {
  const template = await readFile(templatePath, 'utf8');

  const output = format(render(template, templateData), {
    parser: 'html',
  }).replace(new RegExp('</li>\\n\\n', 'g'), '</li>\n');
  return output;
}

export const getStackblitzUrl = (path: string, branch = 'next') => {
  return `https://stackblitz.com/github/storybookjs/repro-templates-temp/tree/${branch}/${path}/after-storybook?preset=node`;
};

export async function getTemplatesData() {
  type TemplatesData = Record<
    string,
    Record<
      string,
      GeneratorConfig & {
        stackblitzUrl: string;
      }
    >
  >;

  const templatesData = Object.keys(reproTemplates).reduce<TemplatesData>(
    (acc, curr: keyof typeof reproTemplates) => {
      const [dirName, templateName] = curr.split('/');
      const groupName =
        dirName === 'cra' ? 'CRA' : dirName.slice(0, 1).toUpperCase() + dirName.slice(1);
      const generatorData = reproTemplates[curr];
      acc[groupName] = acc[groupName] || {};
      acc[groupName][templateName] = {
        ...generatorData,
        stackblitzUrl: getStackblitzUrl(curr),
      };
      return acc;
    },
    {}
  );
  return templatesData;
}
