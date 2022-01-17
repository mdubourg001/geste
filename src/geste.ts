import expect from "expect";

import { getConfig } from "./config";
import { log } from "./log";
import { describe, test } from "./test";
import { walkTestFiles, compileTestFiles, unrollTests } from "./process";

global.__GESTE_CURRENT_TESTFILE;
global.__GESTE_IN_DESCRIBE = false;
global.__GESTE_TESTS = {};

global.describe = describe;
global.test = test;
global.expect = expect;

async function main() {
  const config = await getConfig();
  const testFiles = walkTestFiles();

  await compileTestFiles(testFiles);
  const duration = await unrollTests();

  console.log(`Done in ${(duration / 1000).toFixed(2)}s`);
}

main().catch((error) => {
  log.error(error);

  process.exitCode = 1;
});
