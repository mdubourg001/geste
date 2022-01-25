import fs from "fs";
import path from "path";

export function toMatchSnapshot(expected: any) {
  const currentTestfile = global.__GESTE_CURRENT_TESTFILE;
  const snapsDir = path.join(path.dirname(currentTestfile), "__snapshots__");
  const snapFilename = path.basename(currentTestfile) + ".snapshot";
  const snapFilepath = path.join(snapsDir, snapFilename);
  const expectedContent = JSON.stringify(expected);

  if (fs.existsSync(snapFilepath)) {
    const actualContent = fs.readFileSync(snapFilepath, { encoding: "utf8" });
    const parsedActual = JSON.parse(actualContent);

    try {
      expect(expected).toStrictEqual(parsedActual);

      return {
        message: () => `Snapshot matches.`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () =>
          error.matcherResult.message.replace(
            "toStrictEqual\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // deep equality\u001b[22m\n",
            "toMatchSnapshot()"
          ),
        pass: error.matcherResult.pass,
      };
    }
  } else {
    fs.mkdirSync(snapsDir, { recursive: true });
    fs.writeFileSync(snapFilepath, expectedContent, { encoding: "utf-8" });

    return {
      message: () => `New snapshot written.`,
      pass: true,
    };
  }
}
