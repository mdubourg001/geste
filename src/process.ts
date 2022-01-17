import glob from "glob";
import { build } from "esbuild";
import Module from "module";

import { PROJECT_ROOT } from "./constants";
import { IDescribe, ITest } from "./types";

export function walkTestFiles() {
  return glob.sync("./**/*.test.{js,jsx,ts,tsx}", {
    cwd: PROJECT_ROOT,
    absolute: true,
  });
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

export async function unrollTests() {
  const entries = Object.entries(global.__GESTE_TESTS) as Array<
    [string, { describes: IDescribe[]; tests: ITest[] }]
  >;

  for (const [testfile, suite] of entries) {
    console.log(testfile);

    const describes = suite.describes ?? [];
    for (const descObj of describes) {
      console.log(descObj.desc);

      for (const testObj of descObj.tests) {
        console.log(testObj.desc);
        await testObj.cb();
      }
    }

    const tests = suite.tests ?? [];
    for (const testObj of tests) {
      console.log(testObj.desc);
      await testObj.cb();
    }
  }
}
