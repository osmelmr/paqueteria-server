import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDecimal,
  IsOptional,
  IsString,
} from 'class-validator';

export class BusinessEntity {
  @IsString()
  statusId?: string;

  @IsString()
  agencyId!: string;

  @IsString()
  @IsOptional()
  guideId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  // data opcional del paquete
  //validar
  @IsString()
  @IsOptional()
  provinceId?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  municipeId?: string;

  @IsString()
  @IsOptional()
  municipe?: string;

  // no validar
  @IsString()
  @IsOptional()
  adress?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsDecimal()
  @IsOptional()
  weight?: number;

  @IsBoolean()
  @IsOptional()
  isOrphan?: boolean;

  @IsDate()
  @IsOptional()
  arrivalDate?: string;

  // recipient
  @IsString()
  @IsOptional()
  recipientId?: string;

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

export class BusinessManualEntity {
  // data opcional del paquete
  //validar
  @IsString()
  @IsOptional()
  provinceId?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  municipeId?: string;

  @IsString()
  @IsOptional()
  municipe?: string;

  // no validar
  @IsString()
  @IsOptional()
  adress?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsDecimal()
  @IsOptional()
  weight?: number;

  @IsBoolean()
  @IsOptional()
  isOrphan?: boolean;

  @IsDate()
  @IsOptional()
  arrivalDate?: string;

  // recipient
  @IsString()
  @IsOptional()
  recipientId?: string;

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

export class BulkManualEntities {
  @IsString()
  statusId?: string;

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

  @IsArray()
  packages!: BusinessManualEntity[];
}
