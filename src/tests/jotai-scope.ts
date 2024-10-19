import { defineTest } from '../define-test.ts';

export default defineTest({
  // cloneCmd: 'git clone --depth 1 https://github.com/jotaijs/jotai-scope.git .',
  cloneCmd:
    'curl -L https://github.com/jotaijs/jotai-scope/archive/HEAD.tar.gz | tar zx --strip-components=1',
  installCmd: 'pnpm install',
  overrideCmd: (pkg: string) => `pnpm add ${pkg}`,
  testCmd: 'pnpm test',
});
