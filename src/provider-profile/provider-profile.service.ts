import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProviderProfileService {
  constructor(private prisma: PrismaService) {}

  private convertBigIntToString(obj: any): any {
    return JSON.parse(
      JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }
  
  async create(userId: bigint, dto: CreateProviderProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
  
    if (!user || user.role !== 'PROVIDER') {
      throw new ForbiddenException('Only PROVIDERs can create a provider profile');
    }
  
    const existingProfile = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (existingProfile) {
      throw new BadRequestException('Provider profile already exists for this user');
    }
  
    const profile = await this.prisma.providerProfile.create({
      data: {
        ...dto,
        userId,
      },
    });
  
    return this.convertBigIntToString(profile);
  }
  
  async findByUserId(userId: bigint) {
    const profile = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.convertBigIntToString(profile);
  }
  
  // You can later add update/delete if needed
}