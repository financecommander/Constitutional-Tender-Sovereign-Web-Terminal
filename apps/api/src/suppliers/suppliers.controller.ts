import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @Public()
  async listSuppliers() {
    return this.suppliersService.listSuppliers();
  }

  @Get(':supplierId')
  @Public()
  async getSupplier(@Param('supplierId') supplierId: string) {
    return this.suppliersService.getSupplier(supplierId);
  }

  @Patch(':supplierId/toggle')
  async toggleSupplier(
    @Param('supplierId') supplierId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.suppliersService.toggleSupplier(supplierId, body.isActive);
  }

  @Patch('offers/:offerId/inventory')
  async updateOfferInventory(
    @Param('offerId') offerId: string,
    @Body() body: { availableQty: number; premiumUsd?: number },
  ) {
    return this.suppliersService.updateOfferInventory(offerId, body.availableQty, body.premiumUsd);
  }

  @Post(':supplierId/sync')
  async syncInventory(@Param('supplierId') supplierId: string) {
    return this.suppliersService.syncSupplierInventory(supplierId);
  }
}
