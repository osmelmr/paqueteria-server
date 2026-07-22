import { IsArray, IsString } from 'class-validator';

export class UploadGuideDto {
  @IsArray()
  @IsString({ each: true })
  rows: string[];
}
