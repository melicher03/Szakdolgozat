import { IsArray, IsOptional, IsString, Length } from 'class-validator'

export class UpdateFamilyGroupDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[]
}
