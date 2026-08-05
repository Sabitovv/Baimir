// vite-plugin-compression2 occasionally emits a corrupt artifact (observed:
// a valid but empty favicon.svg.gz for a 460 kB source). server.mjs serves
// these files verbatim, so a broken artifact would reach the browser as an
// empty response. Drop anything that does not decompress back to its source.

import { readdir, readFile, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';

const DIST_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const DECODERS = {
  '.br': brotliDecompressSync,
  '.gz': gunzipSync,
};

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(entryPath) : [entryPath];
    }),
  );

  return files.flat();
};

const main = async () => {
  const files = await walk(DIST_DIR);
  let checked = 0;
  let removed = 0;

  for (const filePath of files) {
    const decode = DECODERS[path.extname(filePath)];
    if (!decode) continue;

    const sourcePath = filePath.slice(0, -path.extname(filePath).length);
    let sourceSize;
    try {
      sourceSize = (await stat(sourcePath)).size;
    } catch {
      continue; // No matching source; nothing to compare against.
    }

    checked += 1;

    let decodedSize = -1;
    try {
      decodedSize = decode(await readFile(filePath)).length;
    } catch {
      // Falls through to the mismatch branch below.
    }

    if (decodedSize !== sourceSize) {
      await unlink(filePath);
      removed += 1;
      console.warn(
        `[verify-precompressed] removed corrupt ${path.relative(DIST_DIR, filePath)} ` +
          `(decoded ${decodedSize} bytes, expected ${sourceSize})`,
      );
    }
  }

  console.log(
    `[verify-precompressed] checked ${checked} artifacts, removed ${removed}`,
  );
};

main().catch((error) => {
  console.error('[verify-precompressed] failed:', error);
  process.exit(1);
});
