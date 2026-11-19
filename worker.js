import { parentPort, workerData } from "node:worker_threads";

const { workerId } = workerData;

function buildValidatedUrl(baseUrl) {
  try {
    if (baseUrl.includes("/../") || /\/%2e%2e\//i.test(baseUrl)) {
      throw new Error("Invalid path");
    }
    const url = new URL(baseUrl);
    const allowedDomains = ["example.com"]; // add your allowed domains here
    if (!allowedDomains.includes(url.hostname)) {
      throw new Error("Invalid host");
    }
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid protocol");
    }
    return url.href;
  } catch {
    throw new Error("Invalid URL");
  }
}

parentPort.on("message", async (msg) => {
  if (msg.type === "done") {
    process.exit(0);
  }

  const { url } = msg;
  const startTime = performance.now();
  try {
    const response = await fetch(buildValidatedUrl(url));
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
