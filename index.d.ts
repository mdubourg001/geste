interface MockFunction extends Function {
  _isMockFunction: boolean;
  mock: {
    calls: any[][];
    results: any[];
  };
  mockName: (name: string) => void;
  getMockName: () => string;
  mockReset: () => void;
}

declare var describe: ((desc: string, cb: () => any | Promise<any>) => void) & {
  skip: (desc: string, cb: () => any | Promise<any>) => void;
};
declare var test: ((desc: string, cb: () => any | Promise<any>) => void) & {
  each: (
    cases: any[]
  ) => (desc: string, cb: (...args: any[]) => any | Promise<any>) => void;
  skip: (desc: string, cb: () => any | Promise<any>) => void;
};
declare var benchmark: (
  desc: string,
  cb: () => any | Promise<any>
) => void & {};
declare var it: typeof test;
declare var beforeAll: (cb: () => any | Promise<any>) => void;
declare var afterAll: (cb: () => any | Promise<any>) => void;
declare var beforeEach: (cb: () => any | Promise<any>) => void;
declare var afterEach: (cb: () => any | Promise<any>) => void;
declare var expect: typeof import("expect");
declare var jest: {
  fn: (impl?: (...args: any[]) => any) => MockFunction;
  resetAllMocks: () => void;
};
