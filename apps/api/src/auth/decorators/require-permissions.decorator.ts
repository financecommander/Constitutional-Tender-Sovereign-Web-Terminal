import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../guards/permissions.guard';

/**
 * RequirePermissions decorator
 *
 * Apply to a controller or route handler to require specific permissions.
 * The user must have ALL listed permissions to access the route.
 *
 * @example
 * ```typescript
 * @RequirePermissions('admin:access')
 * @Controller('api/admin')
 * export class AdminController { ... }
 *
 * @RequirePermissions('admin:orders', 'admin:write')
 * @Patch('orders/:id/status')
 * async updateOrder() { ... }
 * ```
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
