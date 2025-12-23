import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Order } from '../orders/order.entity';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  @ApiOperation({ summary: 'Send a test email to verify configuration' })
  @ApiBody({
    schema: { type: 'object', properties: { email: { type: 'string' } } },
  })
  async sendTestEmail(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Mock order for testing
    const mockOrder = {
      id: 'test-order-id',
      orderNumber: 'TEST-123456',
      customerName: 'Test User',
      customerEmail: email,
      customerPhone: '1234567890',
      status: 'pending',
      paymentStatus: 'paid',
      subtotal: 100,
      shipping: 15,
      tax: 10,
      total: 125,
      items: [
        {
          productName: 'Custom Neon Sign',
          quantity: 1,
          unitPrice: 100, // Fixed: price -> unitPrice
          options: { color: 'Pink', size: 'Medium' },
        },
      ],
      shippingAddress: {
        address: '123 Test St', // Fixed: street -> address
        city: 'Test City',
        state: 'TS',
        zipCode: '12345', // Fixed: postalCode -> zipCode
        country: 'US',
        email: email,
        phone: '1234567890',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.mailService.sendOrderConfirmation(mockOrder as unknown as Order);
    return { success: true, message: `Test email sent to ${email}` };
  }
}
