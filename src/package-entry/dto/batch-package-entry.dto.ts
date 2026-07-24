import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { SinglePackageEntryDto } from './single-package-entry.dto.js';

export class BatchPackageEntryDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SinglePackageEntryDto)
    packages: SinglePackageEntryDto[];
}
