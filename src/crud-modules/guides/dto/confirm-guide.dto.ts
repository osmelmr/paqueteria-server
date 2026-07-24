import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PackageRowDto } from './package-row.dto.js';

export class ConfirmGuideDto {
  @IsString()
  externalRef: string;

  @IsString()
  agencyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageRowDto)
  packages: PackageRowDto[];
}
