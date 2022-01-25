describe("snapshots", () => {
  test("toMatchSnapshot should read on fs", () => {
    const obj = {
      foo: {
        bar: {
          bazz: "buzz",
        },
      },
    };

    expect(obj).toMatchSnapshot();
  });

  // TODO: Implement
  // test("multiple toMatchSnapshots in same test", () => {
  //   expect("foo").toMatchSnapshot();
  //   expect({ bar: "buzz" }).toMatchSnapshot();
  // });

  // TODO: Implement
  //   test("toMatchInlineSnapshot should compare inline", () => {
  //     const obj = {
  //       foo: {
  //         bar: {
  //           bazz: "buzz",
  //         },
  //       },
  //     };

  //     expect(obj).toMatchInlineSnapshot(`{
  //   "foo": {
  //     "bar": {
  //       "bazz": "buzz"
  //     }
  //   }
  // }`);
  //   });
});
