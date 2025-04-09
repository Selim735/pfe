import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';

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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'PROVIDER') {
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

  async update(userId: bigint, dto: UpdateProviderProfileDto) {
    const profile = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
  
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
  
    if (user.role !== 'PROVIDER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
  
    if (user.role !== 'ADMIN' && profile.userId !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }
  
    // ❌ Prevent providers from updating the businessName
    if (user.role !== 'ADMIN' && dto.businessName && dto.businessName !== profile.businessName) {
      throw new ForbiddenException('Only admins can update business name');
    }
  
    const updated = await this.prisma.providerProfile.update({
      where: { userId },
      data: {
        ...dto,
        // ✅ In case someone tries to send a new businessName, this ensures it doesn't change
        ...(user.role !== 'ADMIN' && { businessName: undefined }),
      },
    });
  
    return this.convertBigIntToString(updated);
  }
  

  async adminUpdate(adminId: bigint, targetUserId: bigint, dto: UpdateProviderProfileDto) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can perform this action');
    }
  
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userId: targetUserId },
    });
    if (!profile) throw new NotFoundException('Profile not found');
  
    const updated = await this.prisma.providerProfile.update({
      where: { userId: targetUserId },
      data: { ...dto },
    });
  
    return this.convertBigIntToString(updated);
  }
  

  async delete(userId: bigint, targetUserId: bigint) {
    const profile = await this.prisma.providerProfile.findUnique({ where: { userId: targetUserId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== 'ADMIN' && userId !== targetUserId) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    await this.prisma.providerProfile.delete({ where: { userId: targetUserId } });

    return { message: 'Profile deleted successfully' };
  }
}
