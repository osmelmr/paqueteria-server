import { IsString } from 'class-validator';
import { NormalizeName } from '../../../common/decorators/normalze-name.decorator.js';

export class UpdateProvinceDto {
  @NormalizeName()
  @IsString()
  name!: string;
}
