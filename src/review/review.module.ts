import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [ReviewController],  // Ensure the controller is registered here
  providers: [ReviewService, PrismaService],
})
export class ReviewModule {}
