import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('neon_colors')
export class NeonColor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  hexCode: string;

  @Column({ nullable: true })
  siliconeColor: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceModifier: number;

  @Column({ nullable: true })
  previewUrl: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
