import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum BackboardType {
  CUT_TO_SHAPE = 'cut-to-shape',
  RECTANGLE = 'rectangle',
  ACRYLIC = 'acrylic',
  NO_BACKBOARD = 'no-backboard',
}

@Entity('neon_backboards')
export class NeonBackboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: BackboardType,
    default: BackboardType.CUT_TO_SHAPE,
  })
  type: BackboardType;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceModifier: number;

  @Column({ type: 'simple-array', nullable: true })
  availableColors: string[];

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
