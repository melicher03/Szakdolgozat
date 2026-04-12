import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator'

export class CreateLinkDto {
  @Type(() => Number)
  @IsInt()
  familyGroupId: number

  @IsUrl()
  url: string

  @IsOptional()
  @IsString()
  title?: string

  @IsString()
  uploadedBy: string

  @IsString()
  categoryName: string
}