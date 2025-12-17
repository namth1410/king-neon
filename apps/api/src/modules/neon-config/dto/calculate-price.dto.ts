import { IsArray, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculatePriceDto {
  @ApiProperty({ type: [String], example: ['Hello', 'World'] })
  @IsArray()
  @IsString({ each: true })
  textLines: string[];

  @ApiProperty({ example: 'uuid-size-id' })
  @IsUUID()
  sizeId: string;

  @ApiProperty({ example: 'uuid-color-id' })
  @IsUUID()
  colorId: string;

  @ApiProperty({ example: 'uuid-material-id' })
  @IsUUID()
  materialId: string;

  @ApiProperty({ example: 'uuid-backboard-id' })
  @IsUUID()
  backboardId: string;
}
