import expect from "expect";

import { toMatchSnapshot } from "./snapshots";

expect.extend({
  toMatchSnapshot,
});

export { default as expect } from "expect";
