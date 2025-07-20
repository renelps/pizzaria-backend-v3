import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: PrismaService;
  let gateway: OrdersGateway;

  const mockUserId = 1;
  const mockOrderId = 10;

  const mockPizzasFromDb = [
    { id: 1, price: 20 },
    { id: 3, price: 30 },
  ];

  const mockOrder = {
    id: mockOrderId,
    userId: mockUserId,
    status: OrderStatus.PENDING,
    total: 70,
    orderPizzas: [
      { pizzaId: 1, quantity: 2, pizza: { id: 1, price: 20 } },
      { pizzaId: 3, quantity: 1, pizza: { id: 3, price: 30 } },
    ],
    delivery: null,
    user: { id: mockUserId },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: {
            pizza: {
              findMany: jest.fn(),
            },
            order: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: OrdersGateway,
          useValue: {
            sendOrderStatusUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<OrdersGateway>(OrdersGateway);
  });

  describe('create', () => {
    it('should create order and call gateway', async () => {
      const createDto = {
        userId: mockUserId,
        pizzas: [
          { pizzaId: 1, quantity: 2 },
          { pizzaId: 3, quantity: 1 },
        ],
        status: OrderStatus.PENDING,
        addressId: undefined,
      };

      (prisma.pizza.findMany as jest.Mock).mockResolvedValue(mockPizzasFromDb);
      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await service.create(createDto);

      expect(prisma.pizza.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 3] } },
      });

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: createDto.status,
          total: 70,
          user: { connect: { id: mockUserId } },
          orderPizzas: expect.any(Object),
          delivery: undefined,
        }),
        include: expect.any(Object),
      });

      expect(gateway.sendOrderStatusUpdate).toHaveBeenCalledWith(mockOrderId, OrderStatus.PENDING);
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if some pizza is missing', async () => {
      (prisma.pizza.findMany as jest.Mock).mockResolvedValue([{ id: 1, price: 20 }]); // missing pizza 3

      await expect(
        service.create({
          userId: mockUserId,
          pizzas: [
            { pizzaId: 1, quantity: 2 },
            { pizzaId: 3, quantity: 1 },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      const result = await service.findAll();

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        include: {
          orderPizzas: { include: { pizza: true } },
          delivery: true,
          user: true,
        },
      });

      expect(result).toEqual([mockOrder]);
    });
  });

  describe('findOne', () => {
    it('should return order if user owns it', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await service.findOne(mockOrderId, mockUserId);

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        include: {
          orderPizzas: { include: { pizza: true } },
          delivery: true,
          user: true,
        },
      });

      expect(result).toEqual(mockOrder);
    });

    it('should throw ForbiddenException if user does not own order', async () => {
      const orderNotOwned = { ...mockOrder, userId: 2 };
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(orderNotOwned);

      await expect(service.findOne(mockOrderId, mockUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if order not found', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(mockOrderId, mockUserId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status and call gateway', async () => {
      const updatedOrder = { ...mockOrder, status: OrderStatus.DELIVERED };
      (prisma.order.update as jest.Mock).mockResolvedValue(updatedOrder);

      const result = await service.updateStatus(mockOrderId, OrderStatus.DELIVERED);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: { status: OrderStatus.DELIVERED },
        include: {
          orderPizzas: { include: { pizza: true } },
          delivery: true,
          user: true,
        },
      });

      expect(gateway.sendOrderStatusUpdate).toHaveBeenCalledWith(mockOrderId, OrderStatus.DELIVERED);
      expect(result).toEqual(updatedOrder);
    });
  });
});
