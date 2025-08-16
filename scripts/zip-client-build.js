/*
  Zip client build in a Windows-friendly way:
  - Prefer client/build_tmp if exists (created by our Windows-safe build)
  - Else fall back to client/build
  - If neither exists, trigger a build in client and use build_tmp
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

function exists(p) { try { return fs.existsSync(p); } catch { return false; } }

function run(cmd, cwd = repoRoot) {
  execSync(cmd, { stdio: 'inherit', cwd, windowsHide: true, shell: true });
}

(async () => {
  try {
    let target = null;
    if (!exists(buildTmp)) {
      // Build into build_tmp to avoid locks
      run('npm run build', clientDir);
    }
  if (exists(buildTmp)) target = buildTmp;

    if (!target) {
      console.error('zip-client-build: No client build directory found');
      process.exit(1);
    }

    // Zip the chosen target
  const out = path.join(repoRoot, 'dist', 'expense-tracker-client-build.zip');
  const relTarget = path.relative(repoRoot, target);
  console.log('zip-client-build: zipping', relTarget);
  run(`"${bestzipBin}" "${out}" "${relTarget}" -r`);
    console.log('zip-client-build: packaged', target);
  } catch (e) {
    console.error('zip-client-build: failed', e && e.message);
    process.exit(1);
  }
})();
