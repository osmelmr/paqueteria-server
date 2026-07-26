import { IsString, IsNotEmpty } from 'class-validator';

export class PreviewRequestDto {
  @IsString()
  @IsNotEmpty()
  excelText!: string;
}
