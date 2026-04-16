import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator'

export class CreateFileAssetDto {
  @Type(() => Number)
  @IsInt()
  familyGroupId: number

  @IsOptional()
  @IsString()
  title?: string

  @IsUrl()
  url: string

  @IsString()
  storagePath: string

  @Type(() => Number)
  @IsInt()
  fileSize: number

  @IsString()
  uploadedBy: string

  @IsString()
  categoryName: string
}