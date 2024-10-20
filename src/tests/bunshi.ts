import { defineTest } from '../define-test.ts';

export default defineTest({
  cloneCmd:
    'curl -L https://github.com/saasquatch/bunshi/archive/HEAD.tar.gz | tar zx --strip-components=1',
  installCmd: 'npm ci && npx playwright install',
  overrideCmd: (pkg: string) => `npm install ${pkg}`,
  testCmd: 'npm run build && npm run test:code && npm run test:browsers:chrome',
});
