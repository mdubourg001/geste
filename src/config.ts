import { existsSync } from "fs";
import { build } from "esbuild";
import Module from "module";

import {
  CONFIG_FILE_ABS,
  CONFIG_FILE_REL,
  CONFIG_FILE_NAME,
} from "./constants";

const DEFAULT_CONFIG = {};
let CONFIG;

// TODO: Merge config object with default config
export async function getConfig() {
  if (CONFIG) {
    return CONFIG;
  } else if (!existsSync(CONFIG_FILE_ABS)) {
    CONFIG = DEFAULT_CONFIG;
    return CONFIG;
  }

  const bundle = await build({
    entryPoints: [CONFIG_FILE_ABS],
    write: false,
    outbase: ".",
    outdir: ".",
    logLevel: "silent",
    platform: "node",
    format: "cjs",
    loader: { ".ts": "tsx" },
  });

  const moduleSources = bundle.outputFiles[0].text;
  const module = new Module(bundle.outputFiles[0].path);

  try {
    // @ts-ignore
    module._compile(moduleSources, "");
  } catch (error) {
    // TODO: throw
    console.error(error.stack);
  }

  if (typeof module.exports?.default === "object") {
    CONFIG = module.exports.default;
    return CONFIG;
  } else if (typeof module.exports?.default === "function") {
    CONFIG = module.exports.default();
    return CONFIG;
  } else {
    throwConfigDiagnosis();
  }
}

function throwConfigDiagnosis() {
  throw new Error(
    `Error while compiling ${CONFIG_FILE_REL}: ${CONFIG_FILE_NAME} must \`export default\` either a config object, or a function returning a config object.`
  );
}
