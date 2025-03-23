import { build } from 'vite'
import fs from 'fs-extra'
import path from 'path'
import chokidar from 'chokidar'

const BUILD_DIR = 'dist'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  build: '\x1b[32m',    // Green
  copy: '\x1b[36m',     // Cyan
  watch: '\x1b[35m',    // Magenta
  error: '\x1b[31m',    // Red
  info: '\x1b[34m'      // Blue
};

function getTimestamp() {
  return new Date().toLocaleTimeString();
}

function log(message, type = 'info') {
  const color = colors[type] || colors.info;
  const typeFormatted = type.toUpperCase().padEnd(5);
  console.log(`[${getTimestamp()}] ${color}${typeFormatted}${colors.reset} ${message}`);
}

async function ensureDirectoryExists() {
  await fs.ensureDir(BUILD_DIR);
  log('Build directory ready!', 'info');
}

async function buildExtension() {
  log('Building extension...', 'build');
  try {
    await build();
    log('Build completed successfully!', 'build');
  } catch (err) {
    log(`Build failed: ${err}`, 'error');
  }
}

async function copyManifest() {
  try {
    await fs.copy('public/manifest.json', path.join(BUILD_DIR, 'manifest.json'));
    log('Manifest copied successfully!', 'copy');
  } catch (err) {
    log(`Failed to copy manifest: ${err}`, 'error');
  }
}

async function watchFiles() {
  const watcher = chokidar.watch(['src/**/*', 'public/**/*'], {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  watcher
    .on('ready', () => log('Initial scan complete. Ready for changes...', 'watch'))
    .on('change', async (filePath) => {
      log(`File ${filePath} has been changed`, 'watch');
      await buildExtension();
      await copyManifest();
    });
}

// Initial setup and build
ensureDirectoryExists()
  .then(buildExtension)
  .then(copyManifest)
  .then(watchFiles)
  .catch(err => log(`Error: ${err}`, 'error')); 