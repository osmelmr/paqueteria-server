import { IsOptional, IsString, IsNumber, IsArray, IsBoolean, IsDateString } from 'class-validator';

export class UpdatePackageDto {
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

  @IsOptional()
  @IsString()
  statusId?: string;

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
