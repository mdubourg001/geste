import chalk from "chalk";
import path from "path";
import glob from "glob";
import Module from "module";
import { performance } from "perf_hooks";

import { PROJECT_ROOT, CWD } from "./constants";
import { IDescribe, ISummary, ITest, ILifecycleHookCb } from "./types";
import { log } from "./log";
import { bundleForNode } from "./bundle";
import { getFormattedDuration, getPathWithoutExt } from "./utils";

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

export async function compileTestFiles(testFiles: string[]) {
  process.stdout.write(" →  Compiling test files...");
  const start = performance.now();

  const bundle = await bundleForNode({ files: testFiles });

  for (const file of bundle.outputFiles) {
    const withoutExt = getPathWithoutExt(file.path);
    const sourceFile = testFiles.find(
      (f) => getPathWithoutExt(f) === withoutExt
    );
    global.__GESTE_CURRENT_TESTFILE = sourceFile;

    const moduleSources = file.text;
    const module = new Module(file.path);

    try {
      // @ts-ignore
      module._compile(moduleSources, "");
    } catch (e) {
      // TODO: throw
      console.error(e.stack);
    }
  }

  const duration = getFormattedDuration(performance.now() - start);
  process.stdout.write(`\r →  Compiled test files. ${chalk.gray(duration)}\n`);
}

export async function compileSetupFiles(setupFiles: string[]) {
  const bundle = await bundleForNode({ files: setupFiles, memoize: true });

  for (const file of bundle.outputFiles) {
    const moduleSources = file.text;
    const module = new Module(file.path);

    try {
      // @ts-ignore
      module._compile(moduleSources, "");
    } catch (e) {
      // TODO: throw
      console.error(e.stack);
    }
  }
}

export async function unrollTests(setupFiles: string[]): Promise<ISummary> {
  process.stdout.write(" →  Running tests...\n\n");

  const summary = {
    total: 0,
    succeeded: 0,
    failed: 0,
    failedList: [],
    duration: 0,
  };

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

  const start = performance.now();
  for (const [testfile, suite] of entries) {
    await compileSetupFiles(setupFiles);

    for (const beforeAllCb of suite.beforeAllCbs ?? []) {
      await beforeAllCb();
    }

    const testfileRel = path.relative(PROJECT_ROOT, testfile);
    console.log(chalk.underline(chalk.gray(testfileRel)));

    const describes = suite.describes ?? [];
    for (const descObj of describes) {
      for (const testObj of descObj.tests) {
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

    console.log("\n");
  }
  summary.duration = performance.now() - start;

  return summary;
}
