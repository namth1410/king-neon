import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreviewBackground } from './entities/preview-background.entity';
import {
  CreatePreviewBackgroundDto,
  UpdatePreviewBackgroundDto,
} from './dto/preview-background.dto';

@Injectable()
export class PreviewBackgroundsService {
  constructor(
    @InjectRepository(PreviewBackground)
    private readonly bgRepository: Repository<PreviewBackground>,
  ) {}

  async findAll(): Promise<PreviewBackground[]> {
    return this.bgRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findActive(): Promise<PreviewBackground[]> {
    return this.bgRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PreviewBackground> {
    const bg = await this.bgRepository.findOne({ where: { id } });
    if (!bg) {
      throw new NotFoundException(`Preview background with ID ${id} not found`);
    }
    return bg;
  }

  async create(dto: CreatePreviewBackgroundDto): Promise<PreviewBackground> {
    const bg = this.bgRepository.create(dto);
    return this.bgRepository.save(bg);
  }

  async update(
    id: string,
    dto: UpdatePreviewBackgroundDto,
  ): Promise<PreviewBackground> {
    const bg = await this.findOne(id);
    Object.assign(bg, dto);
    return this.bgRepository.save(bg);
  }

  async remove(id: string): Promise<void> {
    const bg = await this.findOne(id);
    await this.bgRepository.remove(bg);
  }

  async toggleActive(id: string): Promise<PreviewBackground> {
    const bg = await this.findOne(id);
    bg.isActive = !bg.isActive;
    return this.bgRepository.save(bg);
  }

  async updateOrder(ids: string[]): Promise<void> {
    const updates = ids.map((id, index) =>
      this.bgRepository.update(id, { sortOrder: index }),
    );
    await Promise.all(updates);
  }
}
