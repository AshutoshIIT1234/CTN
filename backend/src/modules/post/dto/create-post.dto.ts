import { IsString, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional, IsArray, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Content must not be empty' })
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  content: string;

  @IsEnum(['NATIONAL', 'COLLEGE'])
  @IsOptional()
  panelType?: string;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  imageUrls?: string[];
}
