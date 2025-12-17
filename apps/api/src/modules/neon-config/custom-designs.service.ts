import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomDesign } from './entities/custom-design.entity';
import { NeonSize } from './entities/neon-size.entity';
import { NeonColor } from './entities/neon-color.entity';
import { NeonMaterial } from './entities/neon-material.entity';
import { NeonBackboard } from './entities/neon-backboard.entity';
import { CreateCustomDesignDto } from './dto/create-custom-design.dto';

@Injectable()
export class CustomDesignsService {
  constructor(
    @InjectRepository(CustomDesign)
    private readonly designRepository: Repository<CustomDesign>,
    @InjectRepository(NeonSize)
    private readonly sizeRepository: Repository<NeonSize>,
    @InjectRepository(NeonColor)
    private readonly colorRepository: Repository<NeonColor>,
    @InjectRepository(NeonMaterial)
    private readonly materialRepository: Repository<NeonMaterial>,
    @InjectRepository(NeonBackboard)
    private readonly backboardRepository: Repository<NeonBackboard>,
  ) {}

  async create(
    createDesignDto: CreateCustomDesignDto,
    userId?: string,
  ): Promise<CustomDesign> {
    // Calculate price
    const calculatedPrice = await this.calculatePrice(createDesignDto);

    const design = this.designRepository.create({
      ...createDesignDto,
      userId,
      calculatedPrice,
    });

    return this.designRepository.save(design);
  }

  async calculatePrice(data: {
    sizeId: string;
    colorId: string;
    materialId: string;
    backboardId: string;
    textLines: string[];
  }): Promise<number> {
    const [size, color, material, backboard] = await Promise.all([
      this.sizeRepository.findOne({ where: { id: data.sizeId } }),
      this.colorRepository.findOne({ where: { id: data.colorId } }),
      this.materialRepository.findOne({ where: { id: data.materialId } }),
      this.backboardRepository.findOne({ where: { id: data.backboardId } }),
    ]);

    if (!size || !color || !material || !backboard) {
      throw new NotFoundException('Invalid configuration options');
    }

    const basePrice = Number(size.price);
    const colorModifier = Number(color.priceModifier);
    const materialModifier = Number(material.priceModifier);
    const backboardModifier = Number(backboard.priceModifier);
    const additionalLinesCost = Math.max(0, data.textLines.length - 1) * 50;

    return (
      basePrice +
      colorModifier +
      materialModifier +
      backboardModifier +
      additionalLinesCost
    );
  }

  async findByUser(userId: string): Promise<CustomDesign[]> {
    return this.designRepository.find({
      where: { userId },
      relations: ['font', 'color', 'size', 'material', 'backboard'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CustomDesign> {
    const design = await this.designRepository.findOne({
      where: { id },
      relations: ['font', 'color', 'size', 'material', 'backboard'],
    });

    if (!design) {
      throw new NotFoundException(`Custom design with ID ${id} not found`);
    }

    return design;
  }

  async remove(id: string): Promise<void> {
    const design = await this.findOne(id);
    await this.designRepository.remove(design);
  }
}
