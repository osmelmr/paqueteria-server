import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
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

  @IsUUID()
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
  @IsUUID()
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
  @IsUUID()
  recipientId?: string;

  @IsOptional()
  @IsUUID()
  guideId?: string;

  @IsOptional()
  @IsUUID()
  provinceId?: string;

  @IsOptional()
  @IsUUID()
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
