import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';
import { OrderStatus } from '@prisma/client';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockUserId = 1;
  const mockOrder = { id: 1, userId: mockUserId, status: OrderStatus.PENDING };
  const mockAdminOrder = { id: 2, userId: 2, status: OrderStatus.PAID };

  const reqUser = { user: { userId: mockUserId, role: 'USER' } };
  const reqAdmin = { user: { userId: 999, role: 'ADMIN' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should get all orders (admin)', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([mockOrder, mockAdminOrder]);
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockOrder, mockAdminOrder]);
  });

  it('should get order by id for user role with userId filter', async () => {
    (service.findOne as jest.Mock).mockResolvedValue(mockOrder);
    const result = await controller.findOne(1, reqUser);
    expect(service.findOne).toHaveBeenCalledWith(1, mockUserId);
    expect(result).toEqual(mockOrder);
  });

  it('should get order by id for admin without userId filter', async () => {
    (service.findOne as jest.Mock).mockResolvedValue(mockAdminOrder);
    const result = await controller.findOne(2, reqAdmin);
    expect(service.findOne).toHaveBeenCalledWith(2);
    expect(result).toEqual(mockAdminOrder);
  });

  it('should create a new order', async () => {
    type CreateOrderDtoWithoutUserId = Omit<Parameters<typeof controller.create>[0], 'userId'>;

    const createDto: CreateOrderDtoWithoutUserId = {
      pizzas: [
        { pizzaId: 1, quantity: 2 },
        { pizzaId: 3, quantity: 1 },
      ],
      status: OrderStatus.PENDING,
      addressId: 5,
    };

    const createdOrder = { id: 3, userId: mockUserId, ...createDto };

    (service.create as jest.Mock).mockResolvedValue(createdOrder);

    const result = await controller.create(createDto as any, reqUser);

    expect(service.create).toHaveBeenCalledWith({ ...createDto, userId: mockUserId });
    expect(result).toEqual(createdOrder);
  });

  it('should update order status (admin)', async () => {
    (service.updateStatus as jest.Mock).mockResolvedValue({ ...mockAdminOrder, status: OrderStatus.DELIVERED });
    const result = await controller.updateStatus(2, OrderStatus.DELIVERED);
    expect(service.updateStatus).toHaveBeenCalledWith(2, OrderStatus.DELIVERED);
    expect(result.status).toEqual(OrderStatus.DELIVERED);
  });
});
