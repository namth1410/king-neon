import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { BackboardType } from '../entities/neon-backboard.entity';

// Font DTOs
export class CreateFontDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontFileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateFontDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontFileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// Color DTOs
export class CreateColorDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  hexCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siliconeColor?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  priceModifier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateColorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hexCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siliconeColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceModifier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// Size DTOs
export class CreateSizeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  widthInches: number;

  @ApiProperty()
  @IsNumber()
  maxLetters: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateSizeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  widthInches?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxLetters?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// Material DTOs
export class CreateMaterialDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  priceModifier?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isWaterproof?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateMaterialDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceModifier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isWaterproof?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// Backboard DTOs
export class CreateBackboardDto {
  @ApiProperty({ enum: BackboardType })
  type: BackboardType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  priceModifier?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  availableColors?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateBackboardDto {
  @ApiPropertyOptional({ enum: BackboardType })
  @IsOptional()
  type?: BackboardType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceModifier?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  availableColors?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
