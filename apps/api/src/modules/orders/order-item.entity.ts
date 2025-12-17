import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { CustomDesign } from '../neon-config/entities/custom-design.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  productId: string;

  @ManyToOne(() => Product, (product) => product.orderItems, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  customDesignId: string;

  @ManyToOne(() => CustomDesign, (design) => design.orderItems, {
    nullable: true,
  })
  @JoinColumn({ name: 'customDesignId' })
  customDesign: CustomDesign;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, unknown>;

  @Column({ nullable: true })
  productName: string;
}
