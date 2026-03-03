import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SpotModule } from '../spot/spot.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [SpotModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
  exports: [ProductsService],
})
export class ProductsModule {}
