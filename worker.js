import { parentPort, workerData } from "node:worker_threads";

const { workerId } = workerData;

parentPort.on("message", async (msg) => {
  if (msg.type === "done") {
    process.exit(0);
  }

  const { url } = msg;
  const startTime = performance.now();
  try {
    const response = await fetch(url);
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      parentPort.postMessage({
        workerId,
        success: false,
        error: `HTTP ${response.status} ${response.statusText}`,
        url,
        time: elapsed,
      });
    } else {
      const buffer = await response.arrayBuffer();
      parentPort.postMessage({
        workerId,
        success: true,
        bytes: buffer.byteLength,
        url,
        time: elapsed,
      });
    }
  } catch (err) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    parentPort.postMessage({
      workerId,
      success: false,
      error: err.message,
      url,
      time: elapsed,
    });
  }
});

// Signal ready for work
parentPort.postMessage({ workerId, type: "ready" });
