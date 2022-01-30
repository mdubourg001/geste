import util from "util";

import { IBenchmark, BenchmarkTools } from "./types";

function registerBenchmark(benchmarkObj: IBenchmark) {
  const currentTestfile = global.__GESTE_CURRENT_TESTFILE;

  if (global.__GESTE_BENCHMARKS[currentTestfile]) {
    global.__GESTE_BENCHMARKS[currentTestfile].push(benchmarkObj);
  } else {
    global.__GESTE_BENCHMARKS[currentTestfile] = [benchmarkObj];
  }
}

export function benchmark(
  desc: string,
  cb: (b: BenchmarkTools) => any | Promise<any>
) {
  const benchmarkObj: IBenchmark = { desc, cb };

  registerBenchmark(benchmarkObj);
}

benchmark.skip = function (
  desc: string,
  cb: (b: BenchmarkTools) => any | Promise<any>
) {
  const benchmarkObj: IBenchmark = { desc, cb, skip: true };

  registerBenchmark(benchmarkObj);
};

benchmark.each = function (cases: any[]) {
  return async (
    desc: string,
    cb: (b: BenchmarkTools, ...args: any[]) => any | Promise<any>
  ) => {
    for (const eachCase of cases) {
      const formattedDesc = util.format(desc, ...eachCase);

      benchmark(formattedDesc, (b) => cb(b, ...eachCase));
    }
  };
};
