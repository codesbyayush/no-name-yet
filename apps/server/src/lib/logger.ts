/**
 * Unified error logging utility that handles both local logging and Sentry reporting
 * Automatically detects environment and routes logs appropriately
 */

import * as Sentry from '@sentry/cloudflare';

interface ErrorLogOptions {
  scope?: string;
  context?: Record<string, unknown>;
  error?: Error;
}

// Detect environment
const isWorkersEnvironment =
  typeof globalThis !== 'undefined' &&
  (globalThis as { __CLOUDFLARE_WORKER__?: boolean }).__CLOUDFLARE_WORKER__;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  black: '\x1b[30m',
} as const;

function formatValue(value: unknown): string {
  return typeof value === 'object' && value !== null
    ? JSON.stringify(value, null, 2)
    : String(value);
}

export const logger = {
  error: (message: string, options?: ErrorLogOptions & { error?: unknown }) => {
    const { error: err, scope, context } = options ?? {};
    const c = colors;
    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    const timestamp = `${c.dim}${time}${c.reset}`;
    const level = `${c.bgRed}${c.black}${c.bright} ERROR ${c.reset}`;
    const scopeStr = scope
      ? `${c.blue}${c.bright}[${scope}]${c.reset}`
      : `[${scope}]`;
    const msg = `${c.red}${c.bright}${message}${c.reset}`;

    let log = [timestamp, level, scopeStr, msg].filter(Boolean).join(' ');

    if (err instanceof Error) {
      const errorLines = [
        `${c.red}${c.bright}Error: ${err.name}${c.reset}`,
        `${c.red}Message: ${err.message}${c.reset}`,
      ];
      if (err.stack) {
        errorLines.push(
          `${c.dim}Stack trace:${c.reset}`,
          ...err.stack.split('\n').map((line) => `${c.dim}${line}${c.reset}`),
        );
      }
      log += `\n${errorLines.join('\n')}`;
    } else if (err !== undefined) {
      log += `\nError: ${String(err)}`;
    }

    if (context && Object.keys(context).length > 0) {
      const formatted = Object.entries(context)
        .map(([key, value]) => {
          const val = formatValue(value);
          return `  ${c.cyan}${key}${c.reset}: ${c.white}${val}${c.reset}`;
        })
        .join('\n');
      log += `\n${c.dim}Context:${c.reset}\n${formatted}`;
    }

    console.error(log);

    // Send to Sentry (only in workers environment where Sentry is initialized)
    if (isWorkersEnvironment) {
      try {
        const errorObj = err instanceof Error ? err : undefined;
        if (errorObj && Sentry.captureException) {
          Sentry.captureException(errorObj, {
            extra: context,
            tags: { source: scope ?? 'logger' },
            level: 'error',
          });
        } else if (Sentry.captureMessage) {
          Sentry.captureMessage(message, {
            extra: context,
            tags: { source: scope ?? 'logger' },
            level: 'error',
          });
        }
      } catch (error) {
        console.error('Error sending to Sentry', error);
      }
    }
  },
};
