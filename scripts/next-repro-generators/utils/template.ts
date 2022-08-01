import { render } from 'ejs';
import { readFile } from 'fs-extra';
import yml from 'js-yaml';
import { format } from 'prettier';
import { GeneratorConfig } from './types';

export async function renderTemplate(templatePath: string, templateData: Record<string, any>) {
  const template = await readFile(templatePath, 'utf8');

  const output = format(render(template, templateData), {
    parser: 'html',
  }).replace(new RegExp('</li>\\n\\n', 'g'), '</li>\n');
  return output;
}

export const getStackblitzUrl = (path: string) => {
  return `https://stackblitz.com/github/storybookjs/repro-templates-temp/tree/main/${path}/after-storybook?preset=node`;
};

export async function getTemplatesData(filePath: string) {
  const configContents = await readFile(filePath, 'utf8');
  const ymlData: Record<string, GeneratorConfig> = yml.load(configContents);

  type TemplatesData = Record<
    string,
    Record<
      string,
      GeneratorConfig & {
        stackblitzUrl: string;
      }
    >
  >;

  const templatesData = Object.keys(ymlData).reduce<TemplatesData>((acc, next) => {
    const [dirName, templateName] = next.split('/');
    const groupName =
      dirName === 'cra' ? 'CRA' : dirName.slice(0, 1).toUpperCase() + dirName.slice(1);
    const generatorData = ymlData[next];
    acc[groupName] = acc[groupName] || {};
    acc[groupName][templateName] = {
      ...generatorData,
      stackblitzUrl: getStackblitzUrl(next),
    };
    return acc;
  }, {});
  return templatesData;
}
