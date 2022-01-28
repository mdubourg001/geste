import { getConfig } from "./config";
import { log, summarize } from "./log";
import {
  walkTestFiles,
  unrollTests,
  bundleTestFiles,
  unrollBenchmarks,
} from "./process";
import { parseCmdlineArgs } from "./args";
import { CWD, PROJECT_ROOT } from "./constants";
import { expect } from "./expect";
import { jestCompat } from "./jest-compat";
import { benchmark } from "./benchmark";
import {
  describe,
  test,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "./test";

global.__GESTE_CURRENT_TESTFILE = undefined;
global.__GESTE_CURRENT_TESTNAME = undefined;
global.__GESTE_IN_DESCRIBE = false;
global.__GESTE_TESTS = {};
global.__GESTE_BENCHMARKS = {};
global.__GESTE_MOCKS = [];
global.__GESTE_SNAPSHOTS_SUMMARY = {
  written: [],
  updated: [],
};

global.jest = jestCompat;
global.describe = describe;
global.test = test;
global.it = test;
global.benchmark = benchmark;
global.expect = expect;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

// TODO: Multilple snapshots in same testfile / unit test
// TODO: test.each "table way"
// TODO: test's callback `done` https://jestjs.io/docs/asynchronous#callbacks
// TODO: spyOn
// TODO: config.globals
// TODO: fix global typings
// TODO: handle test's `timeout` (third argument of jest's test)
async function main() {
  const parsedArgv = parseCmdlineArgs();
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

  const testsSummary = await unrollTests({
    testFiles,
    bundledTestFiles,
    setupFiles: config.setupFiles,
    throwOnCompilationError: config.throwOnCompilationErrors,
    compileOnly: !!parsedArgv.options["--only-bench"],
  });

  let benchSummary = {};
  if (parsedArgv.options["--bench"] || parsedArgv.options["--only-bench"]) {
    benchSummary = await unrollBenchmarks();
  }

  summarize({ ...testsSummary, ...benchSummary });
}

main().catch((error) => {
  log.error(error);

  process.exitCode = 1;
});
