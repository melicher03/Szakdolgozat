import { Type } from 'class-transformer'
import { IsInt, IsString } from 'class-validator'

export class CreateCategoryDto {
  @Type(() => Number)
  @IsInt()
  familyGroupId: number

  @IsString()
  name: string
}
