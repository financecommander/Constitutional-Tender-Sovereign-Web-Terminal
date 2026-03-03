import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [KycController],
  providers: [PrismaService],
})
export class KycModule {}
