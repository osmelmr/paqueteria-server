import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * Item del lote: un paquete identificado por sus HBLs.
 * Los campos de datos son opcionales, se usan SOLO si vienen con valor
 * (los vacios nunca pisan la informacion que ya tiene el paquete).
 */
export class BulkUpsertPackageDto {
  @IsArray()
  @IsString({ each: true })
  hbls!: string[];

  // override nivel item (los defaults del lote solo aplican al crear)
  @IsOptional()
  @IsString()
  statusId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  guideId?: string;

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

export class BulkUpsertDto {
  // estado/ubicacion por defecto para los paquetes que NO existen
  @IsString()
  statusId!: string;

  @IsString()
  locationId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpsertPackageDto)
  packages!: BulkUpsertPackageDto[];
}
