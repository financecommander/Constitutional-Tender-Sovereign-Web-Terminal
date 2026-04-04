import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { SpotService } from './spot.service';
import { Metal } from '@prisma/client';

/**
 * Live Spot Price Feed Service
 *
 * Fetches real-time metal prices from an external API.
 * Currently uses simulated prices with realistic market movements.
 *
 * To connect a real API:
 * 1. Set METALS_API_KEY in .env
 * 2. Set METALS_API_URL in .env (default: https://metals-api.com/api)
 * 3. Uncomment the fetchFromApi() method and wire it into tick()
 *
 * Supported providers (swap in via METALS_API_PROVIDER):
 * - metals-api (metals-api.com)
 * - goldapi (goldapi.io)
 * - metalpriceapi (metalpriceapi.com)
 */
@Injectable()
export class SpotFeedService implements OnModuleInit {
  private readonly logger = new Logger(SpotFeedService.name);

  private readonly apiKey = process.env.METALS_API_KEY || '';
  private readonly apiUrl = process.env.METALS_API_URL || 'https://metals-api.com/api';
  private readonly provider = process.env.METALS_API_PROVIDER || 'simulated';

  // Base prices for simulation (close to real market values)
  private simulatedPrices: Record<string, { price: number; prevClose: number }> = {
    XAU: { price: 2920.50, prevClose: 2908.75 },
    XAG: { price: 32.45, prevClose: 32.18 },
    XPT: { price: 982.30, prevClose: 978.50 },
    XPD: { price: 958.75, prevClose: 962.40 },
  };

  constructor(private readonly spotService: SpotService) {}

  async onModuleInit() {
    this.logger.log(`Spot feed provider: ${this.provider}`);
    if (this.provider !== 'simulated' && !this.apiKey) {
      this.logger.warn('METALS_API_KEY not set — falling back to simulated prices');
    }
    // Initial tick on startup
    await this.tick();
  }

  /**
   * Runs every 30 seconds to update spot prices
   */
  @Interval(30_000)
  async tick() {
    try {
      if (this.provider !== 'simulated' && this.apiKey) {
        await this.fetchFromApi();
      } else {
        await this.simulatePrices();
      }
    } catch (error) {
      this.logger.error('Failed to update spot prices', error);
    }
  }

  /**
   * Fetch from real metals API
   */
  private consecutiveFailures = 0;
  private readonly MAX_FAILURES = 3;

  private async fetchFromApi() {
    try {
      let prices: Record<string, number> = {};

      if (this.provider === 'goldapi') {
        // GoldAPI.io uses per-metal requests with header auth
        const metals = ['XAU', 'XAG', 'XPT', 'XPD'];
        for (const metal of metals) {
          const response = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
            headers: { 'x-access-token': this.apiKey },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.price) prices[metal] = data.price;
          }
        }
      } else {
        // metals-api.com / metalpriceapi.com format
        const url = `${this.apiUrl}/latest?access_key=${this.apiKey}&base=USD&symbols=XAU,XAG,XPT,XPD`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const data = await response.json();
        if (data.success === false) {
          this.logger.warn(`Metals API error: ${data.error?.info || 'Unknown error'}`);
          throw new Error(data.error?.info || 'API error');
        }
        // Rates are 1/price (oz per USD) — invert to USD per oz
        for (const metal of ['XAU', 'XAG', 'XPT', 'XPD']) {
          const rate = data.rates?.[metal];
          if (rate && rate > 0) prices[metal] = 1 / rate;
        }
      }

      if (Object.keys(prices).length === 0) {
        throw new Error('No prices returned from API');
      }

      for (const [metal, spotUsdPerOz] of Object.entries(prices)) {
        const prev = this.simulatedPrices[metal]?.prevClose || spotUsdPerOz;
        const changePct = ((spotUsdPerOz - prev) / prev) * 100;
        await this.spotService.updateSpot(metal as Metal, spotUsdPerOz, changePct, this.provider);
        this.simulatedPrices[metal] = { price: spotUsdPerOz, prevClose: prev };
      }

      this.consecutiveFailures = 0;
      this.logger.debug('Updated spot prices from API');
    } catch (error) {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= this.MAX_FAILURES) {
        this.logger.warn(`API failed ${this.consecutiveFailures} times consecutively, using simulated prices`);
      } else {
        this.logger.warn(`API fetch failed (${this.consecutiveFailures}/${this.MAX_FAILURES}): ${error}`);
      }
      await this.simulatePrices();
    }
  }

  /**
   * Simulated price movements for demo/development
   * Uses Brownian motion with mean reversion
   */
  private async simulatePrices() {
    const metals: Metal[] = ['XAU', 'XAG', 'XPT', 'XPD'];

    for (const metal of metals) {
      const sim = this.simulatedPrices[metal];
      if (!sim) continue;

      // Brownian motion with mean reversion
      // Volatility by metal: Gold < Platinum < Palladium < Silver
      const volatilityMap: Record<string, number> = { XAU: 0.0003, XAG: 0.0008, XPT: 0.0005, XPD: 0.0006 };
      const volatility = volatilityMap[metal] || 0.0005;
      const meanReversion = 0.001;
      const drift = (sim.prevClose - sim.price) * meanReversion;
      const randomShock = (Math.random() - 0.5) * 2 * volatility * sim.price;

      sim.price = Math.max(sim.price + drift + randomShock, sim.price * 0.95);
      sim.price = Math.round(sim.price * 100) / 100;

      const changePct = ((sim.price - sim.prevClose) / sim.prevClose) * 100;
      const changePctRounded = Math.round(changePct * 100) / 100;

      await this.spotService.updateSpot(metal, sim.price, changePctRounded, 'simulated');
    }

    this.logger.debug(
      `Simulated: XAU=$${this.simulatedPrices.XAU.price} XAG=$${this.simulatedPrices.XAG.price} XPT=$${this.simulatedPrices.XPT.price} XPD=$${this.simulatedPrices.XPD.price}`,
    );
  }
}
