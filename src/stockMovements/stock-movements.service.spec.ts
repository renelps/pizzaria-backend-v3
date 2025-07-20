import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementsService } from './stock-movements.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let prisma: PrismaService;

  const prismaMock = {
    pizza: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    stockMovement: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<StockMovementsService>(StockMovementsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw NotFoundException if pizza not found', async () => {
      prismaMock.pizza.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ pizzaId: 1, quantity: 5, reason: 'New stock' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update pizza stock and create stock movement', async () => {
      const pizza = { id: 1, stock: 10 };
      prismaMock.pizza.findUnique.mockResolvedValue(pizza);
      prismaMock.pizza.update.mockResolvedValue({ id: 1, stock: 15 });
      prismaMock.stockMovement.create.mockResolvedValue({
        id: 1,
        pizzaId: 1,
        quantity: 5,
        reason: 'New stock',
      });

      const result = await service.create({ pizzaId: 1, quantity: 5, reason: 'New stock' });

      expect(prismaMock.pizza.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prismaMock.pizza.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: 15 },
      });
      expect(prismaMock.stockMovement.create).toHaveBeenCalledWith({
        data: { pizzaId: 1, quantity: 5, reason: 'New stock' },
      });
      expect(result).toEqual({
        id: 1,
        pizzaId: 1,
        quantity: 5,
        reason: 'New stock',
      });
    });
  });

  describe('findAllByPizza', () => {
    it('should return stock movements for pizza', async () => {
      const mockMovements = [
        { id: 1, pizzaId: 1, quantity: 5, reason: 'Restock', createdAt: new Date() },
        { id: 2, pizzaId: 1, quantity: -2, reason: 'Sold', createdAt: new Date() },
      ];
      prismaMock.stockMovement.findMany.mockResolvedValue(mockMovements);

      const result = await service.findAllByPizza(1);

      expect(prismaMock.stockMovement.findMany).toHaveBeenCalledWith({
        where: { pizzaId: 1 },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockMovements);
    });
  });
});
