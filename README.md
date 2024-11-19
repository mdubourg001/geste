<div align="center">
  <img src="shots/geste-2-es.png" alt="geste" height="200" />
</div>

<br>

<div align="center">
  (wip) test runner based on <a href="https://esbuild.github.io">esbuild</a><br> aiming be to be a <b>faster drop-in replacement</b> to Jest.<br><br>
  <b>This project is still WIP, and I'd be glad to receive issues/PRs to help improve it.</b>
</div>

## Features

- Drop-in replacement to Jest
- TypeScript and JSX support out of the box
- Supa-fast compilation of test files
- Support of async tests
- Support of both ESM and CJS syntaxes
- Built-in support of benchmark tests

## Installation

```bash
npm install --save-dev geste-test
```

## Usage

To run your whole test suite, at the root of your project:

```bash
geste
```

To run only specific tests:

```bash
geste tests/utils/*.ts
```

### Available options

- `--update-snapshots`: when set, failing `expect.toMatchSnapshot()` assertions will update corresponding snapshot files.
- `--bench`: run benchmark tests right after unit tests
- `--only-bench`: run only benchmark tests and ignore unit tests

### Usage with tests needing a DOM

Install `linkedom` and (optionally) `@testing-library/jest-dom`:

```bash
npm install --save-dev linkedom
# optional: for usage with testing-library
npm install --save-dev @testing-library/jest-dom
```

Create a `geste.config.ts` file at the root of your project (next to `package.json`):

```ts
// geste.config.ts

export default {
  setupFiles: ["./setupTests.ts"],
};
```

Then create the `setupTests.ts` file, which will be ran before **each one of your tests** (see https://jestjs.io/docs/configuration#setupfiles-array):

```ts
// setupTests.ts

import { parseHTML } from "linkedom";
// optional: for usage with testing-library (run `npm install @testing-library/jest-dom`)
import "@testing-library/jest-dom";

const defaultHtml =
  '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>';

const dom = parseHTML(defaultHtml);
const { window } = dom;
const { document } = window;

// add missing window.location property
if (!window.location) {
  // @ts-ignore
  window.location = { protocol: "http" };
}

// add missing document.getSelection property
if (!document.getSelection) {
  // @ts-ignore
  document.getSelection = () => ({});
}

// add missing window.getComputedStyled property
if (!window.getComputedStyle) {
  // https://github.com/mikemadest/jest-environment-linkedom/blob/main/src/get-computed-style-polyfill.js
  function getComputedStyle(element) {
    this.el = element;

    this.getPropertyValue = function (prop) {
      const regExp = /(\-([a-z]){1})/g;
      let updatedProp = prop === "float" ? "styleFloat" : prop;

      if (regExp.test(updatedProp)) {
        updatedProp = updatedProp.replace(regExp, function (match, ...parts) {
          return parts[1].toUpperCase();
        });
      }

      return element?.currentStyle?.[updatedProp]
        ? element.currentStyle[updatedProp]
        : null;
    };

    return this;
  }

  window.getComputedStyle = getComputedStyle;
}

// add missing default width/height of window (1024x768 is JSDOM's default)
if (!window.innerWidth) {
  window.innerWidth = 1024;
}
if (!window.outerWidth) {
  window.outerWidth = 1024;
}
if (!window.innerHeight) {
  window.innerHeight = 768;
}
if (!window.outerHeight) {
  window.outerHeight = 768;
}

// add in global all window's properties that are not already defined
for (const key of Object.getOwnPropertyNames(window).filter(
  (k) => !k.startsWith("_") && !global[k]
)) {
  global[key] = window[key];
}

global.document = document;
global.window = window;
global.navigator = window.navigator;
window.console = global.console;
```

## API

### Test API

**geste's API aims to be the exact same as Jest's:**

- [`describe`](https://jestjs.io/docs/api#describename-fn)
- [`describe.each`](https://jestjs.io/docs/api#describeeachtablename-fn-timeout)
- [`describe.skip`](https://jestjs.io/docs/api#describeskipname-fn)
- [`test`](https://jestjs.io/docs/api#testname-fn-timeout)
- [`test.each`](https://jestjs.io/docs/api#testeachtablename-fn-timeout)
- [`test.skip`](https://jestjs.io/docs/api#testskipname-fn)
- [`it`](https://jestjs.io/docs/api#testname-fn-timeout)
- [`beforeAll`](https://jestjs.io/docs/api#beforeallfn-timeout)
- [`afterAll`](https://jestjs.io/docs/api#afterallfn-timeout)
- [`beforeEach`](https://jestjs.io/docs/api#beforeeachfn-timeout)
- [`afterEach`](https://jestjs.io/docs/api#aftereachfn-timeout)
- [`jest.fn`](https://jestjs.io/docs/jest-object#jestfnimplementation)
- [`jest.resetAllMocks`](https://jestjs.io/docs/jest-object#jestresetallmocks)

However this is a WIP project so more APIs will be implemented in the future. Feel free to **fill in an issue** to ask for the APIs you'd like to be implemented in priority.

Check out the [`examples/`](/examples) folder to see real usages of geste API.

### Benchmark API

geste also implements a benchmarking API inspired by [Golang's](https://gobyexample.com/testing-and-benchmarking). Benchmark tests are written the same way as unit tests and are launched only when running geste with the `--bench` option (or `--only-bench` to run only benchmark tests).

#### `benchmark: (desc: string, cb: (b: BenchmarkTools) => any) => void`:

Register a benchmark test.

```typescript
import { BenchmarkTools } from "geste-test";

benchmark("benchmark factorialize", (b: BenchmarkTools) => {
  for (let i = 0; i < b.N; i++) {
    factorialize(10);
  }
});
```

`geste --bench` will output something like:

```plaintext
tests/benchmarks.test.ts
b  benchmark factorialize     20971520     82ns/op     1714ms
```

- `benchmark factorialize` is the name of the benchmark test
- `20971520` is the number of times your function was able to run in (at least) **one second** (higher is better)
- `82ns/op` indicates **how much time each run took** in average (lower is better)
- `1714ms` is the execution time that was needed to run your function `20971520` times

#### `benchmark.skip: (desc: string, cb: (b: BenchmarkTools) => any) => void`

Skip a benchmark test.

#### `benchmark.each: (cases: any[]) => (desc: string, cb: (b: BenchmarkTools, ...args: any[]) => any) => void`

Register a benchmark test for each case provided. Useful to benchmark a function with various inputs.

```typescript
benchmark.each([[10], [100], [1000]])("benchmark factorialize(%i)", (b, n) => {
  for (let i = 0; i < b.N; i++) {
    factorialize(n);
  }
});
```

## Configuration

This project aims to be a drop-in replacement to Jest, so the configuration options are very much inspired by it.

You can configure geste's options by creating a `geste.config.ts` file at the root of your project.

These are the default configuration values:

```ts
// geste.config.ts

export default {
  testPatterns: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  ignorePatterns: ["**/node_modules/**/*"],
  setupFiles: [],
  throwOnCompilationErrors: true,
};
```

Here are the list of the currently supported configuration options, and their Jest's "equivalent":

- `testPatterns`: array of [glob](https://github.com/isaacs/node-glob) patterns used to walk your project's sources and find test files. Equivalent to [Jest's `testMatch`](https://jestjs.io/docs/configuration#testmatch-arraystring)
- `ignorePatterns`: array of [glob](https://github.com/isaacs/node-glob) patterns that will be ignored when looking for test files. Close to [Jest's `testPathIgnorePatterns`](https://jestjs.io/docs/configuration#testpathignorepatterns-arraystring) but here **it's a array of glob patterns instead of regexp patterns**.
- `setupFiles`: array of paths to modules that will be compiled and evaluated before every one of your test files. Equivalent to [Jest's `setupFiles`](https://jestjs.io/docs/configuration#setupfiles-array)
- `throwOnCompilationErrors`: should geste throw if it encounters an error while compiling a test file. Kinda same as setting [Jest's `bail`](https://jestjs.io/docs/configuration#bail-number--boolean) to `true`
