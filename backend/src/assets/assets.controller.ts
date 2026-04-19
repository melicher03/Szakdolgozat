import {
  Body,
  Controller,
  Get,
  Query,
  Post,
} from '@nestjs/common'
import { AssetsService } from './assets.service'
import { CreateFileAssetDto } from './dto/create-file-asset.dto'

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(@Query('familyGroupId') familyGroupId?: string) {
    return this.assetsService.findAll(familyGroupId)
  }

  @Post('file')
  createFileAsset(@Body() dto: CreateFileAssetDto) {
    return this.assetsService.createFileAsset(dto)
  }
}
