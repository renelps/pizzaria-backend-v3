import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryStatus } from '@prisma/client';

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let service: DeliveryService;

  const mockUserId = 1;

  const mockDelivery = { id: 1, status: DeliveryStatus.PENDING };
  const mockAddress = {
    id: 1,
    street: 'Test Street',
    number: '123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
  };

  const req = { user: { userId: mockUserId } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        {
          provide: DeliveryService,
          useValue: {
            createAddress: jest.fn(),
            getAddressByUser: jest.fn(),
            updateAddress: jest.fn(),
            createDelivery: jest.fn(),
            updateDelivery: jest.fn(),
            updateDeliveryStatus: jest.fn(),
            getDelivery: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
    service = module.get<DeliveryService>(DeliveryService);
  });

  it('should create address', async () => {
    (service.createAddress as jest.Mock).mockResolvedValue(mockAddress);
    const result = await controller.createAddress(req, {
      street: 'Test Street',
      number: '123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    });
    expect(service.createAddress).toHaveBeenCalledWith(mockUserId, {
      street: 'Test Street',
      number: '123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    });
    expect(result).toEqual(mockAddress);
  });

  it('should get addresses by user', async () => {
    (service.getAddressByUser as jest.Mock).mockResolvedValue([mockAddress]);
    const result = await controller.getAddressesByUser(req);
    expect(service.getAddressByUser).toHaveBeenCalledWith(mockUserId);
    expect(result).toEqual([mockAddress]);
  });

  it('should update address', async () => {
    (service.updateAddress as jest.Mock).mockResolvedValue(mockAddress);
    const result = await controller.updateAddress(req, 1, {
      street: 'New Street',
      number: '456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '21000-000',
    });
    expect(service.updateAddress).toHaveBeenCalledWith(mockUserId, 1, {
      street: 'New Street',
      number: '456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '21000-000',
    });
    expect(result).toEqual(mockAddress);
  });

  it('should create delivery', async () => {
    (service.createDelivery as jest.Mock).mockResolvedValue(mockDelivery);
    const deliveryData = { orderId: 123, addressId: 1, status: DeliveryStatus.PENDING };
    const result = await controller.createDelivery(req, deliveryData);
    expect(service.createDelivery).toHaveBeenCalledWith(mockUserId, deliveryData);
    expect(result).toEqual(mockDelivery);
  });

  it('should update delivery', async () => {
    (service.updateDelivery as jest.Mock).mockResolvedValue(mockDelivery);
    const result = await controller.updateDelivery(req, 1, { status: DeliveryStatus.DELIVERED });
    expect(service.updateDelivery).toHaveBeenCalledWith(mockUserId, 1, { status: DeliveryStatus.DELIVERED });
    expect(result).toEqual(mockDelivery);
  });

  it('should update delivery status', async () => {
    (service.updateDeliveryStatus as jest.Mock).mockResolvedValue(mockDelivery);
    const result = await controller.updateStatus(1, DeliveryStatus.CANCELLED, req);
    expect(service.updateDeliveryStatus).toHaveBeenCalledWith(mockUserId, 1, DeliveryStatus.CANCELLED);
    expect(result).toEqual(mockDelivery);
  });

  it('should get delivery details', async () => {
    (service.getDelivery as jest.Mock).mockResolvedValue(mockDelivery);
    const result = await controller.getDelivery(1, req);
    expect(service.getDelivery).toHaveBeenCalledWith(mockUserId, 1);
    expect(result).toEqual(mockDelivery);
  });
});
