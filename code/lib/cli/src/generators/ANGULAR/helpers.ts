import fs from 'fs';
import prompts from 'prompts';
import dedent from 'ts-dedent';

export const ANGULAR_JSON_PATH = 'angular.json';

export const compoDocPreviewPrefix = dedent`
  import { setCompodocJson } from "@storybook/addon-docs/angular";
  import docJson from "../documentation.json";
  setCompodocJson(docJson);
`.trimStart();

export const promptForCompoDocs = async (): Promise<boolean> => {
  const { useCompoDoc } = await prompts({
    type: 'confirm',
    name: 'useCompoDoc',
    message: 'Do you want to use Compodoc for documentation?',
  });

  return useCompoDoc;
};

export class AngularJSON {
  json: {
    projects: Record<string, { root: string; projectType: string; architect: Record<string, any> }>;
  };

  constructor() {
    if (!fs.existsSync(ANGULAR_JSON_PATH)) {
      throw new Error(
        'An angular.json file was not found in the current working directory. Storybook needs it to work properly, so please rerun the command at the root of your project, where the angular.json file is located. More info: https://storybook.js.org/docs/angular/faq#error-no-angularjson-file-found'
      );
    }

    const jsonContent = fs.readFileSync(ANGULAR_JSON_PATH, 'utf8');
    this.json = JSON.parse(jsonContent);
  }

  get projects() {
    return this.json.projects;
  }

  get projectsWithoutStorybook() {
    return Object.keys(this.projects).filter((projectName) => {
      const { architect } = this.projects[projectName];

      return !architect.storybook;
    });
  }

  get hasStorybookBuilder() {
    return Object.keys(this.projects).some((projectName) => {
      const { architect } = this.projects[projectName];
      return Object.keys(architect).some((key) => {
        return architect[key].builder === '@storybook/angular:start-storybook';
      });
    });
  }

  get rootProject() {
    const rootProjectName = Object.keys(this.projects).find((projectName) => {
      const { root } = this.projects[projectName];
      return root === '' || root === '.';
    });

    return rootProjectName ? this.projects[rootProjectName] : null;
  }

  getProjectSettingsByName(projectName: string) {
    return this.projects[projectName];
  }

  async getProjectName() {
    if (this.projectsWithoutStorybook.length > 1) {
      const { projectName } = await prompts({
        type: 'select',
        name: 'projectName',
        message: 'For which project do you want to generate Storybook configuration?',
        choices: this.projectsWithoutStorybook.map((name) => ({
          title: name,
          value: name,
        })),
      });

      return projectName;
    }

    return this.projectsWithoutStorybook[0];
  }

  addStorybookEntries({
    angularProjectName,
    storybookFolder,
    useCompodoc,
    root,
  }: {
    angularProjectName: string;
    storybookFolder: string;
    useCompodoc: boolean;
    root: string;
  }) {
    // add an entry to the angular.json file to setup the storybook builders
    const { architect } = this.projects[angularProjectName];

    const baseOptions = {
      configDir: storybookFolder,
      browserTarget: `${angularProjectName}:build`,
      compodoc: useCompodoc,
      ...(useCompodoc && { compodocArgs: ['-e', 'json', '-d', root || '.'] }),
    };

    if (!architect.storybook) {
      architect.storybook = {
        builder: '@storybook/angular:start-storybook',
        options: {
          ...baseOptions,
          port: 6006,
        },
      };
    }

    if (!architect['build-storybook']) {
      architect['build-storybook'] = {
        builder: '@storybook/angular:build-storybook',
        options: {
          ...baseOptions,
          outputDir:
            Object.keys(this.projects).length === 1
              ? `storybook-static`
              : `dist/storybook/${angularProjectName}`,
        },
      };
    }
  }

  write() {
    fs.writeFileSync(ANGULAR_JSON_PATH, JSON.stringify(this.json, null, 2));
  }
}
