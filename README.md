<div align="center">
  <img src="shots/geste.png" alt="geste" height="60" />
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

## Installation

```bash
npm install --save-dev geste-test
```

## API

**geste's API aims to be the exact same as Jest's:**

- [`describe`](https://jestjs.io/docs/api#describename-fn)
- [`test`](https://jestjs.io/docs/api#testname-fn-timeout)
- [`test.each`](https://jestjs.io/docs/api#testeachtablename-fn-timeout)
- [`it`](https://jestjs.io/docs/api#testname-fn-timeout)
- [`beforeAll`](https://jestjs.io/docs/api#beforeallfn-timeout)
- [`afterAll`](https://jestjs.io/docs/api#afterallfn-timeout)
- [`beforeEach`](https://jestjs.io/docs/api#beforeeachfn-timeout)
- [`afterEach`](https://jestjs.io/docs/api#aftereachfn-timeout)

However this is a WIP project so more APIs will be implemented in the future. Feel free to **fill in an issue** to ask for the APIs you'd like to be implemented in priority.

## Usage

To run your whole test suite, at the root of your project:

```bash
geste
```

To run only specific tests:

```bash
geste tests/utils/*.ts
```

### Usage with tests needing a DOM

Install jsdom and global-jsdom:

```bash
npm install --save-dev jsdom global-jsdom
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

import "global-jsdom/register";
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
};
```

Here are the list of the currently supported configuration options, and their Jest's "equivalent":

- `testPatterns`: array of [glob](https://github.com/isaacs/node-glob) patterns used to walk your project's sources and find test files. Equivalent to [Jest's `testMatch`](https://jestjs.io/docs/configuration#testmatch-arraystring)
- `ignorePatterns`: array of [glob](https://github.com/isaacs/node-glob) patterns that will be ignored when looking for test files. Close to [Jest's `testPathIgnorePatterns`](https://jestjs.io/docs/configuration#testpathignorepatterns-arraystring) but here **it's a array of glob patterns instead of regexp patterns**.
- `setupFiles`: array of paths to modules that will be compiled and evaluated before every one of your test files. Equivalent to [Jest's `setupFiles`](https://jestjs.io/docs/configuration#setupfiles-array)
