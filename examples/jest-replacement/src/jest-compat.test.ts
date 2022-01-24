describe("mock functions", () => {
  test("jest.fn + toHaveBeenCalled", () => {
    const fn = jest.fn();

    // initially not called
    expect(fn).not.toHaveBeenCalled();

    fn();

    expect(fn).toHaveBeenCalled();
  });

  test("toHaveBeenCalledWith", () => {
    const fn = jest.fn((arg) => arg);

    fn("foo");
    fn("buzz");

    expect(fn).not.toHaveBeenCalledWith("bar");

    expect(fn).toHaveBeenCalledWith("foo");
    expect(fn).toHaveBeenCalledWith("buzz");
  });
});
