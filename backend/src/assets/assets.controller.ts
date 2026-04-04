import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id)
  }
}
