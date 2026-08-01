import { IsOptional, IsString } from 'class-validator';

export class PackageRowDto {
  @IsOptional()
  @IsString()
  nombre_completo?: string;

  @IsOptional()
  @IsString()
  hbl?: string;

  @IsOptional()
  @IsString()
  carnet?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  peso?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  fecha_salida?: string;

  @IsOptional()
  @IsString()
  provincia?: string;
}
