import { defineTest } from '../define-test.ts';

export default defineTest({
  cloneCmd:
    'curl -L https://github.com/jotaijs/jotai-family/archive/HEAD.tar.gz | tar zx --strip-components=1',
  installCmd: 'pnpm install',
  overrideCmd: (pkg: string) => `pnpm add ${pkg}`,
  testCmd: 'pnpm test',
});
