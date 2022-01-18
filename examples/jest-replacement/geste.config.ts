import path from "path";

export default {
  testPatterns: ["./**/*.test.{ts,tsx}"],
  setupFiles: [path.resolve(__dirname, "./setupTests.ts")],
  ignoreRegexps: ["ignored.test.ts"],
};
