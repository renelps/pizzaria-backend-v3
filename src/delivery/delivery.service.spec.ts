import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryService } from './delivery.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeoService } from '../shared/geo.service';
import { DeliveryStatus } from '@prisma/client';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let prisma: PrismaService;
  let geoService: GeoService;

  const mockUserId = 1;
  const mockOrder = { id: 1, userId: mockUserId };
  const mockAddress = {
    id: 1,
    userId: mockUserId,
    latitude: -23.5,
    longitude: -46.6,
  };
  const mockDelivery = {
    id: 1,
    order: mockOrder,
    status: DeliveryStatus.PENDING,
  };
  const geoInfoMock = { distanceText: '10 km', durationText: '15 mins' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: PrismaService,
          useValue: {
            address: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            order: {
              findUnique: jest.fn(),
            },
            delivery: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: GeoService,
          useValue: {
            getDistanceAndDuration: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
    prisma = module.get<PrismaService>(PrismaService);
    geoService = module.get<GeoService>(GeoService);
  });

  it('should create address', async () => {
    (prisma.address.create as jest.Mock).mockResolvedValue(mockAddress);
    const result = await service.createAddress(mockUserId, { street: 'Rua A', number: '10', city: 'Cidade', state: 'ST', zipCode: '12345-678' });
    expect(prisma.address.create).toHaveBeenCalledWith({
      data: { street: 'Rua A', number: '10', city: 'Cidade', state: 'ST', zipCode: '12345-678', country: 'Brasil', userId: mockUserId },
    });
    expect(result).toEqual(mockAddress);
  });

  it('should get addresses by user', async () => {
    (prisma.address.findMany as jest.Mock).mockResolvedValue([mockAddress]);
    const result = await service.getAddressByUser(mockUserId);
    expect(prisma.address.findMany).toHaveBeenCalledWith({ where: { userId: mockUserId } });
    expect(result).toEqual([mockAddress]);
  });

  it('should update address when user owns it', async () => {
    (prisma.address.findUnique as jest.Mock).mockResolvedValue(mockAddress);
    (prisma.address.update as jest.Mock).mockResolvedValue(mockAddress);
    const result = await service.updateAddress(mockUserId, 1, { street: 'Rua B' });
    expect(prisma.address.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { street: 'Rua B' } });
    expect(result).toEqual(mockAddress);
  });

  it('should throw NotFoundException when updating non-existing address', async () => {
    (prisma.address.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.updateAddress(mockUserId, 99, {})).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when updating address not owned by user', async () => {
    (prisma.address.findUnique as jest.Mock).mockResolvedValue({ ...mockAddress, userId: 999 });
    await expect(service.updateAddress(mockUserId, 1, {})).rejects.toThrow(ForbiddenException);
  });

  it('should create delivery successfully', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.address.findUnique as jest.Mock).mockResolvedValue(mockAddress);
    (geoService.getDistanceAndDuration as jest.Mock).mockResolvedValue(geoInfoMock);
    (prisma.delivery.create as jest.Mock).mockResolvedValue(mockDelivery);

    const createDeliveryDto = {
      orderId: 1,
      addressId: 1,
      status: DeliveryStatus.PENDING,
      estimatedAt: undefined,
      deliveredAt: undefined,
    };

    const result = await service.createDelivery(mockUserId, createDeliveryDto);
    expect(prisma.delivery.create).toHaveBeenCalledWith({
      data: {
        orderId: 1,
        addressId: 1,
        status: DeliveryStatus.PENDING,
        estimatedAt: undefined,
        deliveredAt: undefined,
        distance: geoInfoMock.distanceText,
        duration: geoInfoMock.durationText,
      },
    });
    expect(result).toEqual(mockDelivery);
  });

  it('should throw NotFoundException if order not found on createDelivery', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.createDelivery(mockUserId, { orderId: 1, addressId: 1, status: DeliveryStatus.PENDING })).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user does not own order', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({ ...mockOrder, userId: 999 });
    await expect(service.createDelivery(mockUserId, { orderId: 1, addressId: 1, status: DeliveryStatus.PENDING })).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if address not found on createDelivery', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.address.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.createDelivery(mockUserId, { orderId: 1, addressId: 1, status: DeliveryStatus.PENDING })).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user does not own address', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.address.findUnique as jest.Mock).mockResolvedValue({ ...mockAddress, userId: 999 });
    await expect(service.createDelivery(mockUserId, { orderId: 1, addressId: 1, status: DeliveryStatus.PENDING })).rejects.toThrow(ForbiddenException);
  });

  it('should throw InternalServerErrorException if geoService fails', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.address.findUnique as jest.Mock).mockResolvedValue(mockAddress);
    (geoService.getDistanceAndDuration as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(service.createDelivery(mockUserId, { orderId: 1, addressId: 1, status: DeliveryStatus.PENDING })).rejects.toThrow(InternalServerErrorException);
  });

  it('should update delivery when user owns it', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue({ ...mockDelivery, order: mockOrder });
    (prisma.delivery.update as jest.Mock).mockResolvedValue(mockDelivery);
    const result = await service.updateDelivery(mockUserId, 1, { status: DeliveryStatus.DELIVERED });
    expect(prisma.delivery.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: DeliveryStatus.DELIVERED } });
    expect(result).toEqual(mockDelivery);
  });

  it('should throw NotFoundException when updating non-existing delivery', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.updateDelivery(mockUserId, 99, {})).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when updating delivery not owned by user', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue({ ...mockDelivery, order: { ...mockOrder, userId: 999 } });
    await expect(service.updateDelivery(mockUserId, 1, {})).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException on invalid status update', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue({ ...mockDelivery, order: mockOrder });
    await expect(service.updateDelivery(mockUserId, 1, { status: 'invalid' as any })).rejects.toThrow(BadRequestException);
  });

  it('should update delivery status when user owns it', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue({ ...mockDelivery, order: mockOrder });
    (prisma.delivery.update as jest.Mock).mockResolvedValue(mockDelivery);
    const result = await service.updateDeliveryStatus(mockUserId, 1, DeliveryStatus.DELIVERED);
    expect(prisma.delivery.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: DeliveryStatus.DELIVERED } });
    expect(result).toEqual(mockDelivery);
  });

  it('should throw BadRequestException on invalid status in updateDeliveryStatus', async () => {
    await expect(service.updateDeliveryStatus(mockUserId, 1, 'invalid' as any)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when updating status of non-existing delivery', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.updateDeliveryStatus(mockUserId, 99, DeliveryStatus.PENDING)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when updating status of delivery not owned by user', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue({ ...mockDelivery, order: { ...mockOrder, userId: 999 } });
    await expect(service.updateDeliveryStatus(mockUserId, 1, DeliveryStatus.PENDING)).rejects.toThrow(ForbiddenException);
  });

  it('should get delivery details when user owns it', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue({ ...mockDelivery, order: mockOrder, address: mockAddress });
    const result = await service.getDelivery(mockUserId, 1);
    expect(prisma.delivery.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { order: true, address: true },
    });
    expect(result).toEqual({ ...mockDelivery, order: mockOrder, address: mockAddress });
  });

  it('should throw NotFoundException when getting non-existing delivery', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.getDelivery(mockUserId, 99)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when getting delivery not owned by user', async () => {
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue({ ...mockDelivery, order: { ...mockOrder, userId: 999 } });
    await expect(service.getDelivery(mockUserId, 1)).rejects.toThrow(ForbiddenException);
  });
});
