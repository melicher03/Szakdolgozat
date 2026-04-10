import { Type } from 'class-transformer'
import { IsInt, IsString, Length } from 'class-validator'

export class CreateAssetCategoryDto {
  @Type(() => Number)
  @IsInt()
  familyGroupId: number

  @IsString()
  name: string
}