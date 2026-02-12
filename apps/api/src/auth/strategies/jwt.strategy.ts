import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

/**
 * JWT Strategy for Auth0 RS256 token verification
 * 
 * This strategy:
 * - Validates JWT tokens signed with RS256 algorithm
 * - Fetches public keys from Auth0's JWKS endpoint
 * - Extracts user information from token payload
 * - Supports future RBAC by including permissions in user object
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Validate required environment variables
    const issuerUrl = process.env.AUTH0_ISSUER_URL;
    const audience = process.env.AUTH0_AUDIENCE;

    if (!issuerUrl) {
      throw new Error(
        'AUTH0_ISSUER_URL environment variable is required. ' +
        'Please set it in your .env file (e.g., https://your-domain.auth0.com/)'
      );
    }

    if (!audience) {
      throw new Error(
        'AUTH0_AUDIENCE environment variable is required. ' +
        'Please set it in your .env file (e.g., https://your-api-identifier.com)'
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
   * Validates the JWT payload and returns user object
   * This user object will be attached to request.user
   * 
   * @param payload - Decoded JWT payload
   * @returns User object with context for the request
   */
  async validate(payload: any) {
    // Validate required claims
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing subject claim');
    }

    // Extract permissions from token (Auth0 convention)
    // Standard claim: payload.permissions (when RBAC is enabled in Auth0 API settings)
    // Custom claim: Replace with your actual namespace if using custom claims
    const customNamespace = process.env.AUTH0_CUSTOM_NAMESPACE || '';
    const permissions = payload.permissions || 
                       (customNamespace ? payload[`${customNamespace}/permissions`] : []) || 
                       [];
    
    // Extract user metadata if using custom claims
    const metadata = customNamespace ? 
                    (payload[`${customNamespace}/user_metadata`] || {}) : 
                    {};
    
    // Return user object that will be attached to request.user
    // This supports future RBAC implementation
    return {
      authId: payload.sub,  // Auth0 user ID (sub claim)
      email: payload.email,
      permissions: permissions,  // For RBAC - can be enhanced with DB lookup
      metadata: metadata,
    };
  }
}
