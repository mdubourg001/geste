export interface ITest {
  desc: string;
  cb: () => any | Promise<any>;
}

export interface IDescribe {
  desc: string;
  cb: () => any | Promise<any>;
  tests: ITest[];
}
