import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NeonFont } from './entities/neon-font.entity';
import { NeonColor } from './entities/neon-color.entity';
import { NeonSize } from './entities/neon-size.entity';
import { NeonMaterial } from './entities/neon-material.entity';
import { NeonBackboard } from './entities/neon-backboard.entity';

@Injectable()
export class NeonConfigService {
  constructor(
    @InjectRepository(NeonFont)
    private readonly fontRepository: Repository<NeonFont>,
    @InjectRepository(NeonColor)
    private readonly colorRepository: Repository<NeonColor>,
    @InjectRepository(NeonSize)
    private readonly sizeRepository: Repository<NeonSize>,
    @InjectRepository(NeonMaterial)
    private readonly materialRepository: Repository<NeonMaterial>,
    @InjectRepository(NeonBackboard)
    private readonly backboardRepository: Repository<NeonBackboard>,
  ) {}

  // Fonts
  async findAllFonts(): Promise<NeonFont[]> {
    return this.fontRepository.find({ where: { active: true } });
  }

  async createFont(data: Partial<NeonFont>): Promise<NeonFont> {
    const font = this.fontRepository.create(data);
    return this.fontRepository.save(font);
  }

  async updateFont(id: string, data: Partial<NeonFont>): Promise<NeonFont> {
    await this.fontRepository.update(id, data);
    return this.fontRepository.findOneOrFail({ where: { id } });
  }

  async deleteFont(id: string): Promise<void> {
    await this.fontRepository.delete(id);
  }

  // Colors
  async findAllColors(): Promise<NeonColor[]> {
    return this.colorRepository.find({ where: { active: true } });
  }

  async createColor(data: Partial<NeonColor>): Promise<NeonColor> {
    const color = this.colorRepository.create(data);
    return this.colorRepository.save(color);
  }

  async updateColor(id: string, data: Partial<NeonColor>): Promise<NeonColor> {
    await this.colorRepository.update(id, data);
    return this.colorRepository.findOneOrFail({ where: { id } });
  }

  async deleteColor(id: string): Promise<void> {
    await this.colorRepository.delete(id);
  }

  // Sizes
  async findAllSizes(): Promise<NeonSize[]> {
    return this.sizeRepository.find({
      where: { active: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async createSize(data: Partial<NeonSize>): Promise<NeonSize> {
    const size = this.sizeRepository.create(data);
    return this.sizeRepository.save(size);
  }

  async updateSize(id: string, data: Partial<NeonSize>): Promise<NeonSize> {
    await this.sizeRepository.update(id, data);
    return this.sizeRepository.findOneOrFail({ where: { id } });
  }

  async deleteSize(id: string): Promise<void> {
    await this.sizeRepository.delete(id);
  }

  // Materials
  async findAllMaterials(): Promise<NeonMaterial[]> {
    return this.materialRepository.find({ where: { active: true } });
  }

  async createMaterial(data: Partial<NeonMaterial>): Promise<NeonMaterial> {
    const material = this.materialRepository.create(data);
    return this.materialRepository.save(material);
  }

  async updateMaterial(
    id: string,
    data: Partial<NeonMaterial>,
  ): Promise<NeonMaterial> {
    await this.materialRepository.update(id, data);
    return this.materialRepository.findOneOrFail({ where: { id } });
  }

  async deleteMaterial(id: string): Promise<void> {
    await this.materialRepository.delete(id);
  }

  // Backboards
  async findAllBackboards(): Promise<NeonBackboard[]> {
    return this.backboardRepository.find({ where: { active: true } });
  }

  async createBackboard(data: Partial<NeonBackboard>): Promise<NeonBackboard> {
    const backboard = this.backboardRepository.create(data);
    return this.backboardRepository.save(backboard);
  }

  async updateBackboard(
    id: string,
    data: Partial<NeonBackboard>,
  ): Promise<NeonBackboard> {
    await this.backboardRepository.update(id, data);
    return this.backboardRepository.findOneOrFail({ where: { id } });
  }

  async deleteBackboard(id: string): Promise<void> {
    await this.backboardRepository.delete(id);
  }

  // Get all config at once for designer
  async getAllConfig() {
    const [fonts, colors, sizes, materials, backboards] = await Promise.all([
      this.findAllFonts(),
      this.findAllColors(),
      this.findAllSizes(),
      this.findAllMaterials(),
      this.findAllBackboards(),
    ]);

    return { fonts, colors, sizes, materials, backboards };
  }
}
