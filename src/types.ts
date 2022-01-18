export interface IGesteConfig {
  // an array of glob patterns used to find test files in the project
  testPatterns: string[];
  // an array of regexps on which resolved files are matched before running
  ignoreRegexps: string[];
  // the list of files to run before running each tests
  setupFiles: string[];
}

export interface ITest {
  desc: string;
  cb: () => any | Promise<any>;
}

export interface IDescribe {
  desc: string;
  cb: () => any | Promise<any>;
  tests: ITest[];
}

export type ILifecycleHookCb = () => any | Promise<any>;

export interface ISummary {
  total: number;
  succeeded: number;
  failed: number;
  failedList: string[];
  duration: number;
}
