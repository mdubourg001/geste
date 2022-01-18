import util from "util";

import { IDescribe, ITest } from "./types";

export async function describe(desc: string, cb: () => any | Promise<any>) {
  const describeObj = { desc, cb, tests: [] } as IDescribe;
  const currentTestfile = global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE];

  if (currentTestfile?.describes) {
    currentTestfile.describes.push(describeObj);
  } else if (currentTestfile) {
    currentTestfile.describes = [describeObj];
  } else {
    global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE] = {
      describes: [describeObj],
    };
  }

  global.__GESTE_IN_DESCRIBE = true;
  cb();
  global.__GESTE_IN_DESCRIBE = false;
}

export async function test(desc: string, cb: () => any | Promise<any>) {
  const testObj = { desc, cb } as ITest;
  const currentTestfile = global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE];

  if (currentTestfile) {
    if (global.__GESTE_IN_DESCRIBE) {
      const descObj =
        currentTestfile.describes[currentTestfile.describes.length - 1];

      if (descObj?.tests) {
        descObj.tests.push(testObj);
      } else if (descObj) {
        descObj.tests = [testObj];
      } else {
        currentTestfile.describes[currentTestfile.describes.length - 1] = {
          tests: [testObj],
        };
      }
    } else {
      if (currentTestfile.tests) {
        currentTestfile.tests.push(testObj);
      } else {
        currentTestfile.tests = [testObj];
      }
    }
  } else {
    global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE] = {
      tests: [testObj],
    };
  }
}

test.each = function (cases: any[]) {
  return async (desc: string, cb: (...args: any[]) => any | Promise<any>) => {
    for (const eachCase of cases) {
      const formattedDesc = util.format(desc, ...eachCase);

      test(formattedDesc, () => cb(...eachCase));
    }
  };
};

export async function beforeAll(cb: () => any | Promise<any>) {
  const currentTestfile = global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE];

  if (currentTestfile?.beforeAllCbs) {
    currentTestfile.beforeAllCbs.push(cb);
  } else if (currentTestfile) {
    currentTestfile.beforeAllCbs = [cb];
  } else {
    global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE] = {
      beforeAllCbs: [cb],
    };
  }
}

export async function afterAll(cb: () => any | Promise<any>) {
  const currentTestfile = global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE];

  if (currentTestfile?.afterAllCbs) {
    currentTestfile.afterAllCbs.push(cb);
  } else if (currentTestfile) {
    currentTestfile.afterAllCbs = [cb];
  } else {
    global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE] = {
      afterAllCbs: [cb],
    };
  }
}

export async function beforeEach(cb: () => any | Promise<any>) {
  const currentTestfile = global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE];

  if (currentTestfile?.beforeEachCbs) {
    currentTestfile.beforeEachCbs.push(cb);
  } else if (currentTestfile) {
    currentTestfile.beforeEachCbs = [cb];
  } else {
    global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE] = {
      beforeEachCbs: [cb],
    };
  }
}

export async function afterEach(cb: () => any | Promise<any>) {
  const currentTestfile = global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE];

  if (currentTestfile?.afterEachCbs) {
    currentTestfile.afterEachCbs.push(cb);
  } else if (currentTestfile) {
    currentTestfile.afterEachCbs = [cb];
  } else {
    global.__GESTE_TESTS[global.__GESTE_CURRENT_TESTFILE] = {
      afterEachCbs: [cb],
    };
  }
}
