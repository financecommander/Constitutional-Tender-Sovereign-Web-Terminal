import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User object interface extracted from JWT
 * This interface supports future RBAC implementation
 */
export interface UserFromToken {
  authId: string;
  email?: string;
  permissions: string[];
  metadata?: Record<string, any>;
}

/**
 * CurrentUser decorator
 * 
 * Extracts the authenticated user from the request
 * The user is attached to the request by the JWT strategy after successful validation
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: UserFromToken) {
 *   return this.authService.getProfile(user.authId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserFromToken | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserFromToken;

    // If a specific property is requested, return just that property
    return data ? user?.[data] : user;
  },
);
