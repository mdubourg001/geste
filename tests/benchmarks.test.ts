benchmark("benchmark sleep", async (b) => {
  for (let i = 0; i < b.N; i++) {
    await new Promise((r) => setTimeout(r, 100));
  }
});

benchmark.skip("skipped benchmark", (b) => {
  throw "I should not run !";
});
