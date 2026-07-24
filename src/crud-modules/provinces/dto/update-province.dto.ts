import { IsString } from 'class-validator';

export class UpdateProvinceDto {
  @IsString()
  name: string;
}
