import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { GuideType } from '../../../../generated/prisma/enums.js';

export class BusinessIaEntity {
  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  municipe?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  arrivalDate?: string;

  // recipient
  @IsString()
  @IsOptional()
  fullName?: string;

  // validar si trae si no guardar
  @IsString()
  @IsOptional()
  idCard?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hblCodes!: string[];
}

export class BulkAiEntities {
  //estaticos
  @IsString()
  statusId!: string;

  @IsString()
  agencyId!: string;

  @IsString()
  @IsOptional()
  guideId?: string;

  @IsString()
  @IsOptional()
  guide?: string;

  @IsEnum(GuideType)
  guideType: GuideType;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  location?: string;

  //no estaticos
  @IsArray()
  packages!: BusinessIaEntity[];
}
