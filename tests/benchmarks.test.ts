benchmark("benchmark sleep", async (b) => {
  for (let i = 0; i < b.N; i++) {
    await new Promise((r) => setTimeout(r, 100));
  }
});

benchmark.skip("skipped benchmark", (b) => {
  throw "I should not run !";
});

function factorialize(num: number) {
  if (num < 0) {
    return -1;
  } else if (num == 0) {
    return 1;
  } else {
    return num * factorialize(num - 1);
  }
}

benchmark.each([[10], [100], [1000]])("benchmark factorialize(%i)", (b, n) => {
  for (let i = 0; i < b.N; i++) {
    factorialize(n);
  }
});
