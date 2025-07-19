import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeoService } from '../shared/geo.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { DeliveryStatus } from '@prisma/client';

@Injectable()
export class DeliveryService {
  constructor(
    private prisma: PrismaService,
    private geoService: GeoService,
  ) {}

  async createAddress(userId: number, data: CreateAddressDto) {
    return this.prisma.address.create({
      data: {
        ...data,
        country: data.country || 'Brasil',
        userId,
      },
    });
  }

  async getAddressByUser(userId: number) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  async updateAddress(userId: number, id: number, data: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId)
      throw new ForbiddenException('You do not own this address');

    return this.prisma.address.update({ where: { id }, data });
  }

  async createDelivery(userId: number, data: CreateDeliveryDto) {
    const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId)
      throw new ForbiddenException('You do not own this order');

    const address = await this.prisma.address.findUnique({ where: { id: data.addressId } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId)
      throw new ForbiddenException('You do not own this address');

    const origin = 'LATITUDE_RESTAURANTE,LONGITUDE_RESTAURANTE'; 
    const destination = `${address.latitude},${address.longitude}`;

    let geoInfo;
    try {
      geoInfo = await this.geoService.getDistanceAndDuration(origin, destination);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao calcular distância e duração');
    }

    return this.prisma.delivery.create({
      data: {
        orderId: data.orderId,
        addressId: data.addressId,
        status: data.status,
        estimatedAt: data.estimatedAt ? new Date(data.estimatedAt) : undefined,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
        distance: geoInfo.distanceText,
        duration: geoInfo.durationText,
      },
    });
  }

  async updateDelivery(userId: number, id: number, data: UpdateDeliveryDto) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.order.userId !== userId)
      throw new ForbiddenException('You do not own this delivery');

    if (data.status && !Object.values(DeliveryStatus).includes(data.status)) {
      throw new BadRequestException('Invalid delivery status');
    }

    return this.prisma.delivery.update({ where: { id }, data });
  }

  async updateDeliveryStatus(userId: number, id: number, status: DeliveryStatus) {
    if (!Object.values(DeliveryStatus).includes(status)) {
      throw new BadRequestException('Invalid delivery status');
    }

    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.order.userId !== userId)
      throw new ForbiddenException('You do not own this delivery');

    return this.prisma.delivery.update({ where: { id }, data: { status } });
  }

  async getDelivery(userId: number, id: number) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { order: true, address: true },
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.order.userId !== userId)
      throw new ForbiddenException('You do not own this delivery');

    return delivery;
  }
}
