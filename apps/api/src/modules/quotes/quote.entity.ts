import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum QuoteStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  QUOTED = 'quoted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.quotes, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  companyName: string;

  @Column()
  contactName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text' })
  requirements: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({
    type: 'enum',
    enum: QuoteStatus,
    default: QuoteStatus.PENDING,
  })
  status: QuoteStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quotedPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date;
}
