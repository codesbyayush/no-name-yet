#!/usr/bin/env bun
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { $ } from 'bun';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(scriptDir);

const envTargets = [
  { example: 'apps/server/.env.example', target: 'apps/server/.env' },
  { example: 'apps/admin/.env.example', target: 'apps/admin/.env' },
  { example: 'apps/public/.env.example', target: 'apps/public/.env' },
  { example: 'apps/widget/.env.example', target: 'apps/widget/.env' },
];

const args = new Set(process.argv.slice(2));
const shouldInstall = !args.has('--no-install');
const shouldStartDocker = !args.has('--no-docker');

function ensureEnvFile(examplePath: string, targetPath: string) {
  const fullExample = join(projectRoot, examplePath);
  const fullTarget = join(projectRoot, targetPath);

  if (!existsSync(fullExample)) {
    console.info(`ℹ️  Skipping ${targetPath} (missing ${examplePath})`);
    return;
  }

  if (existsSync(fullTarget)) {
    console.info(`✅ ${targetPath} already exists`);
    return;
  }

  const targetDir = dirname(fullTarget);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  copyFileSync(fullExample, fullTarget);
  console.info(`✨ Copied ${examplePath} → ${targetPath}`);
}

async function main() {
  console.info('🚀 Bootstrapping workspace...');

  for (const entry of envTargets) {
    ensureEnvFile(entry.example, entry.target);
  }

  if (shouldInstall) {
    console.info('📦 Installing dependencies (bun install)...');
    await $`bun install`;
  } else {
    console.info('⏭ Skipping dependency install (--no-install)');
  }

  if (shouldStartDocker) {
    console.info('🐘 Starting local database (docker compose up)...');
    await $`docker compose up -d postgres neon-proxy redis`;
  } else {
    console.info('⏭ Skipping docker compose (--no-docker)');
  }

  console.info('✅ Bootstrap complete!');
}

main().catch((error) => {
  console.error('❌ Bootstrap failed', error);
  process.exit(1);
});
