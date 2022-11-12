import type { ExecOptions } from 'shelljs';
import shell from 'shelljs';

export const exec = async (command: string, options: ExecOptions = {}) =>
  new Promise((resolve, reject) => {
    shell.exec(command, options, (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`command exited with code: ${code}`));
      }
    });
  });
