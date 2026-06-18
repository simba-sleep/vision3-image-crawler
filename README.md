# vison3-image-crawler

Crawls all Vision3 hosted image URLs to force their server to pre-cache every image variant.

Uses Node.js worker threads to download images in parallel. The image data is discarded after download — the goal is purely to trigger server-side caching.

## Requirements

- Node.js 24+

## Usage

```bash
node index.js [--workers <count>] [--test]
```

### Options

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--workers` | `-w` | `10` | Maximum number of concurrent worker threads |
| `--test` | `-t` | `false` | Print generated URLs without fetching |

### Examples

```bash
# Run with default 10 workers
node index.js

# Run with 20 workers
node index.js --workers 20

# Preview all URLs without making requests
node index.js --test
```

## How it works

1. Generates all unique image URLs from combinations of beds, storage options, leg styles, colours, views, crops, and output sizes.
2. Spawns a pool of worker threads (up to the configured maximum).
3. Each worker fetches URLs sequentially, discarding the response body.
4. Progress is logged to the console as each request completes.
