import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProductReviews(productSkuId: string) {
    const reviews = await this.prisma.productReview.findMany({
      where: { productSkuId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        author: r.user.fullName || 'Anonymous',
        isVerified: r.isVerified,
        createdAt: r.createdAt.toISOString(),
      })),
      summary: {
        totalReviews: reviews.length,
        avgRating: Math.round(avgRating * 10) / 10,
        distribution: {
          5: reviews.filter((r) => r.rating === 5).length,
          4: reviews.filter((r) => r.rating === 4).length,
          3: reviews.filter((r) => r.rating === 3).length,
          2: reviews.filter((r) => r.rating === 2).length,
          1: reviews.filter((r) => r.rating === 1).length,
        },
      },
    };
  }

  async getReviewsBysku(sku: string) {
    const product = await this.prisma.productSku.findUnique({ where: { sku } });
    if (!product) throw new NotFoundException(`Product ${sku} not found`);
    return this.getProductReviews(product.id);
  }

  async createReview(userId: string, sku: string, rating: number, title?: string, body?: string) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const product = await this.prisma.productSku.findUnique({ where: { sku } });
    if (!product) throw new NotFoundException(`Product ${sku} not found`);

    // Check if user already reviewed
    const existing = await this.prisma.productReview.findUnique({
      where: { productSkuId_userId: { productSkuId: product.id, userId } },
    });
    if (existing) throw new BadRequestException('You have already reviewed this product');

    // Check if user has a delivered order for this product (verified purchase)
    const hasOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['DELIVERED', 'VAULT_ALLOCATED'] },
        quote: { productSkuId: product.id },
      },
    });

    const review = await this.prisma.productReview.create({
      data: {
        productSkuId: product.id,
        userId,
        rating,
        title,
        body,
        isVerified: !!hasOrder,
      },
      include: { user: { select: { fullName: true } } },
    });

    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      author: review.user.fullName || 'Anonymous',
      isVerified: review.isVerified,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
