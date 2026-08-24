import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
  IsBoolean,
} from 'class-validator';
import type { UserRole } from '../../../../generated/prisma/enums.js';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsString()
  agencyId?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
