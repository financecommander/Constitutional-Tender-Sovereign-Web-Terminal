import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '../../prisma.service';

/**
 * JWT Strategy for Auth0 RS256 token verification
 *
 * This strategy:
 * - Validates JWT tokens signed with RS256 algorithm
 * - Fetches public keys from Auth0's JWKS endpoint
 * - Resolves the DB user ID from the Auth0 ID
 * - Extracts permissions for RBAC
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    // Validate required environment variables
    const issuerUrl = process.env.AUTH0_ISSUER_URL;
    const audience = process.env.AUTH0_AUDIENCE;

    if (!issuerUrl) {
      throw new Error(
        'AUTH0_ISSUER_URL environment variable is required. ' +
          'Please set it in your .env file (e.g., https://your-domain.auth0.com/)',
      );
    }

    if (!audience) {
      throw new Error(
        'AUTH0_AUDIENCE environment variable is required. ' +
          'Please set it in your .env file (e.g., https://your-api-identifier.com)',
      );
    }

    // Normalize issuer URL (remove trailing slash)
    const normalizedIssuer = issuerUrl.replace(/\/$/, '');

    super({
      // Extract token from Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Enable caching of signing keys
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${normalizedIssuer}/.well-known/jwks.json`,
      }),

      // Validate the audience claim
      audience: audience,

      // Validate the issuer claim
      issuer: normalizedIssuer,

      // Specify allowed algorithms (RS256 only for security)
      algorithms: ['RS256'],
    });
  }

  /**
   * Validates the JWT payload and returns user object.
   * This user object will be attached to request.user.
   *
   * Also resolves the DB user ID by looking up the Auth0 ID,
   * so downstream code can use user.dbUserId directly.
   */
  async validate(payload: Record<string, unknown>) {
    // Validate required claims
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing subject claim');
    }

    const authId = payload.sub as string;
    const email = payload.email as string | undefined;

    // Extract permissions from token (Auth0 convention)
    const customNamespace = process.env.AUTH0_CUSTOM_NAMESPACE || '';
    const permissions =
      (payload.permissions as string[]) ||
      (customNamespace
        ? (payload[`${customNamespace}/permissions`] as string[])
        : []) ||
      [];

    // Extract user metadata if using custom claims
    const metadata = customNamespace
      ? ((payload[`${customNamespace}/user_metadata`] as Record<string, unknown>) || {})
      : {};

    // Resolve DB user ID from Auth0 ID
    let dbUserId: string | null = null;
    try {
      const dbUser = await this.prisma.user.findUnique({
        where: { authId },
        select: { id: true },
      });
      dbUserId = dbUser?.id || null;
    } catch {
      // DB lookup failed — continue with null dbUserId
      // (the user may not exist in DB yet, will be created on getProfile)
    }

    return {
      authId,
      email,
      permissions,
      metadata,
      dbUserId,
    };
  }
}
