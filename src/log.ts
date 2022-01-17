import chalk from "chalk";

export const log = {
  error: function (error: string | Error) {
    if (typeof error === "string") {
      console.error(chalk.bgRed(" ✘ "), chalk.red(`- ${error}`));
    } else if (error.stack) {
      console.error(chalk.bgRed(" ✘ "), chalk.red(`- ${error.stack}`));
    } else {
      console.error(chalk.bgRed(" ✘ "), chalk.red(`- ${error.message}`));
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
