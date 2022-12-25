import { EOL } from 'os';

export const cleanLog = (str: string) =>
  str
    // remove chalk ANSI colors
    // eslint-disable-next-line no-control-regex
    .replace(/\u001b\[.*?m/g, '')
    // fix boxen output
    .replace(/╮│/g, '╮\n│')
    .replace(/││/g, '│\n│')
    .replace(/│╰/g, '│\n╰')
    .replace(/⚠️ {2}failed to check/g, `${EOL}⚠️  failed to check`);
