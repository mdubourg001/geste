import chalk from "chalk";
import path from "path";
import glob from "glob";
import { build } from "esbuild";
import Module from "module";
import { performance } from "perf_hooks";

import { PROJECT_ROOT } from "./constants";
import { IDescribe, ISummary, ITest } from "./types";
import { log } from "./log";

export function walkTestFiles(patterns: string[]) {
  return patterns.flatMap((pattern) =>
    glob.sync(pattern, {
      cwd: PROJECT_ROOT,
      absolute: true,
    })
  );
}

export async function compileTestFiles(testFiles: string[]) {
  const bundle = await build({
    entryPoints: testFiles,
    write: false,
    bundle: true,
    outbase: ".",
    outdir: ".",
    logLevel: "silent",
    platform: "node",
    format: "cjs",
    loader: { ".js": "jsx", ".ts": "tsx" },
  });

  for (const file of bundle.outputFiles) {
    global.__GESTE_CURRENT_TESTFILE = file.path;

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

export async function unrollTests(): Promise<ISummary> {
  const summary = {
    total: 0,
    succeeded: 0,
    failed: 0,
    failedList: [],
    duration: 0,
  };

  const entries = Object.entries(global.__GESTE_TESTS) as Array<
    [string, { describes: IDescribe[]; tests: ITest[] }]
  >;

  const start = performance.now();
  for (const [testfile, suite] of entries) {
    const testfileRel = path.relative(PROJECT_ROOT, testfile);
    console.log(chalk.underline(chalk.gray(testfileRel)));

    const describes = suite.describes ?? [];
    for (const descObj of describes) {
      for (const testObj of descObj.tests) {
        summary.total++;

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
      }
    }

    const tests = suite.tests ?? [];
    for (const testObj of tests) {
      summary.total++;

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
    }

    console.log("\n");
  }
  summary.duration = performance.now() - start;

  return summary;
}
