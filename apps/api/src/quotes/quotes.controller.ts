import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { LockQuoteDto } from './dto/lock-quote.dto';

@Controller('api/quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('lock')
  async lockQuote(@Req() req: any, @Body() dto: LockQuoteDto) {
    const userId = req.user.dbUser.id;
    return this.quotesService.lockQuote(
      userId,
      dto.sku,
      dto.offerId,
      dto.quantity,
      dto.deliveryType,
    );
  }

  @Get(':quoteId')
  async getQuote(@Req() req: any, @Param('quoteId') quoteId: string) {
    const userId = req.user.dbUser.id;
    return this.quotesService.getQuote(quoteId, userId);
  }
}
