// src/provider-profile/provider-profile.module.ts
import { Module } from '@nestjs/common';
import { ProviderProfileService } from './provider-profile.service';
import { ProviderProfileController } from './provider-profile.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; 

@Module({
  imports: [PrismaModule], 
  controllers: [ProviderProfileController],
  providers: [ProviderProfileService],
})
export class ProviderProfileModule {}
