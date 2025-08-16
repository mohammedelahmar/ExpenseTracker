/*
  Swap build_tmp -> build robustly on Windows:
  - Remove existing build if possible
  - Try rename; if fails, copy recursively and then remove temp
*/
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const tmpDir = path.join(root, 'build_tmp');
const finalDir = path.join(root, 'build');

function safeRm(p) {
  try { fs.rmSync(p, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch {}
}

function exists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isSymbolicLink()) {
      try { fs.symlinkSync(fs.readlinkSync(s), d); } catch {}
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

(async () => {
  try {
    if (!exists(tmpDir)) {
      console.log('swap-build: build_tmp not found, nothing to do');
      process.exit(0);
    }
    // Best effort cleanup of finalDir
    safeRm(finalDir);
    let swapped = false;
    try {
      fs.renameSync(tmpDir, finalDir);
      swapped = true;
    } catch (e) {
      // Fallback: copy and then remove tmp
      try {
        copyDir(tmpDir, finalDir);
        swapped = true;
      } catch (copyErr) {
        console.error('swap-build: copy fallback failed:', copyErr && copyErr.message);
      }
    }
    // Cleanup tmp either way
    safeRm(tmpDir);
    if (!swapped) {
      console.warn('swap-build: failed to move/copy build_tmp to build; leaving build_tmp as output');
      console.warn('swap-build: use "npx serve -s build_tmp" or copy build_tmp manually');
      process.exit(0);
    }
    console.log('swap-build: build is ready');
    process.exit(0);
  } catch (e) {
    console.error('swap-build: unexpected error', e && e.message);
    process.exit(1);
  }
})();
