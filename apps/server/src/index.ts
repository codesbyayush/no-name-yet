import { RPCHandler } from '@orpc/server/fetch';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getAuth } from './lib/auth';
import { getEnvFromContext } from './lib/env';
import { adminRouter } from './orpc/admin';
import { createAdminContext, createContext } from './orpc/context';
import { apiRouter } from './orpc/index';
import v1Router from './rest';
import githubWebhooks from './webhooks/github';

const app = new Hono();

const authRouter = new Hono();

// NOTE: we need to look up the auth types this custom method throws error
authRouter.all('*', async (c) => {
  try {
    const env = getEnvFromContext(c);
    const auth = getAuth(env);
    return await auth.handler(c.req.raw);
  } catch (error) {
    return c.json(
      {
        error: 'Auth failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

app.use(logger());

app.use(
  '/api/v1/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Public-Key'],
    credentials: false,
    maxAge: 86_400,
  })
);

app.use(
  '/rpc/*',
  cors({
    origin: (origin, c) => {
      const env = getEnvFromContext(c);
      const allowList = [env.FRONTEND_URL, env.CORS_ORIGIN].filter(Boolean);
      if (!origin) {
        return `https://${env.FRONTEND_URL}`;
      }
      const allowed = allowList.some((d) => origin.endsWith(d as string));
      return allowed ? origin : `https://${env.FRONTEND_URL}`;
    },
    allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
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
  })
);

// 3) Admin RPC (same policy as RPC)
app.use(
  '/admin/*',
  cors({
    origin: (origin, c) => {
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
  })
);

app.use(
  '/api/auth/*',
  cors({
    origin: (origin, c) => {
      const env = getEnvFromContext(c);
      return origin.endsWith(env.CORS_ORIGIN)
        ? origin
        : `https://${env.FRONTEND_URL}`;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-ID',
      'X-Public-Key',
      'Cookie',
      'Set-Cookie',
      'X-Requested-With',
    ],
    exposeHeaders: ['Set-Cookie'],
    credentials: true,
    maxAge: 86_400, // 24 hours
  })
);

app.get('/docs', (c) => c.redirect('/api/docs'));

app.route('/api/auth', authRouter);
app.route('/api/v1', v1Router);
app.route('/api/webhooks', githubWebhooks);

// oRPC Handler for regular API routes
const rpcHandler = new RPCHandler(apiRouter);
app.use('/rpc/*', async (c, next) => {
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
    return c.newResponse(response.body, response);
  }
  await next();
});

// oRPC Handler for admin routes
const adminRpcHandler = new RPCHandler(adminRouter);
app.use('/admin/*', async (c, next) => {
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
    return c.newResponse(response.body, response);
  }
  await next();
});

app.get('/ping', (c) => c.text('pong'));

const isLocalEnvironment =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
const isWorkersEnvironment =
  typeof globalThis !== 'undefined' &&
  (globalThis as any).__CLOUDFLARE_WORKER__;

const createExport = async () => {
  if (isLocalEnvironment && !isWorkersEnvironment) {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');

    // TLS configuration for HTTPS in development
    const tlsConfig = {
      key: readFileSync(
        resolve(import.meta.dir, '../certs/localhost+2-key.pem')
      ),
      cert: readFileSync(resolve(import.meta.dir, '../certs/localhost+2.pem')),
    };

    return {
      port: 8080,
      fetch: app.fetch,
      tls: tlsConfig,
    };
  }

  // Production/Workers environment
  return app;
};

export default await createExport();
