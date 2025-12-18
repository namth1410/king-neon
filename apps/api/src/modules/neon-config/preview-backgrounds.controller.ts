import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PreviewBackgroundsService } from './preview-backgrounds.service';
import {
  CreatePreviewBackgroundDto,
  UpdatePreviewBackgroundDto,
} from './dto/preview-background.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('preview-backgrounds')
@Controller('neon/preview-backgrounds')
export class PreviewBackgroundsController {
  constructor(private readonly bgService: PreviewBackgroundsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active preview backgrounds (public)' })
  findActive() {
    return this.bgService.findActive();
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'Get all preview backgrounds (admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.bgService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a preview background by ID' })
  findOne(@Param('id') id: string) {
    return this.bgService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new preview background' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreatePreviewBackgroundDto) {
    return this.bgService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a preview background' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePreviewBackgroundDto) {
    return this.bgService.update(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle active status' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleActive(@Param('id') id: string) {
    return this.bgService.toggleActive(id);
  }

  @Put('order')
  @ApiOperation({ summary: 'Update sort order' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateOrder(@Body() body: { ids: string[] }) {
    return this.bgService.updateOrder(body.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a preview background' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.bgService.remove(id);
  }
}
