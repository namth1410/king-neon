import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Order } from '../orders/order.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly adminEmail: string;
  private readonly maxRetries = 3;
  private readonly retryDelays = [1000, 5000, 30000]; // 1s, 5s, 30s

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.adminEmail = this.configService.get(
      'ADMIN_EMAIL',
      'admin@kingneon.com',
    );
  }

  /**
   * Send order confirmation email to customer
   */
  async sendOrderConfirmation(order: Order): Promise<void> {
    await this.sendWithRetry(
      {
        to: order.customerEmail,
        subject: `Order Confirmation - ${order.orderNumber}`,
        template: 'order-confirmation',
        context: {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          tax: order.tax,
          total: order.total,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
          baseUrl: this.configService
            .get<string>('NEXT_PUBLIC_API_URL', 'http://localhost:3000')
            .replace('/api', ''),
          year: new Date().getFullYear(),
        },
      },
      `order confirmation for ${order.orderNumber}`,
    );
  }

  /**
   * Send new order notification to admin
   */
  async sendNewOrderNotification(order: Order): Promise<void> {
    await this.sendWithRetry(
      {
        to: this.adminEmail,
        subject: `🎉 New Order Received - ${order.orderNumber}`,
        template: 'new-order-admin',
        context: {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          items: order.items,
          total: order.total,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
        },
      },
      `admin notification for ${order.orderNumber}`,
    );
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(
    order: Order,
    paymentDetails: { paymentIntentId: string; paidAt: Date },
  ): Promise<void> {
    await this.sendWithRetry(
      {
        to: order.customerEmail,
        subject: `Payment Receipt - ${order.orderNumber}`,
        template: 'payment-receipt',
        context: {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: order.total,
          paymentIntentId: paymentDetails.paymentIntentId,
          paidAt: paymentDetails.paidAt,
        },
      },
      `payment receipt for ${order.orderNumber}`,
    );
  }

  /**
   * Resend order confirmation (for admin manual resend)
   */
  async resendOrderEmails(order: Order): Promise<void> {
    await this.sendOrderConfirmation(order);
    this.logger.log(`Resent order confirmation for ${order.orderNumber}`);
  }

  /**
   * Send email with retry logic and exponential backoff
   */
  private async sendWithRetry(
    mailOptions: {
      to: string;
      subject: string;
      template: string;
      context: Record<string, unknown>;
    },
    description: string,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await this.mailerService.sendMail(mailOptions);
        this.logger.log(`Successfully sent ${description}`);
        return;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Attempt ${attempt + 1}/${this.maxRetries} failed for ${description}: ${error}`,
        );

        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelays[attempt];
          this.logger.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    this.logger.error(
      `Failed to send ${description} after ${this.maxRetries} attempts: ${lastError?.message}`,
    );
    // Don't throw - let the caller handle this gracefully
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
