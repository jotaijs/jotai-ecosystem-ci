export type TestCmds = {
  cloneCmd: string;
  installCmd: string;
  overrideCmd: (pkg: string) => string;
  testCmd: string;
};

export const defineTest = (testCmds: TestCmds) => testCmds;
