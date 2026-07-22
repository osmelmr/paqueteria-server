import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsDateString } from 'class-validator';

export class CreatePackageDto {
  @IsOptional()
  @IsString()
  guideId?: string;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsString()
  provinceId?: string;

  @IsOptional()
  @IsString()
  addressDetail?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  contentDescription?: string;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsString()
  statusId: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsBoolean()
  isOrphan?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hbls?: string[];
}
