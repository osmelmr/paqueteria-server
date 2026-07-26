import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class ExtractedPackageDto {
  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  idCard?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  municipe?: string;

  @IsString()
  @IsOptional()
  arrivalDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hblCodes?: string[];

  @IsNumber()
  @IsOptional()
  weight?: number;
}
