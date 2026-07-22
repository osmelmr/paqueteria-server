import { IsString, IsOptional } from 'class-validator';

export class CreateRecipientDto {
  @IsString()
  fullName: string;

  @IsString()
  idCard: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
