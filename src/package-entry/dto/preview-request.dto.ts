import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class PreviewRequestDto {
  @IsString()
  @IsNotEmpty()
  excelText: string;

  @IsString()
  @IsNotEmpty()
  statusId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsString()
  @IsNotEmpty()
  agencyId: string;

  @IsString()
  @IsNotEmpty()
  externalRef: string;

  @IsBoolean()
  @IsOptional()
  isOrphan?: boolean;
}
