import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface TradeDto {
  userId: string;
  assetId: string;
  vaultId: string;
  quantity: number;
  currency: string;
}

interface TeleportDto {
  userId: string;
  assetId: string;
  fromVaultId: string;
  toVaultId: string;
  quantity: number;
}

@Injectable()
export class TradeExecutionService {
  constructor(private readonly prisma: PrismaService) {}

  async executeBuy(dto: TradeDto) {
    const asset = await this.prisma.asset.findUniqueOrThrow({
      where: { id: dto.assetId },
    });

    const totalAmount =
      Number(asset.livePriceAsk) * dto.quantity;

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        assetId: dto.assetId,
        type: 'BUY',
        status: 'COMPLETED',
        quantity: dto.quantity,
        pricePerUnit: asset.livePriceAsk,
        totalAmount,
        currency: dto.currency as any,
        toVaultId: dto.vaultId,
      },
    });

    await this.prisma.holding.upsert({
      where: {
        userId_assetId_vaultId: {
          userId: dto.userId,
          assetId: dto.assetId,
          vaultId: dto.vaultId,
        },
      },
      update: {
        quantity: { increment: dto.quantity },
      },
      create: {
        userId: dto.userId,
        assetId: dto.assetId,
        vaultId: dto.vaultId,
        quantity: dto.quantity,
      },
    });

    return transaction;
  }

  async executeSell(dto: TradeDto) {
    const asset = await this.prisma.asset.findUniqueOrThrow({
      where: { id: dto.assetId },
    });

    const totalAmount =
      Number(asset.livePriceBid) * dto.quantity;

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        assetId: dto.assetId,
        type: 'SELL',
        status: 'COMPLETED',
        quantity: dto.quantity,
        pricePerUnit: asset.livePriceBid,
        totalAmount,
        currency: dto.currency as any,
        fromVaultId: dto.vaultId,
      },
    });

    await this.prisma.holding.update({
      where: {
        userId_assetId_vaultId: {
          userId: dto.userId,
          assetId: dto.assetId,
          vaultId: dto.vaultId,
        },
      },
      data: {
        quantity: { decrement: dto.quantity },
      },
    });

    return transaction;
  }

  async executeTeleport(dto: TeleportDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        assetId: dto.assetId,
        type: 'TELEPORT',
        status: 'COMPLETED',
        quantity: dto.quantity,
        pricePerUnit: 0,
        totalAmount: 0,
        fromVaultId: dto.fromVaultId,
        toVaultId: dto.toVaultId,
      },
    });

    await this.prisma.holding.update({
      where: {
        userId_assetId_vaultId: {
          userId: dto.userId,
          assetId: dto.assetId,
          vaultId: dto.fromVaultId,
        },
      },
      data: {
        quantity: { decrement: dto.quantity },
      },
    });

    await this.prisma.holding.upsert({
      where: {
        userId_assetId_vaultId: {
          userId: dto.userId,
          assetId: dto.assetId,
          vaultId: dto.toVaultId,
        },
      },
      update: {
        quantity: { increment: dto.quantity },
      },
      create: {
        userId: dto.userId,
        assetId: dto.assetId,
        vaultId: dto.toVaultId,
        quantity: dto.quantity,
      },
    });

    return transaction;
  }

  async getHoldings(userId: string) {
    return this.prisma.holding.findMany({
      where: { userId },
      include: {
        asset: true,
        vault: true,
      },
    });
  }
}
