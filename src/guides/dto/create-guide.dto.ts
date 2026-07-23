import { IsString } from 'class-validator';

export class CreateGuideDto {
    @IsString()
    externalRef: string;

    @IsString()
    agencyId: string;
}
