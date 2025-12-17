import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '../product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'Custom LED Neon Sign' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Beautiful custom LED neon sign for your space' })
  @IsString()
  description: string;

  @ApiProperty({ example: 195.5 })
  @IsNumber()
  basePrice: number;

  @ApiProperty({ enum: ProductCategory, default: ProductCategory.LED_NEON })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  options?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  featuredImage?: string;
}
