import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GuideType } from '../../../../generated/prisma/enums.js';

export class UpdateAgencyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(GuideType)
  type?: GuideType;
}
