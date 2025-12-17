import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product, ProductCategory } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const slug = this.generateSlug(createProductDto.name);
    const product = this.productRepository.create({
      ...createProductDto,
      slug,
    });
    return this.productRepository.save(product);
  }

  async findAll(options?: {
    category?: ProductCategory;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = { active: true };

    if (options?.category) {
      where.category = options.category;
    }

    if (options?.search) {
      where.name = ILike(`%${options.search}%`);
    }

    const [data, total] = await this.productRepository.findAndCount({
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

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug, active: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  async findFeatured(limit = 8): Promise<Product[]> {
    return this.productRepository.find({
      where: { active: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByCategory(category: ProductCategory): Promise<Product[]> {
    return this.productRepository.find({
      where: { category, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      (product as any).slug = this.generateSlug(updateProductDto.name);
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async getCategories(): Promise<
    { category: ProductCategory; count: number }[]
  > {
    const results = await this.productRepository
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('product.active = :active', { active: true })
      .groupBy('product.category')
      .getRawMany();

    return results;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
