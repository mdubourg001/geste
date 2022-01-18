import expect from "expect";

import { getConfig } from "./config";
import { log, summarize } from "./log";
import { walkTestFiles, compileTestFiles, unrollTests } from "./process";
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

// TODO: test.each
// TODO: using tsconfig.json if present
// TODO: mock
async function main() {
  const config = await getConfig();
  const testFiles = walkTestFiles(config.testPatterns);

  await compileTestFiles(testFiles);
  const summary = await unrollTests(config.setupFiles);

  summarize(summary);
}

main().catch((error) => {
  log.error(error);

  process.exitCode = 1;
});
