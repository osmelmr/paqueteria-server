import {
  IsArray,
  IsNumber,
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
