import { parentPort, workerData } from "node:worker_threads";

const { workerId } = workerData;

// All crawl targets live on a single fixed origin. Only the path + query are
// taken from the incoming message; the origin is never caller-controlled.
const ALLOWED_ORIGIN = "https://vp.img.haze.tools";
const ALLOWED_PATH_PREFIX = "/simba_";

function buildValidatedUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.origin !== ALLOWED_ORIGIN) {
    throw new Error(`Disallowed origin: ${parsed.origin}`);
  }
  if (parsed.username || parsed.password) {
    throw new Error("Credentials not allowed in URL");
  }
  // Rebuild against the fixed origin so only path + query come from input.
  const url = new URL(`${parsed.pathname}${parsed.search}`, ALLOWED_ORIGIN);
  if (url.origin !== ALLOWED_ORIGIN || !url.pathname.startsWith(ALLOWED_PATH_PREFIX)) {
    throw new Error(`Disallowed path: ${url.pathname}`);
  }
  return url.href;
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
