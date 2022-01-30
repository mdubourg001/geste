import util from "util";

import { IDescribe, ITest } from "./types";

function registerDescribe(descObj: IDescribe) {
  if (global.__GESTE_TESTS?.describes) {
    global.__GESTE_TESTS.describes.push(descObj);
  } else {
    global.__GESTE_TESTS.describes = [descObj];
  }

  global.__GESTE_IN_DESCRIBE = true;
  descObj.cb();
  global.__GESTE_IN_DESCRIBE = false;
}

export function describe(desc: string, cb: () => any | Promise<any>) {
  const describeObj: IDescribe = { desc, cb, tests: [] };

  registerDescribe(describeObj);
}

describe.skip = function (desc: string, cb: () => any | Promise<any>) {
  const describeObj: IDescribe = { desc, cb, tests: [], skip: true };

  registerTest(describeObj);
};

describe.each = function (cases: any[]) {
  return async (desc: string, cb: (...args: any[]) => any | Promise<any>) => {
    for (const eachCase of cases) {
      const formattedDesc = util.format(desc, ...eachCase);

      describe(formattedDesc, () => cb(...eachCase));
    }
  };
};

function registerTest(testObj: ITest) {
  if (global.__GESTE_IN_DESCRIBE) {
    const descObj =
      global.__GESTE_TESTS.describes[global.__GESTE_TESTS.describes.length - 1];

    if (descObj?.tests) {
      descObj.tests.push(testObj);
    } else if (descObj) {
      descObj.tests = [testObj];
    } else {
      global.__GESTE_TESTS.describes[
        global.__GESTE_TESTS.describes.length - 1
      ] = {
        tests: [testObj],
      };
    }
  } else {
    if (global.__GESTE_TESTS.tests) {
      global.__GESTE_TESTS.tests.push(testObj);
    } else {
      global.__GESTE_TESTS.tests = [testObj];
    }
  }
}

export function test(desc: string, cb: () => any | Promise<any>) {
  const testObj: ITest = { desc, cb };

  registerTest(testObj);
}

test.each = function (cases: any[]) {
  return async (desc: string, cb: (...args: any[]) => any | Promise<any>) => {
    for (const eachCase of cases) {
      const formattedDesc = util.format(desc, ...eachCase);

      test(formattedDesc, () => cb(...eachCase));
    }
  };
};

test.skip = function (desc: string, cb: () => any | Promise<any>) {
  const testObj: ITest = { desc, cb, skip: true };

  registerTest(testObj);
};

export function beforeAll(cb: () => any | Promise<any>) {
  if (global.__GESTE_TESTS?.beforeAllCbs) {
    global.__GESTE_TESTS.beforeAllCbs.push(cb);
  } else {
    global.__GESTE_TESTS.beforeAllCbs = [cb];
  }
}

export function afterAll(cb: () => any | Promise<any>) {
  if (global.__GESTE_TESTS?.afterAllCbs) {
    global.__GESTE_TESTS.afterAllCbs.push(cb);
  } else {
    global.__GESTE_TESTS.afterAllCbs = [cb];
  }
}

export function beforeEach(cb: () => any | Promise<any>) {
  if (global.__GESTE_TESTS?.beforeEachCbs) {
    global.__GESTE_TESTS.beforeEachCbs.push(cb);
  } else {
    global.__GESTE_TESTS.beforeEachCbs = [cb];
  }
}

export function afterEach(cb: () => any | Promise<any>) {
  if (global.__GESTE_TESTS?.afterEachCbs) {
    global.__GESTE_TESTS.afterEachCbs.push(cb);
  } else {
    global.__GESTE_TESTS.afterEachCbs = [cb];
  }
}
