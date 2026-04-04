const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

let initialized = false;

export function initSentryClient() {
  if (!SENTRY_DSN || initialized || typeof window === 'undefined') return;

  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  });

  initialized = true;
}

export function captureClientException(error: Error | unknown) {
  if (!SENTRY_DSN) {
    console.error('[Client Error]', error);
    return;
  }

  import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureException(error);
  });
}
