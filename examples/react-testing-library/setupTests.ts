import "@testing-library/jest-dom/extend-expect";
import { parseHTML } from "linkedom";

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
