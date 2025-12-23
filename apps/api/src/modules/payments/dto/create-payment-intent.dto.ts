import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Amount in dollars (will be converted to cents)',
    example: 99.99,
  })
  @IsNumber()
  @Min(0.5) // Stripe minimum is 50 cents
  amount: number;

  @ApiPropertyOptional({
    description: 'Currency code (default: usd)',
    example: 'usd',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Order ID to associate with payment',
    example: 'uuid-order-id',
  })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: 'Customer email for receipt' })
  @IsString()
  @IsOptional()
  customerEmail?: string;
}
