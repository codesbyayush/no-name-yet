import { RPCHandler } from '@orpc/server/fetch';
import * as Sentry from '@sentry/cloudflare';
import { type Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { getAuth } from './lib/auth';
import { type AppEnv, getEnvFromContext } from './lib/env';
import { logger } from './lib/logger';
import { adminRouter } from './orpc/admin';
import { createAdminContext, createContext } from './orpc/context';
import { apiRouter } from './orpc/index';
import v1Router from './rest';
import githubWebhooks from './webhooks/github';

const app = new Hono();

const authRouter = new Hono();

app.use(secureHeaders());

const HTTP_STATUS = {
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Global error handler
app.onError((err, c) => {
  const env = getEnvFromContext(c);
  logger.error('Error occurred', {
    scope: 'hono',
    error: err instanceof Error ? err : new Error(String(err)),
    context: {
      path: c.req.path,
      method: c.req.method,
      url: c.req.url,
      headers: Object.fromEntries(c.req.raw.headers.entries()),
    },
  });

  return c.json(
    {
      error: 'Internal server error',
      message: env.NODE_ENV === 'development' ? err.message : undefined,
    },
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
  );
});

const corsOptions = {
  origin: (origin: string, c: Context) => {
    const env = getEnvFromContext(c);
    const allowList = [env.FRONTEND_URL, env.CORS_ORIGIN].filter(Boolean);
    if (!origin) {
      return `https://${env.FRONTEND_URL}`;
    }
    const allowed = allowList.some((d) => origin.endsWith(d as string));
    return allowed ? origin : `https://${env.FRONTEND_URL}`;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Tenant-ID',
    'Cookie',
    'Set-Cookie',
    'X-Requested-With',
  ],
  exposeHeaders: ['Set-Cookie'],
  credentials: true,
  maxAge: 86_400,
};

// NOTE: we need to look up the auth types this custom method throws error
authRouter.all('*', async (c) => {
  try {
    const env = getEnvFromContext(c);
    const auth = getAuth(env);
    return await auth.handler(c.req.raw);
  } catch (error) {
    logger.error('Error occurred', {
      scope: 'auth',
      context: {
        path: c.req.path,
        error,
      },
    });
    return c.json({ error: 'Auth failed' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

app.use(
  '/api/v1/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Public-Key'],
    credentials: false,
    maxAge: 86_400,
  }),
);

app.use(
  '/api/auth/*',
  cors({
    ...corsOptions,
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-ID',
      'Cookie',
      'Set-Cookie',
      'X-Requested-With',
      'X-Public-Key',
    ],
  }),
);

app.route('/api/auth', authRouter);
app.route('/api/v1', v1Router);
app.route('/api/webhooks', githubWebhooks);

// oRPC Handler for regular API public routes
const rpcHandler = new RPCHandler(apiRouter);
app.use('/rpc/*', cors(corsOptions), async (c, next) => {
  const env = getEnvFromContext(c);
  const context = await createContext({
    context: c,
    env,
  });
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
    context,
  });
  if (matched) {
    return response;
  }
  await next();
});

// oRPC Handler for admin routes
const adminRpcHandler = new RPCHandler(adminRouter);
app.use('/admin/*', cors(corsOptions), async (c, next) => {
  const env = getEnvFromContext(c);
  const context = await createAdminContext({
    context: c,
    env,
  });
  const { matched, response } = await adminRpcHandler.handle(c.req.raw, {
    prefix: '/admin',
    context,
  });
  if (matched) {
    return response;
  }
  await next();
});

const isLocalEnvironment =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
const isWorkersEnvironment =
  typeof globalThis !== 'undefined' &&
  (globalThis as { __CLOUDFLARE_WORKER__?: boolean }).__CLOUDFLARE_WORKER__;

const createExport = async () => {
  if (isLocalEnvironment && !isWorkersEnvironment) {
    const tlsConfig = {
      key: Bun.file(`${import.meta.dir}/../certs/localhost+2-key.pem`),
      cert: Bun.file(`${import.meta.dir}/../certs/localhost+2.pem`),
    };

    return {
      port: 8080,
      fetch: app.fetch,
      tls: tlsConfig,
    };
  }

  // Production/Workers environment - wrap with Sentry
  return Sentry.withSentry<AppEnv>((env) => {
    const { id: versionId } = env.CF_VERSION_METADATA;

    return {
      dsn: env.SENTRY_DSN,
      release: versionId,
      environment: env.NODE_ENV || 'production',
      tracesSampleRate: 1.0,
      enableLogs: true,
      sendDefaultPii: true,
    };
  }, app);
};

export default await createExport();
