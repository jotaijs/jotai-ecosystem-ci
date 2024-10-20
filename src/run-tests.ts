import { appendFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { exec } from 'node:child_process';

import type { TestCmds } from './define-test.ts';

const jotaiPkg = process.env.JOTAI_PKG || 'jotai@latest';
const filterRegex = process.env.FILTER_REGEXP || '';

const execAsync = (
  cmd: Parameters<typeof exec>[0],
  options: Omit<Parameters<typeof exec>[1], 'encoding'>,
) =>
  new Promise<string>((resolve, reject) => {
    exec(cmd, options, (err, stdout, stderr) => {
      if (err) {
        reject(stderr + stdout + err);
      } else {
        resolve(stderr + stdout);
      }
    });
  });

rmSync('./build', { recursive: true, force: true });

const results: Record<string, string> = {};

for (const file of readdirSync('./src/tests')) {
  if (file.endsWith('.ts')) {
    const name = file.replace(/\.ts$/, '');
    if (filterRegex && !new RegExp(filterRegex).test(name)) {
      continue;
    }
    const cmds: TestCmds = (await import(`./tests/${file}`)).default;
    const cwd = `./build/${name}`;
    const runCmd = async (cmd: string) => {
      console.log(`[${name}] Running: ${cmd}`);
      try {
        const output = await execAsync(cmd, { cwd });
        appendFileSync(`./build/${name}.log`, output);
      } catch (e) {
        appendFileSync(`./build/${name}.log`, `${e}`);
        throw e;
      }
    };
    mkdirSync(cwd, { recursive: true });
    try {
      await runCmd(cmds.cloneCmd);
      await runCmd(cmds.installCmd);
      await runCmd(cmds.overrideCmd(jotaiPkg));
      await runCmd(cmds.testCmd);
      results[name] = 'PASS';
    } catch (e) {
      results[name] = 'FAIL';
    }
    console.log(`[${name}] Done`);
  }
}

console.log('---- Jotai Ecosystem CI Results ----');
console.log(JSON.stringify(results, null, 2));
