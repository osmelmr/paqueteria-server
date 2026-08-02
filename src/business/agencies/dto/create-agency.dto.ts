import { IsEnum, IsString } from 'class-validator';
import { GuideType } from '../../../../generated/prisma/enums.js';

export class CreateAgencyDto {
  @IsString()
  name: string;

  @IsEnum(GuideType)
  type: GuideType;
}
