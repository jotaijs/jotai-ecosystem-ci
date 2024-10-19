import { mkdirSync, rmSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

import type { TestCmds } from './define-test.ts';

const jotaiPkg = process.env.JOTAI_PKG || 'jotai@latest';

rmSync('./build', { recursive: true, force: true });
mkdirSync('./build');

const runCmd = (name: string, cmd: string, cwd: string) => {
  console.log(`[${name}] Running: ${cmd}`);
  execSync(cmd, { cwd, encoding: 'utf8' });
};

for (const file of readdirSync('./src/tests')) {
  if (file.endsWith('.ts')) {
    const name = file.replace(/\.ts$/, '');
    const cmds: TestCmds = (await import(`./tests/${file}`)).default;
    const cwd = `./build/${name}`;
    mkdirSync(cwd);
    runCmd(name, cmds.cloneCmd, cwd);
    runCmd(name, cmds.installCmd, cwd);
    runCmd(name, cmds.overrideCmd(jotaiPkg), cwd);
    runCmd(name, cmds.testCmd, cwd);
    console.log(`Done: ${name}`);
  }
}
