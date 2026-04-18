import { Type } from 'class-transformer'
import { IsInt, IsString } from 'class-validator'

export class CreateFileAssetDto {
  @Type(() => Number)
  @IsInt()
  familyGroupId: number

  @IsString()
  storagePath: string

  @Type(() => Number)
  @IsInt()
  fileSize: number

  @IsString()
  categoryName: string
}