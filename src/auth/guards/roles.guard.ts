import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

interface User {
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return false;
    const { user }: { user: User } = context.switchToHttp().getRequest();
    if (!user) return false;
    if (!user.role) return false;
    if (typeof user.role !== 'string') return false;
    if (user?.role === 'ADMIN') return true;
    return required.includes(user?.role);
  }
}
