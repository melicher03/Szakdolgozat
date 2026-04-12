import { IsDateString, IsInt, IsOptional, IsString, Length } from 'class-validator'

export class CreateCalendarEventDto {
  @IsString()
  @Length(1, 150)
  title: string

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string

  @IsDateString()
  startAt: string

  @IsDateString()
  endAt: string
  
  @IsInt()
  familyGroupId: number
}
