import { Type } from 'class-transformer'
import { IsInt, IsString } from 'class-validator'

export class CreateFileAssetDto {
  @Type(() => Number)
  @IsInt()
  familyGroupId: number

  @IsString()
  storagePath: string

  @IsString()
  categoryName: string
}