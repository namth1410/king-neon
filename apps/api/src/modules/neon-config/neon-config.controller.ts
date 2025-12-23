import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NeonConfigService } from './neon-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import {
  CreateFontDto,
  UpdateFontDto,
  CreateColorDto,
  UpdateColorDto,
  CreateSizeDto,
  UpdateSizeDto,
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateBackboardDto,
  UpdateBackboardDto,
} from './dto/neon-config.dto';

@ApiTags('neon-config')
@Controller('neon')
export class NeonConfigController {
  constructor(private readonly neonConfigService: NeonConfigService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get all neon configuration options' })
  getAllConfig() {
    return this.neonConfigService.getAllConfig();
  }

  // Fonts
  @Get('fonts')
  @ApiOperation({ summary: 'Get all fonts' })
  getFonts() {
    return this.neonConfigService.findAllFonts();
  }

  @Post('fonts')
  @ApiOperation({ summary: 'Create font (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createFont(@Body() data: CreateFontDto) {
    return this.neonConfigService.createFont(data);
  }

  @Patch('fonts/:id')
  @ApiOperation({ summary: 'Update font (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateFont(@Param('id') id: string, @Body() data: UpdateFontDto) {
    return this.neonConfigService.updateFont(id, data);
  }

  @Delete('fonts/:id')
  @ApiOperation({ summary: 'Delete font (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteFont(@Param('id') id: string) {
    return this.neonConfigService.deleteFont(id);
  }

  // Colors
  @Get('colors')
  @ApiOperation({ summary: 'Get all colors' })
  getColors() {
    return this.neonConfigService.findAllColors();
  }

  @Post('colors')
  @ApiOperation({ summary: 'Create color (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createColor(@Body() data: CreateColorDto) {
    return this.neonConfigService.createColor(data);
  }

  @Patch('colors/:id')
  @ApiOperation({ summary: 'Update color (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateColor(@Param('id') id: string, @Body() data: UpdateColorDto) {
    return this.neonConfigService.updateColor(id, data);
  }

  @Delete('colors/:id')
  @ApiOperation({ summary: 'Delete color (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteColor(@Param('id') id: string) {
    return this.neonConfigService.deleteColor(id);
  }

  // Sizes
  @Get('sizes')
  @ApiOperation({ summary: 'Get all sizes' })
  getSizes() {
    return this.neonConfigService.findAllSizes();
  }

  @Post('sizes')
  @ApiOperation({ summary: 'Create size (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createSize(@Body() data: CreateSizeDto) {
    return this.neonConfigService.createSize(data);
  }

  @Patch('sizes/:id')
  @ApiOperation({ summary: 'Update size (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateSize(@Param('id') id: string, @Body() data: UpdateSizeDto) {
    return this.neonConfigService.updateSize(id, data);
  }

  @Delete('sizes/:id')
  @ApiOperation({ summary: 'Delete size (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteSize(@Param('id') id: string) {
    return this.neonConfigService.deleteSize(id);
  }

  // Materials
  @Get('materials')
  @ApiOperation({ summary: 'Get all materials' })
  getMaterials() {
    return this.neonConfigService.findAllMaterials();
  }

  @Post('materials')
  @ApiOperation({ summary: 'Create material (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createMaterial(@Body() data: CreateMaterialDto) {
    return this.neonConfigService.createMaterial(data);
  }

  @Patch('materials/:id')
  @ApiOperation({ summary: 'Update material (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateMaterial(@Param('id') id: string, @Body() data: UpdateMaterialDto) {
    return this.neonConfigService.updateMaterial(id, data);
  }

  @Delete('materials/:id')
  @ApiOperation({ summary: 'Delete material (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteMaterial(@Param('id') id: string) {
    return this.neonConfigService.deleteMaterial(id);
  }

  // Backboards
  @Get('backboards')
  @ApiOperation({ summary: 'Get all backboards' })
  getBackboards() {
    return this.neonConfigService.findAllBackboards();
  }

  @Post('backboards')
  @ApiOperation({ summary: 'Create backboard (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createBackboard(@Body() data: CreateBackboardDto) {
    return this.neonConfigService.createBackboard(data);
  }

  @Patch('backboards/:id')
  @ApiOperation({ summary: 'Update backboard (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateBackboard(@Param('id') id: string, @Body() data: UpdateBackboardDto) {
    return this.neonConfigService.updateBackboard(id, data);
  }

  @Delete('backboards/:id')
  @ApiOperation({ summary: 'Delete backboard (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteBackboard(@Param('id') id: string) {
    return this.neonConfigService.deleteBackboard(id);
  }
}
