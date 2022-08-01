#!/usr/bin/env node

const { writeFile } = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');
const { default: dedent } = require('ts-dedent');
const { readFile } = require('fs-extra');
const yml = require('js-yaml');

const logger = console;

async function getTemplatesData(filePath) {
  const configContents = await readFile(filePath, 'utf8');
  return yml.load(configContents);
}

const run = async () => {
  logger.log('Generating templates list...');
  const templatesData = await getTemplatesData(
    path.resolve(__dirname, '../../../../scripts/next-repro-generators/repro-config.yml')
  );
  const destination = path.join(__dirname, '..', 'src', 'repro-templates.ts');

  await writeFile(
    destination,
    dedent`
      // This file was auto generated from generate-repro-templates-list.js, please do not edit!
      export default ${JSON.stringify(templatesData, null, 2)}
    `
  );

  exec(`yarn lint:js:cmd --fix ${destination}`, {
    cwd: path.join(__dirname, '..', '..', '..'),
  });

  logger.log('Done! generated ', destination);
};

run().catch((e) => {
  logger.error(e);
  process.exit(1);
});
