import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { NormalizeName } from '../../../common/decorators/normalze-name.decorator.js';

export class CreateMunicipeDto {
  @IsString()
  @NormalizeName()
  name!: string;

  @IsOptional()
  @IsBoolean()
  header?: boolean;
}
