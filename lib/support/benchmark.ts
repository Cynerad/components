function benchmark(callback: CallableFunction) {
  const start = performance.now();
  callback();
  const end = performance.now();
  const elapsedTime = end - start;

  console.info(`Execution time: ${(elapsedTime).toFixed(2)} ms`);
}

export { benchmark };
