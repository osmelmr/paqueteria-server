import { IsOptional, IsString } from 'class-validator';
import { NormalizeName } from '../../../common/decorators/normalze-name.decorator.js';

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  @NormalizeName()
  name?: string;
}
