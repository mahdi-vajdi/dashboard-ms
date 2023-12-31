import { SetMetadata } from '@nestjs/common';
import { AgentRole } from '../dto-generic';

export const ROLES_DECORATOR_KEY = 'roles';

export const Roles = (...roles: AgentRole[]) =>
  SetMetadata(ROLES_DECORATOR_KEY, roles);
