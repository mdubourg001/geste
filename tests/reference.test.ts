const foo = "foo";

describe("reference to foo", () => {
  test("should be kept inside of describe and test", () => {
    expect(foo).toBe("foo");
  });
});

test("reference to foo should be kept inside standalone test", () => {
  expect(foo).toBe("foo");
});
