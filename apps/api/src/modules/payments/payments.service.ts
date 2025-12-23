import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn(
        'STRIPE_SECRET_KEY not configured - payments will not work. Set it in .env file.',
      );
      this.stripe = null;
    } else {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-12-15.clover',
      });
    }
  }

  /**
   * Check if Stripe is configured and return the instance
   */
  private getStripe(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in .env file.',
      );
    }
    return this.stripe;
  }

  /**
   * Create a PaymentIntent for an order
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {},
  ): Promise<Stripe.PaymentIntent> {
    const stripe = this.getStripe();

    this.logger.log(
      `Creating payment intent for amount: ${amount} ${currency}`,
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    this.logger.log(`Payment intent created: ${paymentIntent.id}`);
    return paymentIntent;
  }

  /**
   * Retrieve a PaymentIntent by ID
   */
  async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    const stripe = this.getStripe();
    return stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Verify webhook signature and construct event
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const stripe = this.getStripe();

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
