import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, MergeCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { userId: string };
}

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Returns user cart' })
  async getCart(@Request() req: AuthRequest) {
    const cart = await this.cartService.getCart(req.user.userId);
    return cart || { items: [] };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  async addToCart(@Request() req: AuthRequest, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  async updateItem(
    @Request() req: AuthRequest,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(req.user.userId, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  async removeItem(
    @Request() req: AuthRequest,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(req.user.userId, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@Request() req: AuthRequest) {
    await this.cartService.clearCart(req.user.userId);
    return { message: 'Cart cleared' };
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into user cart (on login)' })
  @ApiResponse({ status: 200, description: 'Carts merged' })
  async mergeCart(@Request() req: AuthRequest, @Body() dto: MergeCartDto) {
    return this.cartService.mergeCart(req.user.userId, dto);
  }
}
