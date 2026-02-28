import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { CreateTeleportDto } from './dto/create-teleport.dto';

type TxClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

@Injectable()
export class TradeExecutionService {
  constructor(private readonly prisma: PrismaService) {}

  async executeBuy(userId: string, dto: CreateTradeDto) {
    return this.prisma.$transaction(async (tx: TxClient) => {
      const asset = await tx.asset.findUnique({
        where: { id: dto.assetId },
      });

      if (!asset) {
        throw new NotFoundException('Asset not found');
      }

      if (!asset.isActive) {
        throw new BadRequestException('Asset is not currently available for trading');
      }

      const totalAmount = asset.livePriceAsk.toNumber() * dto.quantity;

      const transaction = await tx.transaction.create({
        data: {
          userId,
          assetId: dto.assetId,
          type: 'BUY',
          status: 'COMPLETED',
          quantity: dto.quantity,
          pricePerUnit: asset.livePriceAsk,
          totalAmount,
          currency: dto.currency as 'USD' | 'EUR' | 'CHF' | 'SGD' | 'KYD' | 'GBP',
          toVaultId: dto.vaultId,
        },
      });

      await tx.holding.upsert({
        where: {
          userId_assetId_vaultId: {
            userId,
            assetId: dto.assetId,
            vaultId: dto.vaultId,
          },
        },
        update: {
          quantity: { increment: dto.quantity },
        },
        create: {
          userId,
          assetId: dto.assetId,
          vaultId: dto.vaultId,
          quantity: dto.quantity,
        },
      });

      return transaction;
    });
  }

  async executeSell(userId: string, dto: CreateTradeDto) {
    return this.prisma.$transaction(async (tx: TxClient) => {
      const asset = await tx.asset.findUnique({
        where: { id: dto.assetId },
      });

      if (!asset) {
        throw new NotFoundException('Asset not found');
      }

      if (!asset.isActive) {
        throw new BadRequestException('Asset is not currently available for trading');
      }

      const holding = await tx.holding.findUnique({
        where: {
          userId_assetId_vaultId: {
            userId,
            assetId: dto.assetId,
            vaultId: dto.vaultId,
          },
        },
      });

      if (!holding || holding.quantity.toNumber() < dto.quantity) {
        throw new BadRequestException(
          'Insufficient holdings. ' +
          `Available: ${holding?.quantity.toString() ?? '0'}, ` +
          `Requested: ${dto.quantity}`,
        );
      }

      const totalAmount = asset.livePriceBid.toNumber() * dto.quantity;

      const transaction = await tx.transaction.create({
        data: {
          userId,
          assetId: dto.assetId,
          type: 'SELL',
          status: 'COMPLETED',
          quantity: dto.quantity,
          pricePerUnit: asset.livePriceBid,
          totalAmount,
          currency: dto.currency as 'USD' | 'EUR' | 'CHF' | 'SGD' | 'KYD' | 'GBP',
          fromVaultId: dto.vaultId,
        },
      });

      await tx.holding.update({
        where: {
          userId_assetId_vaultId: {
            userId,
            assetId: dto.assetId,
            vaultId: dto.vaultId,
          },
        },
        data: {
          quantity: { decrement: dto.quantity },
        },
      });

      return transaction;
    });
  }

  async executeTeleport(userId: string, dto: CreateTeleportDto) {
    return this.prisma.$transaction(async (tx: TxClient) => {
      const holding = await tx.holding.findUnique({
        where: {
          userId_assetId_vaultId: {
            userId,
            assetId: dto.assetId,
            vaultId: dto.fromVaultId,
          },
        },
      });

      if (!holding || holding.quantity.toNumber() < dto.quantity) {
        throw new BadRequestException(
          'Insufficient holdings in source vault. ' +
          `Available: ${holding?.quantity.toString() ?? '0'}, ` +
          `Requested: ${dto.quantity}`,
        );
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
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

      await tx.holding.update({
        where: {
          userId_assetId_vaultId: {
            userId,
            assetId: dto.assetId,
            vaultId: dto.fromVaultId,
          },
        },
        data: {
          quantity: { decrement: dto.quantity },
        },
      });

      await tx.holding.upsert({
        where: {
          userId_assetId_vaultId: {
            userId,
            assetId: dto.assetId,
            vaultId: dto.toVaultId,
          },
        },
        update: {
          quantity: { increment: dto.quantity },
        },
        create: {
          userId,
          assetId: dto.assetId,
          vaultId: dto.toVaultId,
          quantity: dto.quantity,
        },
      });

      return transaction;
    });
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
