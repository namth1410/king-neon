import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote, QuoteStatus } from './quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  async create(
    createQuoteDto: CreateQuoteDto,
    userId?: string,
  ): Promise<Quote> {
    const quote = this.quoteRepository.create({
      ...createQuoteDto,
      userId,
      status: QuoteStatus.PENDING,
    });
    return this.quoteRepository.save(quote);
  }

  async findAll(options?: {
    status?: QuoteStatus;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Quote[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.status) {
      where.status = options.status;
    }

    const [data, total] = await this.quoteRepository.findAndCount({
      where,
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

  async findOne(id: string): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({ where: { id } });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async update(id: string, updateQuoteDto: UpdateQuoteDto): Promise<Quote> {
    const quote = await this.findOne(id);

    if (updateQuoteDto.status === QuoteStatus.QUOTED && !quote.respondedAt) {
      (quote as any).respondedAt = new Date();
    }

    Object.assign(quote, updateQuoteDto);
    return this.quoteRepository.save(quote);
  }

  async findByUser(userId: string): Promise<Quote[]> {
    return this.quoteRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
