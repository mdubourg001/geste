export function getFormattedDuration(milliseconds: number) {
  const unit = milliseconds < 1000 ? "ms" : "s";

  return unit === "ms"
    ? `${Math.floor(milliseconds)}ms`
    : `${(milliseconds / 1000).toFixed(2)}s`;
}
