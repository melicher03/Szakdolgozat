import { ArrayNotEmpty, IsArray, IsString, Length } from 'class-validator'

export class CreateFamilyGroupDto {
  @IsString()
  @Length(1, 120)
  name: string

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  members: string[]

  @IsString()
  ownerId: string
}
