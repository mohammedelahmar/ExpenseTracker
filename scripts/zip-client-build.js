/*
  Zip client build in a Windows-friendly way:
  - Prefer client/build_tmp if it exists (before swap)
  - Else fall back to client/build (after swap)
  - If neither exists, trigger a build in client and then pick what's available
*/
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const clientDir = path.join(repoRoot, 'client');
const buildTmp = path.join(clientDir, 'build_tmp');
const buildDir = path.join(clientDir, 'build');
const bestzipBin = process.platform === 'win32'
  ? path.join(repoRoot, 'node_modules', '.bin', 'bestzip.cmd')
  : path.join(repoRoot, 'node_modules', '.bin', 'bestzip');
const distDir = path.join(repoRoot, 'dist');

function exists(p) { try { return fs.existsSync(p); } catch { return false; } }

function run(cmd, cwd = repoRoot) {
  execSync(cmd, { stdio: 'inherit', cwd, windowsHide: true, shell: true });
}

(async () => {
  try {
    let target = null;

    // If neither build_tmp nor build exists, run a build first
    if (!exists(buildTmp) && !exists(buildDir)) {
      run('npm run build', clientDir);
    }

    // Prefer build_tmp if present (pre-swap), else use build (post-swap)
    if (exists(buildTmp)) {
      target = buildTmp;
    } else if (exists(buildDir)) {
      target = buildDir;
    }

    if (!target) {
      console.error('zip-client-build: No client build directory found (looked for build_tmp and build)');
      process.exit(1);
    }

    // Ensure dist exists
    if (!exists(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Zip the chosen target
    const out = path.join(distDir, 'expense-tracker-client-build.zip');
    const relTarget = path.relative(repoRoot, target);
    console.log('zip-client-build: zipping', relTarget);
    run(`"${bestzipBin}" "${out}" "${relTarget}" -r`);
    console.log('zip-client-build: packaged', target);
  } catch (e) {
    console.error('zip-client-build: failed', e && e.message);
    process.exit(1);
  }
})();
