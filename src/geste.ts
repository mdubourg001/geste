import expect from "expect";

import { getConfig } from "./config";
import { log, summarize } from "./log";
import { walkTestFiles, unrollTests, bundleTestFiles } from "./process";
import { parseCmdlineArgs } from "./args";
import { CWD, PROJECT_ROOT } from "./constants";
import {
  describe,
  test,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "./test";

global.__GESTE_CURRENT_TESTFILE;
global.__GESTE_IN_DESCRIBE = false;
global.__GESTE_TESTS = {};

global.describe = describe;
global.test = test;
global.it = test;
global.expect = expect;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

// TODO: mock
async function main() {
  const parsedArgv = parseCmdlineArgs(process.argv);
  const config = await getConfig();

  const testFiles = walkTestFiles({
    ignorePatterns: config.ignorePatterns,
    testPatterns: parsedArgv.testPatterns.length
      ? parsedArgv.testPatterns
      : config.testPatterns,
    // if testPatterns are given from command line, searching these patterns from cwd
    cwd: parsedArgv.testPatterns.length ? CWD : PROJECT_ROOT,
  });

  const bundledTestFiles = await bundleTestFiles(testFiles);
  const summary = await unrollTests({
    testFiles,
    bundledTestFiles,
    setupFiles: config.setupFiles,
  });

  summarize(summary);
}

main().catch((error) => {
  log.error(error);

  process.exitCode = 1;
});
