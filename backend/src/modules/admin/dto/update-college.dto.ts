import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class UpdateCollegeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, {
    message: 'Invalid email domain format'
  })
  emailDomain?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}