// review.controller.ts
import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    HttpCode, 
    HttpStatus, 
    Param, 
    ParseIntPipe, 
    Patch, 
    Post, 
    UseGuards 
  } from '@nestjs/common';
  import { CreateReviewDto } from './dto/create-review.dto';
  import { UpdateReviewDto } from './dto/update-review.dto';
  import { ReviewService } from './review.service';
  import { Roles } from '../auth/role.decorator';
  import { RolesGuard } from '../auth/roles.guard';
  import { JwtGuard } from '../auth/jwt.guard';
  import { Role } from '@prisma/client';
  import { User } from '../user.decorator';
  
  @Controller('reviews')
  @UseGuards(JwtGuard, RolesGuard)
  export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}
  
    @Post()
    @Roles(Role.USER, Role.ADMIN, Role.PROVIDER)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateReviewDto, @User('sub') userIdStr: string) {
      const userId = BigInt(userIdStr);
      return this.reviewService.create(dto, userId);
    }
    
  
    @Get()
    @Roles(Role.ADMIN, Role.PROVIDER)
    @HttpCode(HttpStatus.OK)
    async findAll() {
      return this.reviewService.findAll();
    }
  
    @Get(':id')
    @Roles(Role.ADMIN, Role.PROVIDER, Role.USER)
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.reviewService.findOne(BigInt(id));
    }
  
    @Patch(':id')
    @Roles(Role.ADMIN, Role.PROVIDER)
    @HttpCode(HttpStatus.OK)
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateReviewDto: UpdateReviewDto,
      @User('id') userId: bigint
    ) {
      return this.reviewService.update(BigInt(id), updateReviewDto, userId);
    }
  
    @Delete(':id')
    @Roles(Role.ADMIN, Role.PROVIDER)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number, @User('id') userId: bigint) {
      return this.reviewService.delete(BigInt(id), userId);
    }
  }