import { IsEmail, IsString, IsOptional, MinLength, IsIn } from 'class-validator';

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
  fullName?: string;

  @IsOptional()
  @IsIn(['ADMIN', 'STOREKEEPER'])
  role?: 'ADMIN' | 'STOREKEEPER';
}
