import path from "path";

export function getFormattedDuration(milliseconds: number) {
  const unit = milliseconds < 1000 ? "ms" : "s";

  return unit === "ms"
    ? `${Math.floor(milliseconds)}ms`
    : `${(milliseconds / 1000).toFixed(2)}s`;
}

export function getPathWithoutExt(filepath: string) {
  const parsed = path.parse(filepath);
  return path.join(parsed.dir, parsed.name);
}
