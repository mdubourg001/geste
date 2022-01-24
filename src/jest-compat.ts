import { mockFn, resetAllMocks } from "./mock";

export const jestCompat = {
  fn: mockFn,
  resetAllMocks: resetAllMocks,
};
