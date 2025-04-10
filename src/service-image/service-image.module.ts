import { Module } from '@nestjs/common';
import { ServiceImageController } from './service-image.controller';
import { ServiceImageService } from './service-image.service';

@Module({
  controllers: [ServiceImageController],
  providers: [ServiceImageService]
})
export class ServiceImageModule {}
