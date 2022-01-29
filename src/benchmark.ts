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
