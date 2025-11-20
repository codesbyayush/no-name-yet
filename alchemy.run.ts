import alchemy from 'alchemy';
import { VersionMetadata, Vite, Worker } from 'alchemy/cloudflare';
import { CloudflareStateStore } from 'alchemy/state';

const app = await alchemy('openfeedback', {
  // Using CloudflareStateStore for persistent state in CI environments
  // Uses CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from environment
  // Uses ALCHEMY_STATE_TOKEN from environment (or generates one if not set)
  stateStore: (scope) => new CloudflareStateStore(scope),
});

// Build steps - run before deploying workers
// This ensures dist folders are ready for deployment
async function buildApps() {
  const { spawn } = await import('bun');

  // Run database migrations
  if (process.env.DATABASE_URL) {
    console.log('Running database migrations...');
    const migrate = spawn({
      cmd: ['bun', 'run', 'db:migrate'],
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      stdout: 'inherit',
      stderr: 'inherit',
    });
    const migrateExitCode = await migrate.exited;
    if (migrateExitCode !== 0) {
      throw new Error(
        `Database migration failed with exit code ${migrateExitCode}`,
      );
    }
  } else {
    console.warn('DATABASE_URL not set, skipping database migrations');
  }
}

// Run builds before deploying
await buildApps();

// Upload Sentry sourcemaps for server before deploying
if (process.env.SENTRY_AUTH_TOKEN) {
  console.log('Uploading Sentry sourcemaps...');
  const { spawn } = await import('bun');
  const sentryUpload = spawn({
    cmd: ['bun', 'run', '--filter', 'server', 'sentry:sourcemaps'],
    cwd: process.cwd(),
    env: {
      ...process.env,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    },
    stdout: 'inherit',
    stderr: 'inherit',
  });
  const sentryExitCode = await sentryUpload.exited;
  if (sentryExitCode !== 0) {
    throw new Error(
      `Sentry sourcemaps upload failed with exit code ${sentryExitCode}`,
    );
  }
} else {
  console.warn('SENTRY_AUTH_TOKEN not set, skipping Sentry sourcemaps upload');
}

// Reference existing KV namespace by ID (from apps/server/wrangler.toml)
const existingKVNamespaceId = '019d1859a7f64115a889f397093cc94f';

// Define public worker (static assets) - using Website for static assets support
const publicWorker = await Vite('public', {
  name: 'public',
  compatibilityDate: '2025-02-13',
  assets: './apps/public/dist',
  build: {
    command: 'bun run build:public',
    env: {
      VITE_BACKEND_SERVER_URL:
        process.env.VITE_BACKEND_SERVER_URL || process.env.BACKEND_URL || '',
      VITE_ADMIN_URL: process.env.VITE_ADMIN_URL || process.env.ADMIN_URL || '',
      VITE_ROOT_HOST: process.env.VITE_ROOT_HOST || process.env.ROOT_HOST || '',
      VITE_ADMIN_ROOT_URL:
        process.env.VITE_ADMIN_ROOT_URL || process.env.ADMIN_ROOT_URL || '',
    },
  },
  routes: [
    { pattern: '*.openfeedback.tech/*' },
    { pattern: 'openfeedback.tech/*' },
  ],
  domains: [{ domainName: 'openfeedback.tech', adopt: true }],
});

// Define admin worker (static assets) - using Website for static assets support
const adminWorker = await Vite('admin', {
  name: 'admin',
  compatibilityDate: '2025-02-13',
  assets: './apps/admin/dist',
  build: {
    command: 'bun run build:admin',
    env: {
      VITE_BACKEND_SERVER_URL:
        process.env.VITE_BACKEND_SERVER_URL || process.env.BACKEND_URL || '',
    },
  },

  routes: [{ pattern: 'app.openfeedback.tech/*' }],
});

// Define API worker (script-based)
const apiWorker = await Worker('api', {
  name: 'api',
  compatibilityDate: '2025-02-13',
  compatibilityFlags: ['nodejs_compat'],
  entrypoint: './apps/server/src/index.ts',
  bindings: {
    // Cloudflare version metadata binding (for Sentry release tracking)
    CF_VERSION_METADATA: VersionMetadata(),
    // Reference existing KV namespace by ID
    OF_STORE: {
      type: 'kv_namespace',
      id: existingKVNamespaceId,
    },
    // Runtime environment variables
    DATABASE_URL: process.env.DATABASE_URL || '',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '',
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '',
    FRONTEND_URL: process.env.FRONTEND_URL || '',
    RESEND_DOMAIN_KEY: process.env.RESEND_DOMAIN_KEY || '',
    GH_APP_ID: process.env.GH_APP_ID || '',
    GH_PRIVATE_KEY: process.env.GH_PRIVATE_KEY || '',
    GH_WEBHOOK_SECRET: process.env.GH_WEBHOOK_SECRET || '',
    GH_APP_NAME: process.env.GH_APP_NAME || '',
    NODE_ENV: process.env.NODE_ENV || 'production',
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || '',
  },
  routes: [{ pattern: 'api.openfeedback.tech/*' }],
  observability: {
    enabled: true,
  },
});

await app.finalize();
