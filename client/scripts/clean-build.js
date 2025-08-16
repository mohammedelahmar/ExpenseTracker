/*
  Robust cleaner for CRA build directory on Windows.
  - Try rmSync with retries
  - If still failing, rename build to a temp folder to avoid lock
*/
const fs = require('fs');
const path = require('path');

const targetArg = process.argv[2] || 'build';
const buildDir = path.resolve(__dirname, '..', targetArg);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function removeWithRetries(target, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
      return true;
    } catch (e) {
      if (i === attempts) return false;
      await sleep(500);
    }
  }
  return false;
}

(async () => {
  try {
    if (!fs.existsSync(buildDir)) return;
    const ok = await removeWithRetries(buildDir, 4);
    if (ok) return;
    // Fallback: rename the folder to get it out of the way
    const renamed = buildDir + '_old_' + Date.now();
    try {
      fs.renameSync(buildDir, renamed);
    } catch (e) {
      // As last resort, try to empty contents file-by-file
      try {
        const entries = fs.readdirSync(buildDir);
        for (const name of entries) {
          const p = path.join(buildDir, name);
          try { fs.rmSync(p, { recursive: true, force: true }); } catch {}
        }
      } catch {}
    }
  } catch {}
})();
