import { IsString } from 'class-validator';

export class UpdateAgencyDto {
  @IsString()
  name: string;
}
