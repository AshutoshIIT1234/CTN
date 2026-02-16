import { IsEnum } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class AssignRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}