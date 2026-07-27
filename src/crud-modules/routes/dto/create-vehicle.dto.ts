import { IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString({ each: true })
  driverIds?: string[];
}
