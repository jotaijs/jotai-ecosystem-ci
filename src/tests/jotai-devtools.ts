import { defineTest } from '../define-test.ts';

export default defineTest({
  cloneCmd:
    'curl -L https://github.com/jotaijs/jotai-devtools/archive/refs/heads/feat/add-jotai-v3-support.tar.gz | tar zx --strip-components=1',
  installCmd: 'pnpm install',
  overrideCmd: (pkg: string) => ['pnpm', 'add', pkg],
  testCmd: 'pnpm test',
});
