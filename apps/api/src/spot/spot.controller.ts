import { Controller, Get, Sse, MessageEvent, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, interval, switchMap, map, startWith } from 'rxjs';
import { SpotService } from './spot.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/spot')
export class SpotController {
  constructor(private readonly spotService: SpotService) {}

  @Get()
  @Public()
  async getSpotPrices() {
    const spots = await this.spotService.getLatestSpots();
    const status = this.spotService.getStatus();
    return { spots, status };
  }

  @Get('status')
  @Public()
  getStatus() {
    return this.spotService.getStatus();
  }

  @Sse('stream')
  @Public()
  streamSpot(): Observable<MessageEvent> {
    // Emit spot prices every 10 seconds
    return interval(10_000).pipe(
      startWith(0),
      switchMap(async () => {
        const spots = await this.spotService.getLatestSpots();
        const status = this.spotService.getStatus();

        if (status.isStale) {
          return {
            data: JSON.stringify({
              type: 'system.status',
              payload: { status: 'PRICING_STALE', ...status },
            }),
          } as MessageEvent;
        }

        return {
          data: JSON.stringify({
            type: 'spot.update',
            payload: { spots, status },
          }),
        } as MessageEvent;
      }),
      map((event) => event),
    );
  }
}
