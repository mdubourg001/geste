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
