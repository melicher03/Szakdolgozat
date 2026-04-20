import { Type } from 'class-transformer'
import { IsInt, IsString } from 'class-validator'

export class CreateMessageDto {
  @IsString()
  text: string

  @IsString()
  senderId: string

  @IsString()
  senderName: string

  @Type(() => Number)
  @IsInt()
  familyGroupId: number
}
