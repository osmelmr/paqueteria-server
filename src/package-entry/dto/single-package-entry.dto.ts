import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';

class NewRecipientDto {
  @IsString()
  fullName: string;

  @IsString()
  idCard: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

class NewGuideDto {
  @IsString()
  externalRef: string;

  @IsString()
  agencyId: string;
}

class NewProvinceDto {
  @IsString()
  name: string;
}

class NewLocationDto {
  @IsString()
  name: string;
}

export class SinglePackageEntryDto {
  @IsString()
  statusId: string;

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
  @IsString()
  departureDate?: string;

  @IsOptional()
  @IsBoolean()
  isOrphan?: boolean;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsString()
  guideId?: string;

  @IsOptional()
  @IsString()
  provinceId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewRecipientDto)
  newRecipient?: NewRecipientDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewGuideDto)
  newGuide?: NewGuideDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewProvinceDto)
  newProvince?: NewProvinceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewLocationDto)
  newLocation?: NewLocationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hblCodes?: string[];
}
