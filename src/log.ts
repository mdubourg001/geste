import chalk from "chalk";

import { ISummary } from "./types";

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
};

export function summarize(summary: ISummary) {
  console.log(`Total:     ${summary.total}
Duration:  ${(summary.duration / 1000).toFixed(2)}s
${chalk.green(`Passed:    ${summary.succeeded}`)}
${chalk.red(`Failed:    ${summary.failed}`)}`);

  if (summary.failedList.length) {
    summary.failedList.forEach(log.fail);
    console.log("\n");
  }
}
