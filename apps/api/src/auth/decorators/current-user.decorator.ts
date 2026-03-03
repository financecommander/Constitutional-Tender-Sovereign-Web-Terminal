import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User object interface extracted from JWT + DB lookup
 * The dbUserId is resolved in the JWT strategy by looking up the user by authId.
 */
export interface UserFromToken {
  authId: string;
  email?: string;
  permissions: string[];
  metadata?: Record<string, unknown>;
  dbUserId: string | null; // Resolved DB user UUID (null if user not in DB yet)
}

/**
 * CurrentUser decorator
 *
 * Extracts the authenticated user from the request.
 * The user is attached to the request by the JWT strategy after successful validation.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserFromToken) {
 *   return this.service.doSomething(user.dbUserId);
 * }
 *
 * // Or get a specific field:
 * @Get('orders')
 * getOrders(@CurrentUser('dbUserId') userId: string) {
 *   return this.service.listOrders(userId);
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
