import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  const env = validateEnv();

  const app = await NestFactory.create(AppModule, {
    // Enable raw body for Stripe webhook signature verification
    rawBody: true,
  });

  // ==================
  // Security Hardening
  // ==================

  // Helmet: sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
  try {
    const helmet = require('helmet');
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", env.FRONTEND_URL],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      }),
    );
  } catch {
    // helmet not installed — skip security headers
  }

  // CORS — restrict to frontend origin
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    maxAge: 86400,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Prisma exception filter
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Disable X-Powered-By header
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && typeof httpAdapter.getInstance === 'function') {
    const expressApp = httpAdapter.getInstance();
    if (expressApp && typeof expressApp.disable === 'function') {
      expressApp.disable('x-powered-by');
    }
  }

  await app.listen(env.PORT);
}
bootstrap();
