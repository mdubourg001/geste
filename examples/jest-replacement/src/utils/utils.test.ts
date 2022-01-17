import { isPair } from "./utils";

test("isPair should work", async () => {
  expect(isPair(2)).toBe(true);
  expect(isPair(3)).toBe(true);
});

describe("JSON module", async () => {
  test("JSON.parse should work", async () => {
    const parsed = await Promise.resolve(JSON.parse("2"));

    expect(parsed).toBe(2);
  });
});
