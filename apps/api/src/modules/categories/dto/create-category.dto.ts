import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'LED Neon Signs' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'led-neon-signs' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only (e.g., led-neon-signs)',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'Beautiful LED neon signs for any occasion' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'neon-icon' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/category-image.jpg' })
  @IsString()
  @IsOptional()
  image?: string;
}
