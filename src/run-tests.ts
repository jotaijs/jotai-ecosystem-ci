import { appendFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { exec, execFile } from 'node:child_process';

import type { TestCmds } from './define-test.ts';

const jotaiPkg = process.env.JOTAI_PKG || 'jotai@latest';
const filterRegex = new RegExp(process.env.FILTER_REGEXP || '');
const timeout = parseInt(process.env.EXEC_TIMEOUT || '') || 10 * 60 * 1000; // 10 minutes
const maxBuffer = 64 * 1024 * 1024; // exec's 1 MiB default is too small for chatty test suites
const verbose = !!process.env.VERBOSE;

// A string cmd runs in a shell; a [file, ...args] tuple runs without one.
const execAsync = (
  cmd: string | readonly [string, ...string[]],
  options: { cwd: string; timeout: number; maxBuffer: number },
) =>
  new Promise<string>((resolve, reject) => {
    const callback = (err: Error | null, stdout: string, stderr: string) =>
      err ? reject(stderr + stdout + err) : resolve(stderr + stdout);
    if (typeof cmd === 'string') {
      exec(cmd, options, callback);
    } else {
      execFile(cmd[0], cmd.slice(1), options, callback);
    }
  });

rmSync('./build', { recursive: true, force: true });

const results: Record<string, 'PASS' | 'FAIL'> = {};

for (const file of readdirSync('./src/tests')) {
  if (!file.endsWith('.ts')) {
    continue;
  }
  const name = file.replace(/\.ts$/, '');
  if (!filterRegex.test(name)) {
    continue;
  }
  const cmds: TestCmds = (await import(`./tests/${file}`)).default;
  const cwd = `./build/${name}`;
  const runCmd = async (cmd: string | readonly [string, ...string[]]) => {
    const display = typeof cmd === 'string' ? cmd : cmd.join(' ');
    console.log(`[${name}] Running: ${display}`);
    try {
      const output = await execAsync(cmd, { cwd, timeout, maxBuffer });
      if (verbose) {
        console.log(output);
      }
      appendFileSync(`./build/${name}.log`, output);
    } catch (e) {
      if (verbose) {
        console.error(e);
      }
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
  } catch {
    results[name] = 'FAIL';
  }
  console.log(`[${name}] Done`);
  rmSync(cwd, { recursive: true });
}

console.log('---- Jotai Ecosystem CI Results ----');
console.log(JSON.stringify(results, null, 2));
