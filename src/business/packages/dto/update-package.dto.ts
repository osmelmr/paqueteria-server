import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsDateString,
} from 'class-validator';

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
  address?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @IsOptional()
  @IsString()
  statusId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  anotations?: string;

  @IsOptional()
  @IsBoolean()
  alert?: boolean;

  @IsOptional()
  @IsString()
  alertDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hbls?: string[];
}
