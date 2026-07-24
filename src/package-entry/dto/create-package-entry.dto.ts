import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateIf,
    ValidateNested,
} from 'class-validator';

class RelationInputDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsOptional()
    @IsObject()
    data?: Record<string, unknown>;
}

class HblInputDto {
    @IsString()
    @IsNotEmpty()
    hblCode: string;
}

export class CreatePackageEntryDto {
    @IsOptional()
    @IsString()
    guideRef?: string;

    @IsOptional()
    @IsString()
    addressDetail?: string;

    @IsOptional()
    @IsNumber()
    weight?: number;

    @IsOptional()
    @IsString()
    contentDescription?: string;

    @IsOptional()
    @IsDateString()
    departureDate?: string;

    @IsDefined()
    @IsString()
    statusId: string;

    @IsOptional()
    @IsBoolean()
    isOrphan?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => RelationInputDto)
    recipient?: RelationInputDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => RelationInputDto)
    guide?: RelationInputDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => RelationInputDto)
    province?: RelationInputDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => RelationInputDto)
    location?: RelationInputDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HblInputDto)
    hbls?: HblInputDto[];
}
