const DEFAULT_MOCK_FN_NAME = "jest.fn()";

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
  Object.defineProperty(mock, "name", { value: DEFAULT_MOCK_FN_NAME });
  mock.mockName = function (name: string) {
    Object.defineProperty(mock, "name", { value: name });
  };
  mock.getMockName = function () {
    return mock.name;
  };

  // reset
  mock.mockReset = function () {
    Object.defineProperty(mock, "name", { value: DEFAULT_MOCK_FN_NAME });

    mock.mock = {
      calls: [],
      results: [],
    };
  };

  global.__GESTE_MOCKS.push(mock);

  return mock;
}

export function resetAllMocks() {
  for (const mock of global.__GESTE_MOCKS) {
    if (typeof mock.mockReset === "function") {
      mock.mockReset();
    }
  }
}
