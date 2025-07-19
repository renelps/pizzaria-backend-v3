import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const { user } = context.switchToHttp().getRequest();

    console.log('Required roles:', requiredRoles);
    console.log('User from request:', user);

    if (!requiredRoles) {
      return true;
    }
    if (!user) {
      console.log('No user found in request');
      return false;
    }
    const hasRole = requiredRoles.includes(user.role);
    console.log(`User role ${user.role} authorized?`, hasRole);
    return hasRole;
  }
}
