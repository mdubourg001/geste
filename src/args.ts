export function parseCmdlineArgs(argv: string[]) {
  const parsed = { options: {}, testPatterns: [] };
  const optionals = argv.slice(2);

  for (const token of optionals) {
    if (token.startsWith("--")) {
      const asParam = new URLSearchParams(token);

      for (const key of asParam.keys()) {
        parsed.options[key] = asParam.get(key) || true;
      }
    } else {
      parsed.testPatterns.push(token);
    }
  }

  return parsed;
}
