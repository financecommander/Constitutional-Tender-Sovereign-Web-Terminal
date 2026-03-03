import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':sku')
  @Public()
  async getReviews(@Param('sku') sku: string) {
    return this.reviewsService.getReviewsBysku(sku);
  }

  @Post(':sku')
  async createReview(
    @Req() req: any,
    @Param('sku') sku: string,
    @Body() body: { rating: number; title?: string; body?: string },
  ) {
    const userId = req.user.dbUser.id;
    return this.reviewsService.createReview(userId, sku, body.rating, body.title, body.body);
  }
}
