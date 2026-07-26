import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsDateString,
} from 'class-validator';

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

  @IsString()
  statusId: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsBoolean()
  isOrphan?: boolean;

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
