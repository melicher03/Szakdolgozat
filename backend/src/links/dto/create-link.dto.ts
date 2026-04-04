import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, IsUrl, Length } from 'class-validator'

export class CreateLinkDto {
  @Type(() => Number)
  @IsInt()
  familyGroupId: number

  @IsUrl()
  url: string

  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string

  @IsString()
  @Length(1, 150)
  uploadedBy: string
}