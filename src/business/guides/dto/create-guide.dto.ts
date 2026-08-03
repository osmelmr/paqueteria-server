import { IsEnum, IsString } from 'class-validator';
import { GuideType } from '../../../../generated/prisma/enums.js';

export class CreateGuideDto {
  @IsString()
  name: string;

  @IsString()
  agencyId: string;

  @IsEnum(GuideType)
  type: GuideType;
}
