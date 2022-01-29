export interface IGesteConfig {
  // an array of glob patterns used to find test files in the project
  testPatterns: string[];
  // an array of glob patterns ignored while looking for test files
  ignorePatterns: string[];
  // the list of files to run before running each tests
  setupFiles: string[];
  // should geste throw on compilation errors
  throwOnCompilationErrors: boolean;
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

export interface IBenchmark {
  desc: string;
  cb: (b: BenchmarkTools) => any | Promise<any>;
  skip?: boolean;
}

export interface BenchmarkTools {
  N: number;
  resetTimer: () => void;
}

export interface IBenchmarkResults {
  N: number;
  benchtime: number;
  nsPerOp: number;
}

export type ILifecycleHookCb = () => any | Promise<any>;

export interface ISummary {
  total?: number;
  succeeded?: number;
  failed?: number;
  failedList?: string[];
  duration?: number;
  benchmarksTotal?: number;
  benchmarksSucceeded?: number;
  benchmarksFailed?: number;
  benchmarksFailedList?: string[];
  benchmarksDuration?: number;
}

export interface IParsedArgv {
  options: Record<string, string | boolean>;
  testPatterns: string[];
}
