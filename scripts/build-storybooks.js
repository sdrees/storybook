#!/usr/bin/env node

const { spawn } = require('child_process');
const { promisify } = require('util');
const {
  readdir: readdirRaw,
  readFile: readFileRaw,
  writeFile: writeFileRaw,
  statSync,
  readFileSync,
} = require('fs');
const { join } = require('path');

const readdir = promisify(readdirRaw);
const writeFile = promisify(writeFileRaw);

const p = l => join(__dirname, '..', ...l);
const logger = console;

const exec = async (command, args = [], options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, stdio: 'inherit', shell: true });

    child
      .on('close', code => {
        if (code) {
          reject();
        } else {
          resolve();
        }
      })
      .on('error', e => {
        logger.error(e);
        reject();
      });
  });

const getDeployables = files => {
  return files.filter(f => {
    const packageJsonLocation = p(['examples', f, 'package.json']);
    let stats = null;
    try {
      stats = statSync(packageJsonLocation);
    } catch (e) {
      // the folder had no package.json, we'll ignore
    }
    return stats && stats.isFile() && hasBuildScript(packageJsonLocation);
  });
};

const hasBuildScript = l => {
  const text = readFileSync(l, 'utf8');
  const json = JSON.parse(text);

  return !!json.scripts['build-storybook'];
};

const createContent = deployables => {
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
      ${deployables.map(i => `<option value="/${i}/">${i}</option>`).join('\n')}
    </select>

    <iframe id="frame" src="/${deployables[0]}/" />
  `;
};

const handleExamples = async deployables => {
  await deployables.reduce(async (acc, d) => {
    await acc;

    logger.log('');
    logger.log(
      `-----------------${Array(d.length)
        .fill('-')
        .join('')}`
    );
    logger.log(`▶️  building: ${d}`);
    logger.log(
      `-----------------${Array(d.length)
        .fill('-')
        .join('')}`
    );
    const out = p(['built-storybooks', d]);
    const cwd = p(['examples', d]);

    await exec(`yarn`, [`build-storybook`, `--output-dir=${out}`, '--quiet'], { cwd });

    logger.log('-------');
    logger.log(`✅ ${d} built`);
    logger.log('-------');
  }, Promise.resolve());
};

const run = async () => {
  const examples = await readdir(p(['examples']));

  const { length } = examples;
  const [a, b] = [process.env.CIRCLE_NODE_INDEX || 0, process.env.CIRCLE_NODE_TOTAL || 1];
  const step = Math.ceil(length / b);
  const offset = step * a;

  const list = examples.slice().splice(offset, step);
  const deployables = getDeployables(list);

  if (deployables.length) {
    logger.log(`will build: ${deployables.join(', ')}`);
    await handleExamples(deployables);
  }

  if (
    deployables.length &&
    (process.env.CIRCLE_NODE_INDEX === undefined ||
      process.env.CIRCLE_NODE_INDEX === '0' ||
      process.env.CIRCLE_NODE_INDEX === 0)
  ) {
    const indexLocation = p(['built-storybooks', 'index.html']);
    logger.log('');
    logger.log(`📑 creating index at: ${indexLocation}`);
    logger.log('');
    await writeFile(indexLocation, createContent(deployables));

    logger.log('-------');
    logger.log('✅ done');
    logger.log('-------');
  }
};

run().catch(e => {
  logger.error(e);
  process.exit(1);
});
