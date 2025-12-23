import {
  IsString,
  IsArray,
  IsUUID,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomDesignDto {
  @ApiProperty({ type: [String], example: ['Hello', 'World'], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one text line is required' })
  @IsString({ each: true })
  textLines: string[];

  @ApiProperty({ example: 'uuid-font-id' })
  @IsUUID()
  fontId: string;

  @ApiProperty({ example: 'uuid-color-id' })
  @IsUUID()
  colorId: string;

  @ApiProperty({ example: 'uuid-size-id' })
  @IsUUID()
  sizeId: string;

  @ApiProperty({ example: 'uuid-material-id' })
  @IsUUID()
  materialId: string;

  @ApiProperty({ example: 'uuid-backboard-id' })
  @IsUUID()
  backboardId: string;

  @ApiPropertyOptional({ example: 'transparent' })
  @IsOptional()
  @IsString()
  backboardColor?: string;
}
