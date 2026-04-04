import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { LinksService } from './links.service'
import { CreateLinkDto } from './dto/create-link.dto'

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  findAll(@Query('familyGroupId') familyGroupId?: string) {
    return this.linksService.findAll(familyGroupId)
  }

  @Post()
  createLink(@Body() dto: CreateLinkDto) {
    return this.linksService.createLink(dto)
  }
}