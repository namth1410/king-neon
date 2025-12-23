import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  country?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
