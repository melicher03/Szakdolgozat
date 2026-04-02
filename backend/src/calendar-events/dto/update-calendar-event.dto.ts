import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator'

export class UpdateCalendarEventDto {
  @IsOptional()
  @IsString()
  @Length(1, 150)
  title?: string

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string

  @IsOptional()
  @IsDateString()
  startAt?: string

  @IsOptional()
  @IsDateString()
  endAt?: string

  @IsOptional()
  @IsUUID()
  familyGroupId?: string
}
