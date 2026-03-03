import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SpotModule } from '../spot/spot.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [SpotModule, ReviewsModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
  exports: [ProductsService],
})
export class ProductsModule {}
