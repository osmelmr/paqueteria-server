import { IsEmail, IsOptional, IsString, MinLength, IsIn, IsBoolean } from 'class-validator';

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
  fullName?: string;

  @IsOptional()
  @IsIn(['ADMIN', 'STOREKEEPER'])
  role?: 'ADMIN' | 'STOREKEEPER';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
