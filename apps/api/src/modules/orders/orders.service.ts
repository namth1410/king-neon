import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    userId?: string,
  ): Promise<Order> {
    const orderNumber = this.generateOrderNumber();

    // Calculate totals
    const subtotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const shipping = createOrderDto.shipping || 0;
    const tax = createOrderDto.tax || 0;
    const total = subtotal + shipping + tax;

    const order = this.orderRepository.create({
      ...createOrderDto,
      orderNumber,
      userId,
      subtotal,
      total,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const items = createOrderDto.items.map((item) =>
      this.orderItemRepository.create({
        ...item,
        orderId: savedOrder.id,
      }),
    );

    await this.orderItemRepository.save(items);

    return this.findOne(savedOrder.id);
  }

  async findAll(options?: {
    userId?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: { userId?: string; status?: OrderStatus } = {};

    if (options?.userId) {
      where.userId = options.userId;
    }

    if (options?.status) {
      where.status = options.status;
    }

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.customDesign'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Transform product image URLs
    this.transformProductImageUrls(order);

    return order;
  }

  /**
   * Transform product image keys to full URLs
   */
  private transformProductImageUrls(order: Order): void {
    const storageBaseUrl =
      process.env.MINIO_PUBLIC_URL ||
      process.env.MINIO_ENDPOINT ||
      'http://localhost:9002';
    const bucketName = process.env.MINIO_BUCKET || 'king-neon';

    const transformUrl = (path: string | null): string | null => {
      if (!path) return null;
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `${storageBaseUrl}/${bucketName}/${cleanPath}`;
    };

    order.items?.forEach((item) => {
      if (item.product?.images) {
        item.product.images = item.product.images.map(
          (img) => transformUrl(img) || '',
        );
      }
      if (item.product?.featuredImage) {
        item.product.featuredImage = transformUrl(item.product.featuredImage)!;
      }
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }

  async cancel(id: string): Promise<Order> {
    return this.updateStatus(id, OrderStatus.CANCELLED);
  }

  /**
   * Update payment status when Stripe webhook is received
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    stripePaymentIntentId: string,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    order.paymentStatus = paymentStatus;
    order.stripePaymentIntentId = stripePaymentIntentId;

    if (paymentStatus === PaymentStatus.PAID) {
      order.paidAt = new Date();
      order.status = OrderStatus.CONFIRMED;
    }

    return this.orderRepository.save(order);
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `KN-${timestamp}-${random}`;
  }
}
