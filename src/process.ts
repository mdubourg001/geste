import chalk from "chalk";
import path from "path";
import glob from "glob";
import Module from "module";
import { performance } from "perf_hooks";

import { PROJECT_ROOT } from "./constants";
import { IDescribe, ISummary, ITest, ILifecycleHookCb } from "./types";
import { log } from "./log";
import { bundleForNode } from "./bundle";
import { getFormattedDuration, getPathWithoutExt } from "./utils";
import { OutputFile } from "esbuild";

export function walkTestFiles({
  testPatterns,
  ignorePatterns,
  cwd,
}: {
  testPatterns: string[];
  ignorePatterns: string[];
  cwd: string;
}): string[] {
  process.stdout.write("\n →  Identifying test files to run...");
  const start = performance.now();

  const files = testPatterns.flatMap((pattern) => {
    return glob.sync(pattern, {
      cwd,
      nodir: true,
      absolute: true,
      ignore: ignorePatterns,
    });
  });

  const duration = getFormattedDuration(performance.now() - start);
  process.stdout.write(
    `\r →  Identified test files to run. ${chalk.gray(duration)}\n`
  );

  return files;
}

export async function bundleTestFiles(testFiles: string[]) {
  process.stdout.write(" →  Compiling test files...");
  const start = performance.now();

  const bundle = await bundleForNode({ files: testFiles });

  const duration = getFormattedDuration(performance.now() - start);
  process.stdout.write(`\r →  Compiled test files. ${chalk.gray(duration)}\n`);

  return bundle.outputFiles;
}

export async function compileSetupFiles(setupFiles: string[]) {
  const bundle = await bundleForNode({
    files: setupFiles,
    memoize: true,
  });

  for (const file of bundle.outputFiles) {
    // hack to monkey patch https://github.com/evanw/esbuild/issues/1311
    const moduleSources = file.text;
    const module = new Module(file.path);

    try {
      // @ts-ignore
      module._compile(moduleSources, "");
    } catch (e) {
      throw new Error(
        `Error while compiling ${path.relative(PROJECT_ROOT, file.path)}:\n${
          e.stack
        };`
      );
    }
  }
}

export async function unrollTests({
  testFiles,
  bundledTestFiles,
  setupFiles,
  throwOnCompilationError,
}: {
  testFiles: string[];
  bundledTestFiles: OutputFile[];
  setupFiles: string[];
  throwOnCompilationError: boolean;
}): Promise<ISummary> {
  process.stdout.write(" →  Running tests...\n\n");

  const summary = {
    total: 0,
    succeeded: 0,
    failed: 0,
    failedList: [],
    duration: 0,
  };

  const start = performance.now();
  for (const testFile of bundledTestFiles) {
    const withoutExt = getPathWithoutExt(testFile.path);
    const sourceFile = testFiles.find(
      (f) => getPathWithoutExt(f) === withoutExt
    );
    const sourceFileRel = path.relative(PROJECT_ROOT, sourceFile);
    global.__GESTE_CURRENT_TESTFILE = sourceFile;

    console.log(chalk.underline(chalk.gray(sourceFileRel)));
    await compileSetupFiles(setupFiles);

    const moduleSources = testFile.text;
    const module = new Module(testFile.path);

    try {
      // @ts-ignore
      module._compile(moduleSources, "");
    } catch (e) {
      global.__GESTE_BAIL_COUNT++;

      const formattedError = `Error while compiling ${sourceFileRel}:\n${e.stack};`;

      if (throwOnCompilationError) {
        throw new Error(formattedError);
      } else {
        process.exitCode = 1;
        summary.total++;
        summary.failed++;
        summary.failedList.push(sourceFileRel);

        log.error(formattedError);
        continue;
      }
    }

    const suite = global.__GESTE_TESTS as {
      describes: IDescribe[];
      tests: ITest[];
      beforeAllCbs: ILifecycleHookCb[];
      afterAllCbs: ILifecycleHookCb[];
      beforeEachCbs: ILifecycleHookCb[];
      afterEachCbs: ILifecycleHookCb[];
    };

    for (const beforeAllCb of suite.beforeAllCbs ?? []) {
      try {
        await beforeAllCb();
      } catch (e) {
        process.exitCode = 1;
        summary.total++;
        summary.failed++;
        summary.failedList.push(sourceFileRel);

        log.error(e);
        continue;
      }
    }

    const describes = suite.describes ?? [];
    for (const descObj of describes) {
      for (const testObj of descObj.tests) {
        if (descObj.skip || testObj.skip) {
          log.skip(`${descObj.desc}: ${testObj.desc}`);

          continue;
        }

        global.__GESTE_CURRENT_TESTNAME = `${descObj.desc}: ${testObj.desc}`;
        summary.total++;

        try {
          for (const beforeEachCb of suite.beforeEachCbs ?? []) {
            await beforeEachCb();
          }

          await testObj.cb();

          for (const afterEachCb of suite.afterEachCbs ?? []) {
            await afterEachCb();
          }

          log.success(global.__GESTE_CURRENT_TESTNAME);
          summary.succeeded++;
        } catch (e) {
          process.exitCode = 1;
          summary.failed++;
          summary.failedList.push(
            `${global.__GESTE_CURRENT_TESTNAME} ${chalk.gray(sourceFileRel)}`
          );

          log.fail(global.__GESTE_CURRENT_TESTNAME);
          log.error(e);
        }
      }
    }

    const tests = suite.tests ?? [];
    for (const testObj of tests) {
      if (testObj.skip) {
        log.skip(testObj.desc);

        continue;
      }

      global.__GESTE_CURRENT_TESTNAME = testObj.desc;
      summary.total++;

      try {
        for (const beforeEachCb of suite.beforeEachCbs ?? []) {
          await beforeEachCb();
        }

        await testObj.cb();

        for (const afterEachCb of suite.afterEachCbs ?? []) {
          await afterEachCb();
        }

        log.success(global.__GESTE_CURRENT_TESTNAME);
        global.__GESTE_FS_SNAPSHOTS_COUNT_FOR_TESTNAME = 0;
        summary.succeeded++;
      } catch (e) {
        process.exitCode = 1;
        summary.failed++;
        summary.failedList.push(
          `${global.__GESTE_CURRENT_TESTNAME} ${chalk.gray(sourceFileRel)}`
        );

        log.fail(global.__GESTE_CURRENT_TESTNAME);
        log.error(e);
      }
    }

    for (const afterAllCb of suite.afterAllCbs ?? []) {
      try {
        await afterAllCb();
      } catch (e) {
        process.exitCode = 1;
        summary.total++;
        summary.failed++;
        summary.failedList.push(sourceFileRel);

        log.error(e);
      }
    }

    global.__GESTE_TESTS = {};

    console.log("\n");
  }

  summary.duration = performance.now() - start;

  return summary;
}
