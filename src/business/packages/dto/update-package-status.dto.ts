import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdatePackageStatusDto {
  @IsString()
  statusId: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsDateString()
  statusDate?: string;
}
