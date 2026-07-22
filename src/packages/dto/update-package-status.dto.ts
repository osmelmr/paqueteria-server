import { IsString, IsOptional } from 'class-validator';

export class UpdatePackageStatusDto {
  @IsString()
  statusId: string;

  @IsOptional()
  @IsString()
  locationId?: string;
}
