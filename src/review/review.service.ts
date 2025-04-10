// review.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateReviewDto, userId: bigint) {
        this.validateRating(dto.rating);
      
        const service = await this.prisma.service.findUnique({
          where: { id: dto.serviceId }
        });
      
        if (!service) {
          throw new NotFoundException(`Service with ID ${dto.serviceId} not found`);
        }
      
        const provider = await this.prisma.providerProfile.findUnique({
          where: { id: dto.providerId }
        });
      
        if (!provider) {
          throw new NotFoundException(`Provider with ID ${dto.providerId} not found`);
        }
      
        const existingReview = await this.prisma.review.findFirst({
          where: {
            userId,
            serviceId: dto.serviceId
          }
        });
      
        if (existingReview) {
          throw new BadRequestException('You have already reviewed this service');
        }
      
        return this.prisma.review.create({
            data: {
              userId: userId, // 👈 bigint
              serviceId: dto.serviceId,
              providerId: dto.providerId,
              rating: dto.rating,
              comment: dto.comment,
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              service: true,
              provider: true,
            },
          });
          
      }
      

    async findAll() {
        return this.prisma.review.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                service: true,
                provider: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findOne(id: bigint) {
        const review = await this.prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                service: true,
                provider: true,
            }
        });

        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }

        return review;
    }

    async update(id: bigint, dto: UpdateReviewDto, userId: bigint) {
        if (dto.rating) {
            this.validateRating(dto.rating);
        }

        const review = await this.findOne(id);

        // Only allow update if user is the owner or an admin
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user || (review.userId !== userId && user.role !== Role.ADMIN)) {
            throw new ForbiddenException('You are not authorized to update this review');
        }

        return this.prisma.review.update({
            where: { id },
            data: {
                rating: dto.rating,
                comment: dto.comment,
                // لا حاجة لتعيين updatedAt يدويًا إذا كان لديك @updatedAt في الـ schema
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                service: true,
                provider: true,
            }
        });
    }

    async delete(id: bigint, userId: bigint) {
        const review = await this.findOne(id);

        // Only allow delete if user is the owner or an admin
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user || (review.userId !== userId && user.role !== Role.ADMIN)) {
            throw new ForbiddenException('You are not authorized to delete this review');
        }

        return this.prisma.review.delete({
            where: { id }
        });
    }

    private validateRating(rating: number): void {
        if (rating < 1 || rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }
    }
}
