import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) { }

  async createService(userId: bigint, role: string, dto: CreateServiceDto) {
    // Ensure only PROVIDER or ADMIN can create a service
    if (role !== 'PROVIDER' && role !== 'ADMIN') {
      throw new ForbiddenException('Only providers and admins can create services');
    }
  
    // Check if PROVIDER profile exists if the role is PROVIDER
    const providerProfile = role === 'PROVIDER'
      ? await this.prisma.providerProfile.findUnique({
          where: { userId: userId },
        })
      : null;
  
    if (role === 'PROVIDER' && !providerProfile) {
      throw new ForbiddenException('You must create a provider profile first');
    }
    
    // If role is PROVIDER, check if provider already has a service
    if (role === 'PROVIDER' && providerProfile) {
      const existingService = await this.prisma.service.findFirst({
        where: { providerId: providerProfile.id },
      });
      
      if (existingService) {
        throw new ForbiddenException('A provider can only create one service');
      }
    }
  
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: BigInt(dto.categoryId) },
    });
  
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  
    // Assign providerId based on role
    const providerId = role === 'ADMIN' ? null : providerProfile?.id ?? null;
  
    // Create the service
    return this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        priceUnit: dto.priceUnit,
        duration: dto.duration,
        isAvailable: dto.isAvailable ?? true, // Default to true if not provided
        categoryId: BigInt(dto.categoryId),
        providerId: providerId, // Can be null for ADMIN
      },
    });
  }
  
  async getAllServices() {
    return this.prisma.service.findMany({
      include: {
        category: true,
        provider: true,
      },
    });
  }

  async getServiceById(id: bigint) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        provider: true,
      },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async updateService(id: bigint, data: Partial<CreateServiceDto>) {
    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async deleteService(id: bigint) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}