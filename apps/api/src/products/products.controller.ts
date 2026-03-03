import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ReviewsService } from '../reviews/reviews.service';
import { Public } from '../auth/decorators/public.decorator';
import { Metal, ProductCategory } from '@prisma/client';

@Controller('api/products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  @Public()
  async listProducts(
    @Query('metal') metal?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minWeight') minWeight?: string,
    @Query('maxWeight') maxWeight?: string,
    @Query('sort') sort?: string, // price_asc, price_desc, name, weight
  ) {
    const metalEnum = metal?.toUpperCase() as Metal | undefined;
    const categoryEnum = category?.toUpperCase() as ProductCategory | undefined;
    return this.productsService.listProducts(metalEnum, categoryEnum, {
      search,
      minWeight: minWeight ? parseFloat(minWeight) : undefined,
      maxWeight: maxWeight ? parseFloat(maxWeight) : undefined,
      sort,
    });
  }

  @Get(':sku')
  @Public()
  async getProduct(@Param('sku') sku: string) {
    const result = await this.productsService.getProductBySku(sku);
    if (!result) {
      throw new NotFoundException(`Product ${sku} not found`);
    }

    // Include review summary
    const reviews = await this.reviewsService.getReviewsBysku(sku);

    return {
      ...result,
      reviews: reviews.summary,
    };
  }

  @Get(':sku/best-offer')
  @Public()
  async getBestOffer(@Param('sku') sku: string) {
    const product = await this.productsService.getProductBySku(sku);
    if (!product) {
      throw new NotFoundException(`Product ${sku} not found`);
    }
    const best = product.offers[0] || null;
    return { offer: best, spotPerOz: product.spotPerOz };
  }
}
