import { IsString } from 'class-validator';
import { NormalizeName } from '../../../common/decorators/normalze-name.decorator.js';

export class CreateProvinceDto {
  @IsString()
  @NormalizeName()
  name!: string;
}
