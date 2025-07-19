import { 
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { DeliveryStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Delivery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('address')
  @ApiOperation({ summary: 'Create a new delivery address' })
  @ApiResponse({ status: 201, description: 'Address created successfully.' })
  @ApiBody({ type: CreateAddressDto })
  createAddress(@Req() req: any, @Body() data: CreateAddressDto) {
    return this.deliveryService.createAddress(req.user.userId, data);
  }

  @Get('address/user')
  @ApiOperation({ summary: 'Get all delivery addresses for the logged user' })
  @ApiResponse({ status: 200, description: 'List of user addresses.' })
  getAddressesByUser(@Req() req: any) {
    return this.deliveryService.getAddressByUser(req.user.userId);
  }

  @Patch('address/:id')
  @ApiOperation({ summary: 'Update a delivery address' })
  @ApiParam({ name: 'id', description: 'Address ID', type: Number })
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({ status: 200, description: 'Address updated successfully.' })
  updateAddress(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAddressDto,
  ) {
    return this.deliveryService.updateAddress(req.user.userId, id, data);
  }

  @Post()
  @ApiOperation({ summary: 'Create a delivery for an order' })
  @ApiResponse({ status: 201, description: 'Delivery created successfully.' })
  @ApiBody({ type: CreateDeliveryDto })
  createDelivery(@Req() req: any, @Body() data: CreateDeliveryDto) {
    return this.deliveryService.createDelivery(req.user.userId, data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update delivery details' })
  @ApiParam({ name: 'id', description: 'Delivery ID', type: Number })
  @ApiBody({ type: UpdateDeliveryDto })
  @ApiResponse({ status: 200, description: 'Delivery updated successfully.' })
  updateDelivery(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateDeliveryDto,
  ) {
    return this.deliveryService.updateDelivery(req.user.userId, id, data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the delivery status' })
  @ApiParam({ name: 'id', description: 'Delivery ID', type: Number })
  @ApiResponse({ status: 200, description: 'Delivery status updated successfully.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: DeliveryStatus,
    @Req() req: any,
  ) {
    return this.deliveryService.updateDeliveryStatus(req.user.userId, id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a delivery' })
  @ApiParam({ name: 'id', description: 'Delivery ID', type: Number })
  @ApiResponse({ status: 200, description: 'Delivery details retrieved.' })
  getDelivery(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.deliveryService.getDelivery(req.user.userId, id);
  }
}
