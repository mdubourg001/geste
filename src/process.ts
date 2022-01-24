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
}: {
  testFiles: string[];
  bundledTestFiles: OutputFile[];
  setupFiles: string[];
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
    await compileSetupFiles(setupFiles);

    const withoutExt = getPathWithoutExt(testFile.path);
    const sourceFile = testFiles.find(
      (f) => getPathWithoutExt(f) === withoutExt
    );
    global.__GESTE_CURRENT_TESTFILE = sourceFile;

    const moduleSources = testFile.text;
    const module = new Module(testFile.path);

    try {
      // @ts-ignore
      module._compile(moduleSources, "");
    } catch (e) {
      throw new Error(
        `Error while compiling ${path.relative(PROJECT_ROOT, sourceFile)}:\n${
          e.stack
        };`
      );
    }

    // TODO: simplify
    const entries = Object.entries(global.__GESTE_TESTS) as Array<
      [
        string,
        {
          describes: IDescribe[];
          tests: ITest[];
          beforeAllCbs: ILifecycleHookCb[];
          afterAllCbs: ILifecycleHookCb[];
          beforeEachCbs: ILifecycleHookCb[];
          afterEachCbs: ILifecycleHookCb[];
        }
      ]
    >;

    for (const [testfile, suite] of entries) {
      const testfileRel = path.relative(PROJECT_ROOT, testfile);
      console.log(chalk.underline(chalk.gray(testfileRel)));

      for (const beforeAllCb of suite.beforeAllCbs ?? []) {
        await beforeAllCb();
      }

      const describes = suite.describes ?? [];
      for (const descObj of describes) {
        for (const testObj of descObj.tests) {
          if (descObj.skip || testObj.skip) {
            log.skip(`${descObj.desc}: ${testObj.desc}`);

            continue;
          }

          summary.total++;

          for (const beforeEachCb of suite.beforeEachCbs ?? []) {
            await beforeEachCb();
          }

          try {
            await testObj.cb();
            log.success(`${descObj.desc}: ${testObj.desc}`);

            summary.succeeded++;
          } catch (e) {
            process.exitCode = 1;
            summary.failed++;
            summary.failedList.push(
              `${descObj.desc}: ${testObj.desc} ${chalk.gray(testfileRel)}`
            );

            log.fail(`${descObj.desc}: ${testObj.desc}`);
            log.error(e);
          }

          for (const afterEachCb of suite.afterEachCbs ?? []) {
            await afterEachCb();
          }
        }
      }

      const tests = suite.tests ?? [];
      for (const testObj of tests) {
        if (testObj.skip) {
          log.skip(testObj.desc);

          continue;
        }

        summary.total++;

        for (const beforeEachCb of suite.beforeEachCbs ?? []) {
          await beforeEachCb();
        }

        try {
          await testObj.cb();
          log.success(testObj.desc);
          summary.succeeded++;
        } catch (e) {
          process.exitCode = 1;
          summary.failed++;
          summary.failedList.push(`${testObj.desc} ${chalk.gray(testfileRel)}`);

          log.fail(testObj.desc);
          log.error(e);
        }

        for (const afterEachCb of suite.afterEachCbs ?? []) {
          await afterEachCb();
        }
      }

      for (const afterAllCb of suite.afterAllCbs ?? []) {
        await afterAllCb();
      }

      global.__GESTE_TESTS = {};

      console.log("\n");
    }
  }

  summary.duration = performance.now() - start;

  return summary;
}
