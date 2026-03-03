type EventName =
  | 'page_viewed'
  | 'market_viewed'
  | 'product_viewed'
  | 'offer_selected'
  | 'quote_locked'
  | 'quote_expired'
  | 'checkout_started'
  | 'order_submitted'
  | 'receipt_viewed'
  | 'kyc_started'
  | 'login_started'
  | 'signup_started';

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(name: EventName, data?: EventData) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[analytics] ${name}`, data || {});
  }

  // Send to backend analytics endpoint when available
  try {
    const payload = {
      event: name,
      properties: data || {},
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
    };

    // Fire and forget — don't block UI
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      navigator.sendBeacon(
        `${API_BASE}/api/analytics/event`,
        JSON.stringify(payload),
      );
    }
  } catch {
    // Silently fail — analytics should never break the app
  }
}

export function trackPageView(page: string) {
  trackEvent('page_viewed', { page });
}
