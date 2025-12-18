import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from '../products/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if slug already exists
    const existing = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `Category with slug "${createCategoryDto.slug}" already exists`,
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findActive(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { active: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
    });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // If updating slug, check for conflicts
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });
      if (existing) {
        throw new ConflictException(
          `Category with slug "${updateCategoryDto.slug}" already exists`,
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category is used by any products
    const productCount = await this.productRepository.count({
      where: { category: { id } },
    });

    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete category "${category.name}". ` +
          `It is used by ${productCount} product(s). ` +
          `Please reassign products to another category first.`,
      );
    }

    await this.categoryRepository.remove(category);
  }

  async getProductCount(id: string): Promise<number> {
    await this.findOne(id); // Ensure category exists
    return this.productRepository.count({
      where: { category: { id } },
    });
  }
}
