describe.skip("skipped describe", () => {
  test("should skip tests inside", () => {
    throw "I should not be ran";
  });
});

describe.skip("async skipped describe", async () => {
  test("should skip tests inside", () => {
    throw "I should not be ran";
  });
});

describe("skipped tests", () => {
  test.skip("should not be ran", () => {
    throw "I should not be ran";
  });
});

test.skip("standalone skipped should not be ran", () => {
  throw "I should not be ran";
});

test.skip("async standalone skipped should not be ran", async () => {
  throw "I should not be ran";
});
