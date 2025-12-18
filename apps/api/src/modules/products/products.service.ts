import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadService } from '../upload/upload.service';
import { Category } from '../categories/category.entity';

export interface ProductWithUrls extends Omit<
  Product,
  'images' | 'featuredImage'
> {
  images: string[];
  featuredImage: string | null;
}

@Injectable()
export class ProductsService {
  private readonly storageBaseUrl: string;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly uploadService: UploadService,
  ) {
    this.storageBaseUrl =
      process.env.MINIO_PUBLIC_URL ||
      process.env.MINIO_ENDPOINT ||
      'http://localhost:9002';
  }

  /**
   * Transform image keys to full URLs
   */
  private transformImageUrls(product: Product): ProductWithUrls {
    const bucketName = process.env.MINIO_BUCKET || 'king-neon';

    const transformUrl = (path: string | null): string | null => {
      if (!path) return null;
      // If already a full URL, return as-is
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      // Remove leading slash if present
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `${this.storageBaseUrl}/${bucketName}/${cleanPath}`;
    };

    return {
      ...product,
      images: product.images?.map((img) => transformUrl(img) || '') || [],
      featuredImage: transformUrl(product.featuredImage),
    };
  }

  /**
   * Transform URL back to key for storage
   */
  private extractKeyFromUrl(url: string): string {
    if (!url) return url;

    const bucketName = process.env.MINIO_BUCKET || 'king-neon';

    // If it's already a key (not a URL), return as-is
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url.startsWith('/') ? url.slice(1) : url;
    }

    // Extract key from URL: http://host/bucket/key -> key
    const regex = new RegExp(`.*/${bucketName}/(.+)$`);
    const match = url.match(regex);
    return match ? match[1] : url;
  }

  async create(createProductDto: CreateProductDto): Promise<ProductWithUrls> {
    const slug =
      createProductDto.slug || this.generateSlug(createProductDto.name);

    // Convert URLs to keys for storage
    const images =
      createProductDto.images?.map((img) => this.extractKeyFromUrl(img)) || [];
    const featuredImage = createProductDto.featuredImage
      ? this.extractKeyFromUrl(createProductDto.featuredImage)
      : images[0] || undefined;

    // Handle categoryId
    let category: Category | null = null;
    if (createProductDto.categoryId) {
      category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
    }

    const product = this.productRepository.create({
      ...createProductDto,
      slug,
      images,
      featuredImage,
      category: category || undefined,
    });

    const saved = await this.productRepository.save(product);
    // save can return array or single entity, handle both
    const savedProduct = Array.isArray(saved) ? saved[0] : saved;
    return this.transformImageUrls(savedProduct);
  }

  async findAll(options?: {
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';
    activeOnly?: boolean;
  }): Promise<{
    data: ProductWithUrls[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Only filter by active if explicitly requested (for public API)
    if (options?.activeOnly) {
      where.active = true;
    }

    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options?.search) {
      where.name = ILike(`%${options.search}%`);
    }

    // Determine sort order based on sortBy option
    let order: Record<string, 'ASC' | 'DESC'> = { createdAt: 'DESC' };
    switch (options?.sortBy) {
      case 'price-asc':
        order = { basePrice: 'ASC' };
        break;
      case 'price-desc':
        order = { basePrice: 'DESC' };
        break;
      case 'name-asc':
        order = { name: 'ASC' };
        break;
      case 'name-desc':
        order = { name: 'DESC' };
        break;
      case 'newest':
      default:
        order = { createdAt: 'DESC' };
        break;
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      relations: ['category'],
      order,
      skip,
      take: limit,
    });

    return {
      data: data.map((p) => this.transformImageUrls(p)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProductWithUrls> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.transformImageUrls(product);
  }

  async findBySlug(slug: string): Promise<ProductWithUrls> {
    const product = await this.productRepository.findOne({
      where: { slug, active: true },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return this.transformImageUrls(product);
  }

  async findFeatured(limit = 8): Promise<ProductWithUrls[]> {
    const products = await this.productRepository.find({
      where: { active: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return products.map((p) => this.transformImageUrls(p));
  }

  async findByCategory(categoryId: string): Promise<ProductWithUrls[]> {
    const products = await this.productRepository.find({
      where: { categoryId, active: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
    return products.map((p) => this.transformImageUrls(p));
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductWithUrls> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      product.slug = this.generateSlug(updateProductDto.name);
    }

    // Convert URLs to keys for storage
    if (updateProductDto.images) {
      updateProductDto.images = updateProductDto.images.map((img) =>
        this.extractKeyFromUrl(img),
      );
    }
    if (updateProductDto.featuredImage) {
      updateProductDto.featuredImage = this.extractKeyFromUrl(
        updateProductDto.featuredImage,
      );
    }

    // Handle categoryId update
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });
      if (category) {
        product.category = category;
      }
    }

    Object.assign(product, updateProductDto);
    const saved = await this.productRepository.save(product);
    return this.transformImageUrls(saved);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productRepository.remove(product);
  }

  async getCategoriesWithCounts(): Promise<
    { categoryId: string; categoryName: string; count: number }[]
  > {
    const results = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(*)', 'count')
      .where('product.active = :active', { active: true })
      .andWhere('category.id IS NOT NULL')
      .groupBy('category.id')
      .addGroupBy('category.name')
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
