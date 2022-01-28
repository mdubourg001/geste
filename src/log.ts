import chalk from "chalk";

import { ISummary, IBenchmarkResults } from "./types";
import { getFormattedDuration } from "./utils";

export const log = {
  error: function (error: string | Error) {
    if (typeof error === "string") {
      console.error(chalk.red(error));
    } else if (error.stack) {
      console.error(chalk.red(error.stack));
    } else {
      console.error(chalk.red(error.message));
    }
  },
  underline: function (message: string) {
    console.log(chalk.underline(chalk.gray(message)));
  },
  success: function (message: string) {
    console.log(chalk.green(" ✔ "), message);
  },
  fail: function (message: string) {
    console.log(chalk.red(" ✘ "), message);
  },
  updated: function (message: string) {
    console.log(chalk.blue(" u "), message);
  },
  written: function (message: string) {
    console.log(chalk.blue(" w "), message);
  },
  skip: function (message: string) {
    console.log(chalk.strikethrough(chalk.gray(" s ")), chalk.gray(message));
  },
  benchmark: function (message, { N, nsPerOp, benchtime }: IBenchmarkResults) {
    console.log(
      chalk.magenta(" b "),
      `${message}     ${N}     ${nsPerOp.toFixed(
        0
      )}ns/op     ${benchtime.toFixed(0)}ms`
    );
  },
};

export function summarize(summary: ISummary) {
  const colorPassed = summary.succeeded ? chalk.green : (s) => s;
  const colorFailed = summary.failed ? chalk.red : (s) => s;
  const colorBench = summary.benchmarksTotal ? chalk.magenta : (s) => s;

  const showBenchmarks = summary.benchmarksTotal > 0;

  const snapshots = global.__GESTE_SNAPSHOTS_SUMMARY;
  const showSnapshots =
    snapshots?.updated?.length || snapshots?.written?.length;

  console.log(
    `Total:        ${summary.total}
Duration:     ${getFormattedDuration(summary.duration)}
${colorPassed(`Passed:       ${summary.succeeded}`)}
${colorFailed(`Failed:       ${summary.failed}`)}
${
  showBenchmarks
    ? colorBench(
        `Benchmarks:   ${getFormattedDuration(summary.benchmarksDuration)}`
      )
    : ""
}
${
  showSnapshots
    ? chalk.blue(
        `Snapshots:    ${snapshots?.written?.length} written, ${snapshots?.updated?.length} updated\n`
      )
    : ""
}`
  );

  if (summary.failedList?.length) {
    summary.failedList.forEach(log.fail);
  }

  if (showSnapshots) {
    snapshots.written.forEach(log.written);
    snapshots.updated.forEach(log.updated);
  }

  if (summary.failedList?.length || showSnapshots) {
    console.log("\n");
  }
}
