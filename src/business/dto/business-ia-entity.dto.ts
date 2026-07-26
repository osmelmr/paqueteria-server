import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDecimal,
  IsOptional,
  IsString,
} from 'class-validator';

export class BusinessIaEntity {
  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  municipe?: string;

  @IsString()
  @IsOptional()
  adress?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsDecimal()
  @IsOptional()
  weight?: number;

  @IsDate()
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

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isOrphan?: boolean;

  //no estaticos
  @IsArray()
  packages!: BusinessIaEntity[];
}
