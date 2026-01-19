#!/usr/bin/env node

/**
 * Toggle between local development packages and S3 production packages
 *
 * This script only updates package.json. The shell script (toggle-packages.sh)
 * handles building, cleaning, and installing.
 *
 * Usage:
 *   node scripts/toggle-packages.js dev    # Update to local packages
 *   node scripts/toggle-packages.js prod   # Update to S3 packages
 *   node scripts/toggle-packages.js status # Show current mode
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

// Relative path from full-example to hiyve-components packages
const COMPONENTS_PATH = '../../hiyve-components/packages';

const HIYVE_PACKAGES = [
  'audio-monitor',
  'chat',
  'client-provider',
  'control-bar',
  'device-selector',
  'file-manager',
  'mood-analysis',
  'participant-list',
  'recording',
  'sidebar',
  'transcription',
  'video-grid',
  'video-tile',
  'waiting-room',
];

const S3_BASE = 'https://s3.amazonaws.com/muzie.media/npm-registry';

function getLocalPath(pkg) {
  return `file:${COMPONENTS_PATH}/${pkg}`;
}

function getS3Path(pkg) {
  return `${S3_BASE}/hiyve-${pkg}/hiyve-${pkg}-latest.tgz`;
}

function readPackageJson() {
  return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
}

function writePackageJson(pkg) {
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n');
}

function getCurrentMode(pkg) {
  const firstHiyve = pkg.dependencies['@hiyve/control-bar'];
  if (firstHiyve?.startsWith('file:')) return 'dev';
  if (firstHiyve?.includes('s3.amazonaws.com')) return 'prod';
  return 'unknown';
}

function setMode(mode) {
  const pkg = readPackageJson();
  const currentMode = getCurrentMode(pkg);

  if (currentMode === mode) {
    console.log(`Already in ${mode} mode`);
    return;
  }

  for (const name of HIYVE_PACKAGES) {
    const key = `@hiyve/${name}`;
    if (pkg.dependencies[key]) {
      pkg.dependencies[key] = mode === 'dev' ? getLocalPath(name) : getS3Path(name);
    }
  }

  writePackageJson(pkg);
  console.log(`Updated package.json to ${mode.toUpperCase()} mode`);
}

function showStatus() {
  const pkg = readPackageJson();
  const mode = getCurrentMode(pkg);

  console.log(`\nCurrent mode: ${mode.toUpperCase()}\n`);
  console.log('Package sources:');

  for (const name of HIYVE_PACKAGES) {
    const key = `@hiyve/${name}`;
    const value = pkg.dependencies[key];
    if (value) {
      const source = value.startsWith('file:') ? 'LOCAL' : 'S3';
      console.log(`  ${key}: ${source}`);
    } else {
      console.log(`  ${key}: \x1b[33mNOT IN PACKAGE.JSON\x1b[0m`);
    }
  }
  console.log('');
}

// Main
const command = process.argv[2];

switch (command) {
  case 'dev':
    setMode('dev');
    break;
  case 'prod':
    setMode('prod');
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log(`
Usage: node scripts/toggle-packages.js <command>

Commands:
  dev     Update package.json to use local packages
  prod    Update package.json to use S3 packages
  status  Show current mode and package sources
`);
}
