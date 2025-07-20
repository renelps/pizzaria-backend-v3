import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { OrderService } from '../orders/orders.service';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bodyParser from 'body-parser';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let stripeService: StripeService;
  let orderService: OrderService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: StripeService,
          useValue: {
            createPaymentIntent: jest.fn(),
            constructWebhookEvent: jest.fn(),
          },
        },
        {
          provide: OrderService,
          useValue: {
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    stripeService = moduleFixture.get<StripeService>(StripeService);
    orderService = moduleFixture.get<OrderService>(OrderService);
    app = moduleFixture.createNestApplication();

    app.use('/payments/webhook', bodyParser.raw({ type: '*/*' }));

    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create a payment intent', async () => {
    const mockPaymentIntent = { client_secret: 'secret' };
    (stripeService.createPaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);

    const response = await request(app.getHttpServer())
      .post('/payments/create-payment-intent')
      .send({ amount: 1000, orderId: 1 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ clientSecret: 'secret' });
  });

  it('should handle webhook event successfully', async () => {
    const fakeRawBody = JSON.stringify({
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: { object: { metadata: { orderId: '123' } } },
    });
    const fakeSignature = 'fake_signature';
    const fakeEvent = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: { object: { metadata: { orderId: '123' } } },
    };

    (stripeService.constructWebhookEvent as jest.Mock).mockReturnValue(fakeEvent);
    (orderService.updateStatus as jest.Mock).mockResolvedValue(true);

    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set('stripe-signature', fakeSignature)
      .send(fakeRawBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    expect(orderService.updateStatus).toHaveBeenCalledWith(123, 'PAID');
  });

  it('should return 400 for invalid webhook signature', async () => {
    (stripeService.constructWebhookEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set('stripe-signature', 'fake_signature')
      .send('{}');

    expect(response.status).toBe(400);
    expect(response.text).toContain('Webhook Error: Invalid signature');
  });
});
