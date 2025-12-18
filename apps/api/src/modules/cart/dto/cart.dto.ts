import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Custom LED Neon Sign' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 195.5 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ enum: ['product', 'custom'], default: 'product' })
  @IsOptional()
  @IsEnum(['product', 'custom'])
  type?: 'product' | 'custom';

  @ApiPropertyOptional()
  @IsOptional()
  options?: Record<string, unknown>;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class MergeCartDto {
  @ApiProperty({ type: [AddToCartDto] })
  items: AddToCartDto[];
}
