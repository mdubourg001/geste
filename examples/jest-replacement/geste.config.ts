import path from "path";

export default {
  testPatterns: ["./**/*.test.{ts,tsx}"],
  setupFiles: [path.resolve(__dirname, "./setupTests.ts")],
  ignorePatterns: ["**/ignored.test.ts", "./node_modules/**/*"],
};
