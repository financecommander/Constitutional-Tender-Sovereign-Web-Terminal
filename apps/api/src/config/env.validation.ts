export interface EnvConfig {
  AUTH0_ISSUER_URL: string;
  AUTH0_AUDIENCE: string;
  DATABASE_URL: string;
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;

  // Optional integration keys
  METALS_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  KYC_PROVIDER: string;
  EMAIL_PROVIDER: string;
}

const REQUIRED_VARS = [
  'AUTH0_ISSUER_URL',
  'AUTH0_AUDIENCE',
  'DATABASE_URL',
] as const;

export function validateEnv(): EnvConfig {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill in the values.',
    );
  }

  return {
    AUTH0_ISSUER_URL: process.env.AUTH0_ISSUER_URL!,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE!,
    DATABASE_URL: process.env.DATABASE_URL!,
    PORT: parseInt(process.env.PORT || '4000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Optional — gracefully fall back to demo mode if not set
    METALS_API_KEY: process.env.METALS_API_KEY || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    KYC_PROVIDER: process.env.KYC_PROVIDER || 'demo',
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'console',
  };
}
