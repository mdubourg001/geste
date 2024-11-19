describe("basic maths", () => {
  test("should add correctly", () => {
    expect(2 + 2).toBe(4);
  });

  test("should substract correctly", () => {
    expect(2 - 2).toBe(0);
  });
});

test.each([
  [1, 1, 2],
  [2, 2, 4],
  [3, 3, 6],
])("sums of %i and %i should be %i", (a, b, expected) => {
  expect(a + b).toBe(expected);
});

describe.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])("add(%i, %i)", (a, b, expected) => {
  test(`returns ${expected}`, () => {
    expect(a + b).toBe(expected);
  });

  test(`returned value should not be greater than ${expected}`, () => {
    expect(a + b).not.toBeGreaterThan(expected);
  });

  test(`returned value should not be less than ${expected}`, () => {
    expect(a + b).not.toBeLessThan(expected);
  });
});

function inneficientSquare(n: number) {
  let total = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      total++;
    }
  }

  return total;
}

benchmark("benchmark inneficientSquare", (b) => {
  for (let i = 0; i < b.N; i++) {
    inneficientSquare(8000);
  }
});
