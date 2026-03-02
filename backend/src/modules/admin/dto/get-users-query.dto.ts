import { IsOptional, IsString, IsEnum, IsInt, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../../entities/user.entity';

export class GetUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsUUID()
  collegeId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
