declare var describe: (desc: string, cb: () => any | Promise<any>) => void;
declare var test: (desc: string, cb: () => any | Promise<any>) => void;
declare var it: typeof test;
declare var beforeAll: (cb: () => any | Promise<any>) => void;
declare var afterAll: (cb: () => any | Promise<any>) => void;
declare var beforeEach: (cb: () => any | Promise<any>) => void;
declare var afterEach: (cb: () => any | Promise<any>) => void;
declare var expect: typeof import("expect");
