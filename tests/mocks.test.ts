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

  test("mock.mockName() modifies mock fn name", () => {
    const fn = jest.fn();

    fn.mockName("my mocked fn");
    expect(fn.getMockName()).toBe("my mocked fn");
  });

  test("mock.mockReset() clears name, calls and return values", () => {
    const fn = jest.fn();
    fn.mockName("my mocked fn");

    fn();

    fn.mockReset();
    expect(fn).not.toHaveBeenCalled();
    expect(fn.getMockName()).not.toBe("my mocked fn");
  });
});
