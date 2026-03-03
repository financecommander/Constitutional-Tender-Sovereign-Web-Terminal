/**
 * Sentry Error Monitoring - Placeholder
 *
 * To enable Sentry:
 * 1. npm install @sentry/node in apps/api
 * 2. Set SENTRY_DSN environment variable
 * 3. Uncomment the initialization below
 *
 * Usage:
 *   import { captureException, captureMessage } from './common/sentry';
 *   captureException(error);
 *   captureMessage('Something happened');
 */

// import * as Sentry from '@sentry/node';

const SENTRY_DSN = process.env.SENTRY_DSN || '';

let initialized = false;

export function initSentry() {
  if (!SENTRY_DSN || initialized) return;

  // Uncomment when @sentry/node is installed:
  // Sentry.init({
  //   dsn: SENTRY_DSN,
  //   environment: process.env.NODE_ENV || 'development',
  //   tracesSampleRate: 0.1,
  //   integrations: [
  //     Sentry.httpIntegration(),
  //   ],
  // });

  initialized = true;
  console.log('[Sentry] Initialized error monitoring');
}

export function captureException(error: Error | unknown, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    console.error('[Error]', error, context);
    return;
  }

  // Uncomment when @sentry/node is installed:
  // Sentry.captureException(error, { extra: context });
  console.error('[Sentry] Exception captured:', error, context);
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!SENTRY_DSN) {
    console.log(`[${level}]`, message);
    return;
  }

  // Uncomment when @sentry/node is installed:
  // Sentry.captureMessage(message, level);
  console.log(`[Sentry] ${level}:`, message);
}
