export function mockFn(impl?: (...args: any[]) => any) {
  function mock() {
    let result = { type: "return", value: undefined };

    try {
      if (impl) {
        result.value = impl(...arguments);
      }
    } catch (error) {
      result = { type: "throw", value: error };
    }

    mock.mock = {
      ...mock.mock,
      calls: [...mock.mock.calls, [...arguments]],
      results: [...mock.mock.results, result],
    };

    if (result.type === "throw") {
      throw result.value;
    }

    return result.value;
  }

  mock._isMockFunction = true;
  mock.mock = {
    calls: [],
    results: [],
  };

  // mock function name
  Object.defineProperty(mock, "name", { value: "jest.fn()" });
  mock.mockName = (name: string) => {
    Object.defineProperty(mock, "name", { value: name });
  };
  mock.getMockName = () => mock.name;

  return mock;
}
