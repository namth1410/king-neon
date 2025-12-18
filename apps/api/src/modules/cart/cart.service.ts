import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem } from './cart.entity';
import { AddToCartDto, UpdateCartItemDto, MergeCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  /**
   * Get or create cart for a user
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  /**
   * Get cart by user ID
   */
  async getCart(userId: string): Promise<Cart | null> {
    return this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });
  }

  /**
   * Add item to cart
   */
  async addToCart(userId: string, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists
    const existingItem = cart.items.find(
      (item) => item.productId === dto.productId && item.type === dto.type,
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += dto.quantity || 1;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Create new item
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: dto.productId,
        productName: dto.productName,
        price: dto.price,
        quantity: dto.quantity || 1,
        image: dto.image,
        type: dto.type || 'product',
        options: dto.options,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getOrCreateCart(userId);
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    if (dto.quantity <= 0) {
      // Remove item
      await this.cartItemRepository.remove(item);
    } else {
      item.quantity = dto.quantity;
      await this.cartItemRepository.save(item);
    }

    return this.getOrCreateCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.cartItemRepository.remove(item);
    return this.getOrCreateCart(userId);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    if (cart && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
  }

  /**
   * Merge guest cart into user cart (on login)
   */
  async mergeCart(userId: string, guestItems: MergeCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    for (const item of guestItems.items) {
      const existingItem = cart.items.find(
        (i) => i.productId === item.productId && i.type === item.type,
      );

      if (existingItem) {
        // Add quantities
        existingItem.quantity += item.quantity || 1;
        await this.cartItemRepository.save(existingItem);
      } else {
        // Create new item
        const newItem = this.cartItemRepository.create({
          cartId: cart.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image,
          type: item.type || 'product',
          options: item.options,
        });
        await this.cartItemRepository.save(newItem);
      }
    }

    return this.getOrCreateCart(userId);
  }
}
