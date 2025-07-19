import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('stock-movements')
@Controller('stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get('pizza/:pizzaId')
  @Roles('ADMIN', 'USER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all stock movements for a specific pizza' })
  @ApiParam({ name: 'pizzaId', description: 'ID of the pizza', type: Number })
  @ApiResponse({ status: 200, description: 'List of stock movements returned' })
  async findAllByPizza(@Param('pizzaId', ParseIntPipe) pizzaId: number) {
    return this.stockMovementsService.findAllByPizza(pizzaId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new stock movement' })
  @ApiResponse({ status: 201, description: 'Stock movement created successfully' })
  async create(@Body() data: CreateStockMovementDto) {
    return this.stockMovementsService.create(data);
  }
}
