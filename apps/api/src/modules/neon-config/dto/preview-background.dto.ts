import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePreviewBackgroundDto {
  @ApiProperty({ example: 'Living Room' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'preview-backgrounds/bg1.jpg' })
  @IsString()
  imageKey: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdatePreviewBackgroundDto {
  @ApiProperty({ example: 'Bar Scene', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'preview-backgrounds/bg2.jpg', required: false })
  @IsString()
  @IsOptional()
  imageKey?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
