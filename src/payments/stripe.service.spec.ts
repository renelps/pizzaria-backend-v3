import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';

const mockPaymentIntents = {
  create: jest.fn(),
  retrieve: jest.fn(),
};

const MockStripe = jest.fn().mockImplementation(() => ({
  paymentIntents: mockPaymentIntents,
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => new MockStripe());
});

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeService],
    })
      .overrideProvider(StripeService)
      .useFactory({
        factory: () => {
          const stripeService = new StripeService();
          (stripeService as any).stripe = new MockStripe();
          return stripeService;
        },
      })
      .compile();

    service = module.get<StripeService>(StripeService);

    mockPaymentIntents.create.mockReset();
    mockPaymentIntents.retrieve.mockReset();
  });

  it('should create a payment intent with correct parameters', async () => {
    const mockedResponse = { id: 'pi_1', client_secret: 'secret_abc' };
    mockPaymentIntents.create.mockResolvedValue(mockedResponse);

    const result = await service.createPaymentIntent(10, 'brl', { orderId: '123' });

    expect(mockPaymentIntents.create).toHaveBeenCalledWith({
      amount: 1000,
      currency: 'brl',
      metadata: { orderId: '123' },
    });
    expect(result).toEqual(mockedResponse);
  });

  it('should retrieve a payment intent by ID', async () => {
    const mockedResponse = { id: 'pi_1', status: 'succeeded' };
    mockPaymentIntents.retrieve.mockResolvedValue(mockedResponse);

    const result = await service.retrievePaymentIntent('pi_1');

    expect(mockPaymentIntents.retrieve).toHaveBeenCalledWith('pi_1');
    expect(result).toEqual(mockedResponse);
  });
});
