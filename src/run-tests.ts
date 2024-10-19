import { mkdirSync, rmSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

import type { TestCmds } from './define-test.ts';

const jotaiPkg = process.env.JOTAI_PKG || 'jotai';

rmSync('./build', { recursive: true, force: true });
mkdirSync('./build');

for (const name of readdirSync('./src/tests')) {
  if (name.endsWith('.ts')) {
    const cmds: TestCmds = (await import(`./tests/${name}`)).default;
    const cwd = `./build/${name.replace(/\.ts$/, '')}`;
    mkdirSync(cwd);
    execSync(cmds.cloneCmd, { cwd, encoding: 'utf8' });
    execSync(cmds.installCmd, { cwd, encoding: 'utf8' });
    execSync(cmds.overrideCmd(jotaiPkg), { cwd, encoding: 'utf8' });
    execSync(cmds.testCmd, { cwd, encoding: 'utf8' });
    console.log(`Done: ${name}`);
  }
}
