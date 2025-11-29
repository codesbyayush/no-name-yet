/**
 * Centralized logging with Pino
 *
 * Features:
 * - Pretty output in development (pino-pretty)
 * - JSON output in production
 * - Sentry integration for error tracking
 * - `operational` flag to skip Sentry for expected failures
 *
 * Usage:
 *   logger.error('message', { scope: 'auth', context: {...} })
 *   logger.error('message', { scope: 'auth', operational: true }) // Won't send to Sentry
 *   logger.info('message', { scope: 'service' })
 */

import * as Sentry from '@sentry/cloudflare';
import pino from 'pino';

export interface LogOptions {
  scope?: string;
  context?: Record<string, unknown>;
  error?: unknown;
  /**
   * Mark as operational error (expected failure)
   * When true, error won't be sent to Sentry
   * @default false
   */
  operational?: boolean;
}

// Environment detection
const isWorkersEnvironment =
  typeof globalThis !== 'undefined' &&
  (globalThis as { __CLOUDFLARE_WORKER__?: boolean }).__CLOUDFLARE_WORKER__;

const isDevelopment =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

// Create Pino instance with appropriate transport
const pinoInstance = pino({
  level: isDevelopment ? 'debug' : 'info',
  ...(isDevelopment &&
    !isWorkersEnvironment && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
          messageFormat: '{scope} {msg}',
          customColors: 'error:red,warn:yellow,info:blue,debug:gray',
        },
      },
    }),
});

function formatError(error: unknown): Record<string, unknown> | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    const formatted: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    if (error.cause) {
      formatted.cause = formatError(error.cause);
    }
    return formatted;
  }

  return { message: String(error) };
}

function sendToSentry(
  message: string,
  options?: LogOptions,
  level: 'error' | 'warning' = 'error',
) {
  if (!isWorkersEnvironment || options?.operational) return;

  try {
    const errorObj =
      options?.error instanceof Error ? options.error : undefined;

    if (errorObj && Sentry.captureException) {
      Sentry.captureException(errorObj, {
        extra: options?.context,
        tags: { source: options?.scope ?? 'logger' },
        level,
      });
    } else if (Sentry.captureMessage) {
      Sentry.captureMessage(message, {
        extra: options?.context,
        tags: { source: options?.scope ?? 'logger' },
        level,
      });
    }
  } catch (sentryError) {
    pinoInstance.error({ err: sentryError }, 'Failed to send to Sentry');
  }
}

function createLogData(options?: LogOptions): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  if (options?.scope) {
    data.scope = `[${options.scope}]`;
  }
  if (options?.context) {
    data.context = options.context;
  }
  if (options?.error) {
    data.err = formatError(options.error);
  }
  if (options?.operational) {
    data.operational = true;
  }

  return data;
}

export const logger = {
  error: (message: string, options?: LogOptions) => {
    pinoInstance.error(createLogData(options), message);
    sendToSentry(message, options, 'error');
  },

  warn: (message: string, options?: LogOptions) => {
    pinoInstance.warn(createLogData(options), message);
    sendToSentry(message, options, 'warning');
  },

  info: (message: string, options?: LogOptions) => {
    pinoInstance.info(createLogData(options), message);
  },

  debug: (message: string, options?: LogOptions) => {
    pinoInstance.debug(createLogData(options), message);
  },
};

export type Logger = typeof logger;
