import { IsOptional, IsString, IsEnum, IsNumberString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../entities/user.entity';

export class GetUsersQueryDto {
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
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