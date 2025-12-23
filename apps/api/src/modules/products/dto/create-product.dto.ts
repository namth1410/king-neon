import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Custom LED Neon Sign' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'custom-led-neon-sign' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Beautiful custom LED neon sign for your space' })
  @IsString()
  description: string;

  @ApiProperty({ example: 195.5, minimum: 0 })
  @IsNumber()
  @Min(0, { message: 'Base price cannot be negative' })
  basePrice: number;

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

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
