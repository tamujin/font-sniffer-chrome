import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(__dirname, `../font-sniffer-v${version}.zip`));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', () => {
  console.log(`\x1b[32m✓\x1b[0m Created release package: font-sniffer-v${version}.zip`);
  console.log(`  Total size: ${(archive.pointer() / 1024).toFixed(2)} KB`);
});

// Handle warnings and errors
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('\x1b[33m⚠\x1b[0m', err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add the dist directory contents to the archive
archive.directory('dist/', false);

// Finalize the archive
archive.finalize(); 