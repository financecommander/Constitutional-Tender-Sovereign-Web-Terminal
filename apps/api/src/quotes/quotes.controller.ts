import { Controller, Post, Get, Param, Body, UnauthorizedException } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { LockQuoteDto } from './dto/lock-quote.dto';
import { CurrentUser, UserFromToken } from '../auth/decorators/current-user.decorator';

@Controller('api/quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('lock')
  async lockQuote(@CurrentUser() user: UserFromToken, @Body() dto: LockQuoteDto) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.quotesService.lockQuote(
      user.dbUserId,
      dto.sku,
      dto.offerId,
      dto.quantity,
      dto.deliveryType,
    );
  }

  @Get(':quoteId')
  async getQuote(@CurrentUser() user: UserFromToken, @Param('quoteId') quoteId: string) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.quotesService.getQuote(quoteId, user.dbUserId);
  }
}
