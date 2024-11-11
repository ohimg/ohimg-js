async function runWorkerTest() {
  const port = 8787;
  const proc = Bun.spawn(
    [
      "npx",
      "wrangler",
      "dev",
      "tests/worker.test.js",
      "--port",
      port.toString(),
    ],
    {
      stdout: "inherit",
      stderr: "inherit",
    }
  );

  // Wait for worker to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // Test the worker
    const response = await fetch(`http://localhost:${port}`);
    const data = await response.json();

    if (!data.success || !data.url?.startsWith("https://og.ohimg.dev")) {
      console.error("Worker test failed:", data);
      process.exit(1);
    }

    console.log("Worker test passed:", data);
    process.exit(0);
  } finally {
    proc.kill();
  }
}

runWorkerTest().catch((error) => {
  console.error("Test runner failed:", error);
  process.exit(1);
});
