import { parseHTML } from "linkedom";

const defaultHtml =
  '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>';

const dom = parseHTML(defaultHtml);
const { window } = dom;
const { document } = window;

const KEYS = [];

if (KEYS.length === 0) {
  KEYS.push(
    ...Object.getOwnPropertyNames(window)
      .filter((k) => !k.startsWith("_"))
      .filter((k) => !(k in global))
  );
}

KEYS.forEach((key) => (global[key] = window[key]));

global.document = document;
global.window = window;
window.console = global.console;
