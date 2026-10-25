import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GuideType } from '../../../../generated/prisma/enums.js';

/**
 * Fila del Excel = un paquete identificado por sus HBLs.
 * Los campos de datos son opcionales y se usan SOLO si vienen con valor
 * (los vacios nunca pisan la informacion que ya tiene el paquete).
 */
export class BulkUpsertPackageDto {
  @IsArray()
  @IsString({ each: true })
  hblCodes!: string[];

  // override a nivel fila (los metadatos del lote solo aplican al crear)
  @IsOptional()
  @IsString()
  statusId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  provinceId?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  municipeId?: string;

  @IsOptional()
  @IsString()
  municipe?: string;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  idCard?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @IsOptional()
  @IsString()
  anotations?: string;
}

/**
 * Metadatos del lote: mismos datos que la importacion normal de Excel.
 * Se usan unicamente al CREAR paquetes nuevos; si el HBL ya existe solo
 * se actualizan los campos de la fila.
 */
export class BulkUpsertDto {
  @IsString()
  statusId!: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  agencyId?: string;

  @IsOptional()
  @IsString()
  guideId?: string;

  @IsOptional()
  @IsString()
  guide?: string;

  @IsOptional()
  @IsEnum(GuideType)
  guideType?: GuideType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpsertPackageDto)
  packages!: BulkUpsertPackageDto[];
}
