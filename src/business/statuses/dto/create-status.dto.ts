import { IsString } from 'class-validator';
import { NormalizeName } from '../../../common/decorators/normalze-name.decorator.js';

export class CreateStatusDto {
  @IsString()
  @NormalizeName()
  name!: string;
}
