import chalk from "chalk";

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
};
