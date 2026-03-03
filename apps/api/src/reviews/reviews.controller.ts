import { Controller, Get, Post, Param, Body, UnauthorizedException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, UserFromToken } from '../auth/decorators/current-user.decorator';

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
    @CurrentUser() user: UserFromToken,
    @Param('sku') sku: string,
    @Body() body: { rating: number; title?: string; body?: string },
  ) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.reviewsService.createReview(user.dbUserId, sku, body.rating, body.title, body.body);
  }
}
