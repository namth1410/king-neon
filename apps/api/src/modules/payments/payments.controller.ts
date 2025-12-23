import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  type RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { OrdersService } from '../orders/orders.service';
import { MailService } from '../mail/mail.service';
import { PaymentStatus } from '../orders/order.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
    private readonly mailService: MailService,
  ) {}

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create a payment intent for checkout' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    const paymentIntent = await this.paymentsService.createPaymentIntent(
      dto.amount,
      dto.currency || 'usd',
      {
        orderId: dto.orderId,
        customerEmail: dto.customerEmail || '',
      },
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    let event: Stripe.Event;
    try {
      event = this.paymentsService.constructWebhookEvent(
        req.rawBody,
        signature,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Received webhook event: ${event.type}`);

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful payment - update order and send emails
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    const paymentIntentId = paymentIntent.id;

    if (!orderId) {
      this.logger.warn(`No orderId in payment intent: ${paymentIntentId}`);
      return;
    }

    try {
      // Check idempotency - prevent duplicate processing
      const order = await this.ordersService.findOne(orderId);
      if (order.paymentStatus === PaymentStatus.PAID) {
        this.logger.log(`Order ${orderId} already marked as paid, skipping`);
        return;
      }

      // Update order with payment info using transaction
      const updatedOrder = await this.ordersService.updatePaymentStatus(
        orderId,
        PaymentStatus.PAID,
        paymentIntentId,
      );

      this.logger.log(`Order ${orderId} payment status updated to PAID`);

      // Send emails asynchronously (non-blocking)
      this.sendEmailsAsync(updatedOrder);
    } catch (error) {
      // Log error and let Stripe retry
      this.logger.error(
        `Failed to process payment for order ${orderId}: ${error}`,
      );
      throw error; // Return 500 to trigger Stripe retry
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    const paymentIntentId = paymentIntent.id;

    if (!orderId) {
      this.logger.warn(
        `No orderId in failed payment intent: ${paymentIntentId}`,
      );
      return;
    }

    try {
      await this.ordersService.updatePaymentStatus(
        orderId,
        PaymentStatus.FAILED,
        paymentIntentId,
      );
      this.logger.log(`Order ${orderId} payment status updated to FAILED`);
    } catch (error) {
      this.logger.error(`Failed to update order ${orderId} status: ${error}`);
      throw error;
    }
  }

  /**
   * Send emails asynchronously - don't block order processing
   */
  private sendEmailsAsync(
    order: Awaited<ReturnType<typeof this.ordersService.findOne>>,
  ) {
    // Send customer confirmation email
    this.mailService.sendOrderConfirmation(order).catch((error: Error) => {
      this.logger.error(
        `Failed to send order confirmation email for order ${order.id}: ${error.message}`,
      );
    });

    // Send admin notification email
    this.mailService.sendNewOrderNotification(order).catch((error: Error) => {
      this.logger.error(
        `Failed to send admin notification for order ${order.id}: ${error.message}`,
      );
    });
  }
}
