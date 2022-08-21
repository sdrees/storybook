import { createOptions, getOptionsOrPrompt } from './utils/options';
import { filterTemplates } from './once-per-template';
import type { Templates } from './once-per-template';
import TEMPLATES from '../code/lib/cli/src/repro-templates';
import { outputFile } from 'fs-extra';

export const options = createOptions({
  output: {
    type: 'string',
    description: 'Where to put the index.html file?',
    required: true,
  },
  cadence: {
    type: 'string',
    description: 'What cadence are we running on (i.e. which templates should we use)?',
    values: ['ci', 'daily', 'weekly'] as const,
    required: true,
  },
});

function toPath(key: keyof Templates) {
  return key.replace('/', '-');
}

const createContent = (templates: Templates) => {
  return `
    <style>
      body {
        background: black;
        color: white;
      }
      #frame {
        position: absolute;
        left: 0;
        right: 0;
        width: 100vw;
        height: calc(100vh - 30px);
        bottom: 0;
        top: 30px;
        border: 0 none;
        margin: 0;
        padding: 0;
      }
      #select {
        position: absolute;
        top: 0;
        right: 100px;
        left: 10px;
        height: 30px;
        width: calc(100vw - 120px);
        background: black;
        color: white;
        border: 0 none;
        border-radius: 0;
        padding: 10px;
        box-sizing: border-box;
      }
      #open {
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 30px;
        background: black;
        color: white;
        border: 0 none;
        border-radius: 0;
        padding: 10px;
        box-sizing: border-box;
      }
    </style>

    <script>
      function handleClick() {
        var value = document.getElementById("select").value;
        window.location = document.location.origin + value;
      }
      function handleSelect() {
        var value = document.getElementById("select").value;
        var frame = document.getElementById("frame");

        sessionStorage.clear();
        localStorage.clear();

        frame.setAttribute('src', value);
      }
    </script>

    <button id="open" onclick="handleClick()">open</button>

    <select id="select" onchange="handleSelect()">
      ${Object.entries(templates)
        .map(([key, { name }]) => `<option value="/${toPath(key)}/">${name}</option>`)
        .join('\n')}
    </select>

    <iframe id="frame" src="/${toPath(Object.keys(templates)[0])}/" />
  `;
};

async function run() {
  const { cadence, output: outputPath } = await getOptionsOrPrompt(
    'yarn create-built-sandboxes-index',
    options
  );

  const templates = filterTemplates(TEMPLATES, cadence, 'build-storybook');
  const content = createContent(templates);

  await outputFile(outputPath, content);
}

if (require.main === module) {
  run().catch((err) => {
    console.error('Creating built sandboxes index failed');
    console.error(err);
    process.exit(1);
  });
}
