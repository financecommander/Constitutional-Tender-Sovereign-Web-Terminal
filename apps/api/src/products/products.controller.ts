import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Public } from '../auth/decorators/public.decorator';
import { Metal, ProductCategory } from '@prisma/client';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  async listProducts(
    @Query('metal') metal?: string,
    @Query('category') category?: string,
  ) {
    const metalEnum = metal?.toUpperCase() as Metal | undefined;
    const categoryEnum = category?.toUpperCase() as ProductCategory | undefined;
    return this.productsService.listProducts(metalEnum, categoryEnum);
  }

  @Get(':sku')
  @Public()
  async getProduct(@Param('sku') sku: string) {
    const result = await this.productsService.getProductBySku(sku);
    if (!result) {
      throw new NotFoundException(`Product ${sku} not found`);
    }
    return result;
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
