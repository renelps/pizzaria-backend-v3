import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { OrderService } from '../orders/orders.service';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { OrderStatus } from '@prisma/client';

class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Amount in cents (e.g. 1000 = R$10,00)' })
  amount!: number;

  @ApiProperty({ description: 'Order ID related to this payment' })
  orderId!: number;
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly orderService: OrderService,
  ) {}

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create a payment intent with Stripe' })
  @ApiBody({ type: CreatePaymentIntentDto })
  @ApiResponse({ status: 201, description: 'Returns client secret for payment' })
  async createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    if (!body.amount || !body.orderId) {
      throw new BadRequestException('Missing amount or orderId');
    }

    const metadata: Record<string, string> = {
      orderId: body.orderId.toString(),
    };

    const paymentIntent = await this.stripeService.createPaymentIntent(
      body.amount,
      'brl',
      metadata,
    );

    return { clientSecret: paymentIntent.client_secret };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-06-30.basil',
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', (err as Error).message);
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      console.log(`Payment for order ${orderId} succeeded.`);

      if (orderId) {
        try {
          await this.orderService.updateStatus(Number(orderId), OrderStatus.PAID);
          console.log(`Order ${orderId} status updated to PAID.`);
        } catch (error) {
          console.error(`Failed to update order status for order ${orderId}:`, error);
        }
      }
    }

    res.json({ received: true });
  }
}
