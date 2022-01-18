import expect from "expect";

import { getConfig } from "./config";
import { log, summarize } from "./log";
import { describe, test } from "./test";
import { walkTestFiles, compileTestFiles, unrollTests } from "./process";

global.__GESTE_CURRENT_TESTFILE;
global.__GESTE_IN_DESCRIBE = false;
global.__GESTE_TESTS = {};

global.describe = describe;
global.test = test;
global.expect = expect;

// TODO: setupFiles in config
// TODO: beforeEach, beforeAll, afterEach, afterAll
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
