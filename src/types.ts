export interface ITest {
  desc: string;
  cb: () => any | Promise<any>;
}

export interface IDescribe {
  desc: string;
  cb: () => any | Promise<any>;
  tests: ITest[];
}

export interface ISummary {
  total: number;
  succeeded: number;
  failed: number;
  failedList: string[];
  duration: number;
}
