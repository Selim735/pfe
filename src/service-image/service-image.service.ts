import { ForbiddenException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceImageDto } from './dto/create-service-image.dto';
import { UpdateServiceImageDto } from './dto/update-service-image.dto';

@Injectable()
export class ServiceImageService {
  private readonly logger = new Logger(ServiceImageService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: bigint, role: string, dto: CreateServiceImageDto) {
    this.logger.log(`Service create called: userId=${userId}, role=${role}, serviceId=${dto.serviceId}`);
    
    try {
      // Safe conversion to BigInt
      const serviceId = BigInt(Number(dto.serviceId));
      
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
        include: { provider: true },
      });

      if (!service) throw new NotFoundException(`Service with id ${serviceId} not found`);

      if (role !== 'ADMIN') {
        const provider = await this.prisma.providerProfile.findUnique({ where: { userId } });
        
        if (!provider) {
          throw new ForbiddenException('Provider profile not found');
        }
        
        if (service.providerId !== provider.id) {
          throw new ForbiddenException('Access denied - you do not own this service');
        }
      }

      this.logger.log(`Creating service image for serviceId=${serviceId}`);
      
      return this.prisma.serviceImage.create({
        data: {
          serviceId: serviceId,
          imageUrl: dto.imageUrl,
          isPrimary: dto.isPrimary ?? false,
        },
      });
    } catch (error) {
      this.logger.error(`Error in create service image: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.serviceImage.findMany();
  }

  async findOne(id: bigint) {
    const image = await this.prisma.serviceImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException(`Image with id ${id} not found`);
    return image;
  }

  async update(userId: bigint, role: string, id: bigint, dto: UpdateServiceImageDto) {
    try {
      const image = await this.prisma.serviceImage.findUnique({
        where: { id },
        include: { service: true },
      });

      if (!image) throw new NotFoundException(`Image with id ${id} not found`);

      if (role !== 'ADMIN') {
        const provider = await this.prisma.providerProfile.findUnique({ where: { userId } });
        if (!provider) {
          throw new ForbiddenException('Provider profile not found');
        }
        
        if (image.service.providerId !== provider.id) {
          throw new ForbiddenException('Access denied - you do not own this service image');
        }
      }

      return this.prisma.serviceImage.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.logger.error(`Error in update service image: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(userId: bigint, role: string, id: bigint) {
    try {
      const image = await this.prisma.serviceImage.findUnique({
        where: { id },
        include: { service: true },
      });

      if (!image) throw new NotFoundException(`Image with id ${id} not found`);

      if (role !== 'ADMIN') {
        const provider = await this.prisma.providerProfile.findUnique({ where: { userId } });
        if (!provider) {
          throw new ForbiddenException('Provider profile not found');
        }
        
        if (image.service.providerId !== provider.id) {
          throw new ForbiddenException('Access denied - you do not own this service image');
        }
      }

      return this.prisma.serviceImage.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error in remove service image: ${error.message}`, error.stack);
      throw error;
    }
  }
}