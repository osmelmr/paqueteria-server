import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GuideType } from '../../../../generated/prisma/enums.js';

export class UpdateGuideDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  agencyId?: string;

  @IsOptional()
  @IsEnum(GuideType)
  type?: GuideType;
}
