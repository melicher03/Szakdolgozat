import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, IsUrl, Length, Min } from 'class-validator'

export class CreateFileAssetDto {
  @Type(() => Number)
  @IsInt()
  familyGroupId: number

  @IsString()
  title: string

  @IsUrl()
  url: string

  @IsString()
  storagePath: string

  @Type(() => Number)
  @IsInt()
  fileSize: number

  @IsString()
  uploadedBy: string
}