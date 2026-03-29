import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class UpdateFamilyGroupDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[];

  @IsOptional()
  @IsString()
  ownerId?: string;
}
