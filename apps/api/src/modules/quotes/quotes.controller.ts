import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { QuoteStatus } from './quote.entity';

interface AuthRequest extends Request {
  user: { userId: string };
}

// Dùng cho endpoint có thể có hoặc không có authentication
interface OptionalAuthRequest extends Request {
  user?: { userId: string };
}

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a quote request' })
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute - spam protection
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @Request() req: OptionalAuthRequest,
  ) {
    return this.quotesService.create(createQuoteDto, req.user?.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotes (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiQuery({ name: 'status', required: false, enum: QuoteStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('status') status?: QuoteStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.quotesService.findAll({ status, page, limit });
  }

  @Get('my-quotes')
  @ApiOperation({ summary: 'Get current user quotes' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMyQuotes(@Request() req: AuthRequest) {
    return this.quotesService.findByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quote (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quotesService.update(id, updateQuoteDto);
  }
}
