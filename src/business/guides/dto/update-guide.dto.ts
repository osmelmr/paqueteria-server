import { IsOptional, IsString } from 'class-validator';

export class UpdateGuideDto {
  @IsOptional()
  @IsString()
  externalRef?: string;

  @IsOptional()
  @IsString()
  agencyId?: string;
}
