import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { PizzaService } from './pizzas.service';
import { CreatePizzaDto } from './dto/create-pizza.dto';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import { FilterPizzaDto } from './dto/filter-pizza.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Pizzas')
@ApiBearerAuth()
@Controller('pizzas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PizzaController {
  constructor(
    private readonly pizzaService: PizzaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'List all pizzas with optional filters' })
  @ApiQuery({ name: 'locale', required: false, description: 'Language locale for translations' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for pizza name' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price filter' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price filter' })
  @ApiResponse({ status: 200, description: 'List of pizzas' })
  async findAll(@Query() filter: FilterPizzaDto) {
    return this.pizzaService.findAll(filter);
  }

  @Get(':id')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Get a pizza by ID' })
  @ApiParam({ name: 'id', description: 'Pizza ID', type: Number })
  @ApiQuery({ name: 'locale', required: false, description: 'Language locale for translation' })
  @ApiResponse({ status: 200, description: 'Pizza found' })
  @ApiResponse({ status: 404, description: 'Pizza not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('locale') locale?: string,
  ) {
    return this.pizzaService.findOne(id, locale);
  }

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new pizza with image upload' })
  @ApiResponse({ status: 201, description: 'Pizza created' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    let translations = [];
    if (body.translations) {
      try {
        translations = JSON.parse(body.translations);
      } catch (err) {
        throw new Error('Invalid JSON in translations field');
      }
    }

    let imageUrl = null;
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      imageUrl = result.secure_url;
    }

    const pizzaData: CreatePizzaDto = {
      ...body,
      translations,
      imageUrl,
    };

    return this.pizzaService.create(pizzaData);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a pizza by ID' })
  @ApiParam({ name: 'id', description: 'Pizza ID', type: Number })
  @ApiResponse({ status: 200, description: 'Pizza updated' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePizzaDto,
  ) {
    return this.pizzaService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a pizza by ID' })
  @ApiParam({ name: 'id', description: 'Pizza ID', type: Number })
  @ApiResponse({ status: 204, description: 'Pizza deleted' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaService.remove(id);
  }
}
