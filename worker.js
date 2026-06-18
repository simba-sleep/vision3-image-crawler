import { parentPort, workerData } from "node:worker_threads";

const { workerId } = workerData;

parentPort.on("message", async (msg) => {
  if (msg.type === "done") {
    process.exit(0);
  }

  const { url } = msg;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      parentPort.postMessage({
        workerId,
        success: false,
        error: `HTTP ${response.status} ${response.statusText}`,
        url,
      });
    } else {
      const buffer = await response.arrayBuffer();
      parentPort.postMessage({
        workerId,
        success: true,
        bytes: buffer.byteLength,
        url,
      });
    }
  } catch (err) {
    parentPort.postMessage({
      workerId,
      success: false,
      error: err.message,
      url,
    });
  }
});

// Signal ready for work
parentPort.postMessage({ workerId, type: "ready" });
