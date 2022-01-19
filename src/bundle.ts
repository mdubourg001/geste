import { build, BuildOptions } from "esbuild";

const BUNDLE_CACHE = {};

function arrayHash(arr: string[]) {
  function charsum(str: string) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i) * (i + 1);
    }

    return sum;
  }

  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    var cs = charsum(arr[i]);
    sum = sum + 65027 / cs;
  }

  return ("" + sum).slice(0, 16);
}

export async function bundleForNode({
  files,
  memoize = false,
  buildOptions = {},
}: {
  files: string[];
  memoize?: boolean;
  buildOptions?: BuildOptions;
}) {
  const filesHash = arrayHash(files);

  if (BUNDLE_CACHE[filesHash]) {
    return BUNDLE_CACHE[filesHash];
  }

  const bundle = await build({
    entryPoints: files,
    write: false,
    allowOverwrite: true,
    bundle: true,
    outbase: ".",
    outdir: ".",
    logLevel: "silent",
    platform: "node",
    target: "node12",
    format: "cjs",
    loader: { ".js": "jsx", ".ts": "tsx", ".png": "dataurl" },
    ...buildOptions,
  });

  if (memoize) {
    BUNDLE_CACHE[filesHash] = bundle;
  }

  return bundle;
}
