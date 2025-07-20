import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('StockMovementsController (e2e)', () => {
  let app: INestApplication;
  let stockMovementsService: StockMovementsService;

  const mockStockMovementsService = {
    findAllByPizza: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: () => true,
  };
  const mockRolesGuard = {
    canActivate: () => true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StockMovementsController],
      providers: [
        { provide: StockMovementsService, useValue: mockStockMovementsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    stockMovementsService = moduleFixture.get<StockMovementsService>(StockMovementsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/GET stock-movements/pizza/:pizzaId', () => {
    it('should return an array of stock movements', async () => {
      const mockData = [
        { id: 1, pizzaId: 1, quantity: 5, reason: 'Restock', createdAt: new Date() },
      ];
      mockStockMovementsService.findAllByPizza.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer())
        .get('/stock-movements/pizza/1')
        .expect(200);

      const mockDataWithStringDates = mockData.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }));

      expect(response.body).toEqual(mockDataWithStringDates);
      expect(mockStockMovementsService.findAllByPizza).toHaveBeenCalledWith(1);
    });
  });

  describe('/POST stock-movements', () => {
    it('should create a stock movement', async () => {
      const dto = { pizzaId: 1, quantity: 3, reason: 'Restock' };
      const mockResponse = { id: 1, ...dto, createdAt: new Date() };
      mockStockMovementsService.create.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/stock-movements')
        .send(dto)
        .expect(201);

      const mockResponseWithStringDate = {
        ...mockResponse,
        createdAt: mockResponse.createdAt.toISOString(),
      };

      expect(response.body).toEqual(mockResponseWithStringDate);
      expect(mockStockMovementsService.create).toHaveBeenCalledWith(dto);
    });
  });
});
