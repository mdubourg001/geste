import { packageUpSync } from "package-up";

import path from "path";

export const CWD = process.cwd();
export const CONFIG_FILE_NAME = "geste.config.ts";

export const PACKAGE_JSON_ABS = packageUpSync();
export const PROJECT_ROOT = path.dirname(PACKAGE_JSON_ABS as string);
export const CONFIG_FILE_ABS = PACKAGE_JSON_ABS
  ? path.resolve(PROJECT_ROOT, CONFIG_FILE_NAME)
  : path.resolve(CWD, CONFIG_FILE_NAME);

export const CONFIG_FILE_REL = path.relative(CWD, CONFIG_FILE_ABS);
