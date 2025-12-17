import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from '../orders/order-item.entity';

export enum ProductCategory {
  LED_NEON = 'led-neon',
  BACKLIT_SIGNS = 'backlit-signs',
  CHANNEL_LETTERS = 'channel-letters',
  LIGHTBOX_SIGNS = 'lightbox-signs',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.LED_NEON,
  })
  category: ProductCategory;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, unknown>;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ nullable: true })
  featuredImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
