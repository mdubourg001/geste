import { IParsedArgv } from "./types";

let PARSED_ARGV: IParsedArgv | undefined;

export function parseCmdlineArgs(argv: string[] = process.argv): IParsedArgv {
  if (PARSED_ARGV) {
    return PARSED_ARGV;
  }

  PARSED_ARGV = { options: {}, testPatterns: [] };
  const optionals = argv.slice(2);

  for (const token of optionals) {
    if (token.startsWith("--")) {
      const asParam = new URLSearchParams(token);

      for (const key of asParam.keys()) {
        PARSED_ARGV.options[key] = asParam.get(key) || true;
      }
    } else {
      PARSED_ARGV.testPatterns.push(token);
    }
  }

  return PARSED_ARGV;
}
