import { defineTest } from '../define-test.ts';

export default defineTest({
  cloneCmd:
    'curl -L https://github.com/jotaijs/jotai-eager/archive/HEAD.tar.gz | tar zx --strip-components=1',
  installCmd: 'pnpm install',
  // pnpm workspace: jotai is pinned in both the library and the example app
  overrideCmd: (pkg: string) => [
    'pnpm',
    '--filter',
    'jotai-eager',
    '--filter',
    'react-example',
    'add',
    pkg,
  ],
  testCmd: 'pnpm test',
});
