export interface IGesteConfig {
  // an array of glob patterns used to find test files in the project
  testPatterns: string[];
  // an array of glob patterns ignored while looking for test files
  ignorePatterns: string[];
  // the list of files to run before running each tests
  setupFiles: string[];
}

export interface ITest {
  desc: string;
  cb: () => any | Promise<any>;
  skip?: boolean;
}

export interface IDescribe {
  desc: string;
  cb: () => any | Promise<any>;
  tests: ITest[];
  skip?: boolean;
}

export type ILifecycleHookCb = () => any | Promise<any>;

export interface ISummary {
  total: number;
  succeeded: number;
  failed: number;
  failedList: string[];
  duration: number;
}

export interface IParsedArgv {
  options: Record<string, string | boolean>;
  testPatterns: string[];
}
