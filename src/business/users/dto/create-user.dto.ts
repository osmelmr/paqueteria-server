import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsIn,
} from 'class-validator';

import type { UserRole } from '../../../../generated/prisma/enums.js';

export class CreateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  agencyId?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  role?: UserRole;
}
