import { existsSync } from "fs";
import { build } from "esbuild";
import Module from "module";

import { GesteConfig } from "./types";
import {
  CONFIG_FILE_ABS,
  CONFIG_FILE_REL,
  CONFIG_FILE_NAME,
} from "./constants";

let CONFIG;
const DEFAULT_CONFIG: GesteConfig = {
  testPatterns: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  ignorePatterns: ["**/node_modules/**/*"],
  setupFiles: [],
  throwOnCompilationErrors: true,
};

export async function getConfig(): Promise<GesteConfig> {
  if (CONFIG) {
    return CONFIG;
  } else if (!existsSync(CONFIG_FILE_ABS)) {
    CONFIG = DEFAULT_CONFIG;
    return CONFIG;
  }

  const bundle = await build({
    entryPoints: [CONFIG_FILE_ABS],
    write: false,
    allowOverwrite: true,
    outbase: ".",
    outdir: ".",
    logLevel: "silent",
    platform: "node",
    target: "node12",
    format: "cjs",
    loader: { ".ts": "tsx" },
  });

  const moduleSources = bundle.outputFiles[0].text;
  const module = new Module(bundle.outputFiles[0].path);

  try {
    // @ts-ignore
    module._compile(moduleSources, "");
  } catch (error) {
    throw error.stack;
  }

  if (typeof module.exports?.default === "object") {
    CONFIG = { ...DEFAULT_CONFIG, ...module.exports.default };
  } else if (typeof module.exports?.default === "function") {
    CONFIG = { ...DEFAULT_CONFIG, ...module.exports.default() };
  } else {
    throwConfigDiagnosis();
  }

  return CONFIG;
}

function throwConfigDiagnosis() {
  throw new Error(
    `Error while compiling ${CONFIG_FILE_REL}: ${CONFIG_FILE_NAME} must \`export default\` either a config object, or a function returning a config object.`
  );
}
