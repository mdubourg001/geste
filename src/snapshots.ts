import fs from "fs";
import path from "path";

import { parseCmdlineArgs } from "./args";
import { PROJECT_ROOT } from "./constants";

export function toMatchSnapshot(expected: any) {
  const currentTestfile = global.__GESTE_CURRENT_TESTFILE;
  const snapsDir = path.join(path.dirname(currentTestfile), "__snapshots__");
  const snapFilename = path.basename(currentTestfile) + ".snapshot";
  const snapFilepath = path.join(snapsDir, snapFilename);

  if (fs.existsSync(snapFilepath)) {
    const actualContent = fs.readFileSync(snapFilepath, { encoding: "utf8" });
    const parsedActual = JSON.parse(actualContent);

    try {
      global.expect(expected).toStrictEqual(parsedActual);

      return {
        message: () => `Snapshot matches`,
        pass: true,
      };
    } catch (error) {
      const { options } = parseCmdlineArgs();

      if (options["--update-snapshots"]) {
        const expectedContent = JSON.stringify(expected, null, 2);

        fs.writeFileSync(snapFilepath, expectedContent, { encoding: "utf-8" });

        global.__GESTE_SNAPSHOTS_SUMMARY.updated.push(
          path.relative(PROJECT_ROOT, snapFilepath)
        );

        return {
          message: () => `Snapshot written`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            error.matcherResult.message.replace(
              "toStrictEqual\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // deep equality\u001b[22m\n",
              "toMatchSnapshot()"
            ),
          pass: error.matcherResult.pass,
        };
      }
    }
  } else {
    const expectedContent = JSON.stringify(expected, null, 2);

    fs.mkdirSync(snapsDir, { recursive: true });
    fs.writeFileSync(snapFilepath, expectedContent, { encoding: "utf-8" });

    global.__GESTE_SNAPSHOTS_SUMMARY.written.push(
      path.relative(PROJECT_ROOT, snapFilepath)
    );

    return {
      message: () => `Snapshot written`,
      pass: true,
    };
  }
}
