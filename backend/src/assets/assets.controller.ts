import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { AssetsService } from './assets.service'
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto'
import { CreateFileAssetDto } from './dto/create-file-asset.dto'

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(@Query('familyGroupId') familyGroupId?: string) {
    return this.assetsService.findAll(familyGroupId)
  }

  @Get('categories')
  findCategories(@Query('familyGroupId') familyGroupId?: string) {
    return this.assetsService.findCategories(familyGroupId)
  }

  @Post('categories')
  createCategory(@Body() dto: CreateAssetCategoryDto) {
    return this.assetsService.createCategory(dto)
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
