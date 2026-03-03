/**
 * Sentry Client-Side Error Monitoring - Placeholder
 *
 * To enable Sentry on the frontend:
 * 1. npm install @sentry/nextjs in apps/web
 * 2. Set NEXT_PUBLIC_SENTRY_DSN environment variable
 * 3. Uncomment the initialization below
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

let initialized = false;

export function initSentryClient() {
  if (!SENTRY_DSN || initialized || typeof window === 'undefined') return;

  // Uncomment when @sentry/nextjs is installed:
  // import('@sentry/nextjs').then((Sentry) => {
  //   Sentry.init({
  //     dsn: SENTRY_DSN,
  //     environment: process.env.NODE_ENV || 'development',
  //     tracesSampleRate: 0.1,
  //     replaysSessionSampleRate: 0.1,
  //     replaysOnErrorSampleRate: 1.0,
  //   });
  // });

  initialized = true;
}

export function captureClientException(error: Error | unknown) {
  if (!SENTRY_DSN) {
    console.error('[Client Error]', error);
    return;
  }

  // Uncomment when @sentry/nextjs is installed:
  // import('@sentry/nextjs').then((Sentry) => {
  //   Sentry.captureException(error);
  // });
  console.error('[Sentry Client] Exception:', error);
}
