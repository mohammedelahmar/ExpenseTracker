/*
  Build a sanitized source package for distribution:
  - Includes: client/src, client/public, client/package.json, client/README.md,
              client/tailwind.config.js, client/postcss.config.js,
              client/cypress.config.js, client/cypress,
              server (excluding secrets and heavy/irrelevant folders),
              root README.md, LICENSE, docs/
  - Excludes: any .env files, uploads/, tmp/, coverage/, node_modules/, build outputs, logs
*/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const clientDir = path.join(repoRoot, 'client');
const serverDir = path.join(repoRoot, 'server');
const distDir = path.join(repoRoot, 'dist');
const stagingDir = path.join(distDir, 'source_staging');
const bestzipBin = process.platform === 'win32'
  ? path.join(repoRoot, 'node_modules', '.bin', 'bestzip.cmd')
  : path.join(repoRoot, 'node_modules', '.bin', 'bestzip');

function run(cmd, cwd = repoRoot) {
  execSync(cmd, { stdio: 'inherit', cwd, windowsHide: true, shell: true });
}

function exists(p) { try { return fs.existsSync(p); } catch { return false; } }
function rmrf(p) { try { fs.rmSync(p, { recursive: true, force: true }); } catch {} }
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }

function copyFile(src, dest) {
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest, options = {}) {
  const {
    ignore = [], // array of predicate functions (srcPath, entry) => boolean
  } = options;
  mkdirp(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    const shouldIgnore = ignore.some(fn => {
      try { return fn(s, entry); } catch { return false; }
    });
    if (shouldIgnore) continue;
    if (entry.isDirectory()) {
      copyDir(s, d, options);
    } else if (entry.isFile()) {
      copyFile(s, d);
    }
  }
}

// Ignore rules for server
const serverIgnorePredicates = [
  (p) => /\\node_modules$|\/node_modules$/.test(p),
  (p) => /\\coverage$|\/coverage$/.test(p),
  (p) => /\\uploads$|\/uploads$/.test(p),
  (p) => /\\tmp$|\/tmp$/.test(p),
  (p, e) => e.isFile() && /\.log$/.test(p),
  (p, e) => e.isFile() && /(^|\\|\/)\.env(\..*)?$/.test(p), // .env, .env.*
];

(async () => {
  try {
    // Ensure dist and clean staging
    mkdirp(distDir);
    rmrf(stagingDir);
    mkdirp(stagingDir);

    // Copy client parts
    const clientOut = path.join(stagingDir, 'client');
    mkdirp(clientOut);
    const clientFiles = [
      ['src', true],
      ['public', true],
      ['package.json', false],
      ['README.md', false],
      ['tailwind.config.js', false],
      ['postcss.config.js', false],
      ['cypress.config.js', false],
      ['cypress', true],
      ['scripts', true],
    ];
    for (const [rel, isDir] of clientFiles) {
      const s = path.join(clientDir, rel);
      if (!exists(s)) continue;
      const d = path.join(clientOut, rel);
      if (isDir) copyDir(s, d); else copyFile(s, d);
    }

    // Copy server with ignores
    const serverOut = path.join(stagingDir, 'server');
    copyDir(serverDir, serverOut, { ignore: serverIgnorePredicates });

    // Copy root docs
    const rootFiles = [
      ['README.md', false],
      ['LICENSE', false],
    ];
    for (const [rel, isDir] of rootFiles) {
      const s = path.join(repoRoot, rel);
      if (!exists(s)) continue;
      const d = path.join(stagingDir, rel);
      if (isDir) copyDir(s, d); else copyFile(s, d);
    }
    const docsDir = path.join(repoRoot, 'docs');
    if (exists(docsDir)) copyDir(docsDir, path.join(stagingDir, 'docs'));

    // Zip staging contents (zip everything inside stagingDir)
    const outZip = path.join(distDir, 'expense-tracker-source.zip');
    // Bestzip from inside staging so the zip root is clean
    run(`"${bestzipBin}" "${outZip}" * -r`, stagingDir);

    // Optional cleanup of staging (keep for inspection on CI or remove)
    rmrf(stagingDir);
    console.log('package-source: created', outZip);
  } catch (e) {
    console.error('package-source: failed', e && e.message);
    process.exit(1);
  }
})();
