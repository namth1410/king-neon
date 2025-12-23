import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomDesignsService } from './custom-designs.service';
import { CreateCustomDesignDto } from './dto/create-custom-design.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { userId: string };
}

@ApiTags('neon-designs')
@Controller('neon/designs')
export class CustomDesignsController {
  constructor(private readonly customDesignsService: CustomDesignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a custom design' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDesignDto: CreateCustomDesignDto,
    @Request() req: AuthRequest,
  ) {
    return this.customDesignsService.create(createDesignDto, req.user.userId);
  }

  @Post('calculate-price')
  @ApiOperation({ summary: 'Calculate price for a design configuration' })
  calculatePrice(@Body() calculatePriceDto: CalculatePriceDto) {
    return this.customDesignsService.calculatePrice(calculatePriceDto);
  }

  @Get('my-designs')
  @ApiOperation({ summary: 'Get current user designs' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMyDesigns(@Request() req: AuthRequest) {
    return this.customDesignsService.findByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get design by ID' })
  findOne(@Param('id') id: string) {
    return this.customDesignsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a design' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.customDesignsService.remove(id);
  }
}
