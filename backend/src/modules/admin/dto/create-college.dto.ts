import { IsNotEmpty, IsString, IsOptional, IsEmail, MaxLength, Matches } from 'class-validator';

export class CreateCollegeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, {
    message: 'Invalid email domain format'
  })
  emailDomain: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}