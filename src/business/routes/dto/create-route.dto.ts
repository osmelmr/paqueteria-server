import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  departureDate!: string;

  @IsString()
  vehicleId!: string;

  @IsArray()
  @IsString({ each: true })
  hbls!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  driverIds?: string[];
}
