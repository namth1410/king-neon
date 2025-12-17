import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { NeonFont } from './neon-font.entity';
import { NeonColor } from './neon-color.entity';
import { NeonSize } from './neon-size.entity';
import { NeonMaterial } from './neon-material.entity';
import { NeonBackboard } from './neon-backboard.entity';
import { OrderItem } from '../../orders/order-item.entity';

@Entity('custom_designs')
export class CustomDesign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.customDesigns, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'simple-array' })
  textLines: string[];

  @Column()
  fontId: string;

  @ManyToOne(() => NeonFont)
  @JoinColumn({ name: 'fontId' })
  font: NeonFont;

  @Column()
  colorId: string;

  @ManyToOne(() => NeonColor)
  @JoinColumn({ name: 'colorId' })
  color: NeonColor;

  @Column()
  sizeId: string;

  @ManyToOne(() => NeonSize)
  @JoinColumn({ name: 'sizeId' })
  size: NeonSize;

  @Column()
  materialId: string;

  @ManyToOne(() => NeonMaterial)
  @JoinColumn({ name: 'materialId' })
  material: NeonMaterial;

  @Column()
  backboardId: string;

  @ManyToOne(() => NeonBackboard)
  @JoinColumn({ name: 'backboardId' })
  backboard: NeonBackboard;

  @Column({ nullable: true })
  backboardColor: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  calculatedPrice: number;

  @Column({ nullable: true })
  previewImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.customDesign)
  orderItems: OrderItem[];
}
