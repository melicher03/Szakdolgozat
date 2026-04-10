import { Controller, Get, Query } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('query') query?: string) {
    return this.usersService.findAll(query)
  }
}