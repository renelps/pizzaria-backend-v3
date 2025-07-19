import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('pizza/:pizzaId')
  @ApiOperation({ summary: 'Get all reviews for a specific pizza' })
  @ApiParam({ name: 'pizzaId', description: 'ID of the pizza', type: Number })
  async findAllByPizza(@Param('pizzaId', ParseIntPipe) pizzaId: number) {
    return this.reviewsService.findAllByPizza(pizzaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by its ID' })
  @ApiParam({ name: 'id', description: 'ID of the review', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  async create(@Request() req: any, @Body() data: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing review' })
  @ApiParam({ name: 'id', description: 'ID of the review to update', type: Number })
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateReviewDto,
  ) {
    return this.reviewsService.update(req.user.userId, id, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'ID of the review to delete', type: Number })
  async remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(req.user.userId, id, req.user.role);
  }
}
