global.BEFORE_ALL_CALLS = 0;
global.BEFORE_EACH_CALLS = 0;
global.AFTER_EACH_CALLS = 0;

beforeAll(async () => {
  global.BEFORE_ALL_CALLS++;
});

beforeEach(() => {
  global.BEFORE_EACH_CALLS++;
});

afterEach(() => {
  global.AFTER_EACH_CALLS++;
});

describe("geste lifecycle hooks", () => {
  it("beforeAll should work", () => {
    expect(global.BEFORE_ALL_CALLS).toBe(1);
  });

  test("beforeEach should work", () => {
    expect(global.BEFORE_EACH_CALLS).toBe(2);
  });

  test("afterEach should work", () => {
    expect(global.AFTER_EACH_CALLS).toBe(2);
  });
});

it("geste lifecycle hooks: summary", async () => {
  expect(global.BEFORE_ALL_CALLS).toBe(1);
  expect(global.BEFORE_EACH_CALLS).toBe(4);
  expect(global.AFTER_EACH_CALLS).toBe(3);
});
