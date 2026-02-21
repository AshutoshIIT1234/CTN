import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';

export class NotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  likes?: boolean;

  @IsBoolean()
  @IsOptional()
  comments?: boolean;

  @IsBoolean()
  @IsOptional()
  replies?: boolean;

  @IsBoolean()
  @IsOptional()
  follows?: boolean;

  @IsBoolean()
  @IsOptional()
  messages?: boolean;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;
}

export class PrivacySettingsDto {
  @IsBoolean()
  @IsOptional()
  privateAccount?: boolean;

  @IsBoolean()
  @IsOptional()
  showActivityStatus?: boolean;

  @IsBoolean()
  @IsOptional()
  allowTagging?: boolean;

  @IsBoolean()
  @IsOptional()
  allowMentions?: boolean;
}

export class AppearanceSettingsDto {
  @IsString()
  @IsEnum(['light', 'dark', 'system'])
  theme: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;
}
