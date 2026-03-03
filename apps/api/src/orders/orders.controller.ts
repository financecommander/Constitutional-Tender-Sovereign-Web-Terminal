import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user.dbUser.id;
    return this.ordersService.createOrder(
      userId,
      dto.quoteId,
      dto.paymentRail,
      {
        shipName: dto.shipName,
        shipAddress: dto.shipAddress,
        shipCity: dto.shipCity,
        shipState: dto.shipState,
        shipZip: dto.shipZip,
        shipCountry: dto.shipCountry,
      },
    );
  }

  @Get()
  async listOrders(@Req() req: any) {
    const userId = req.user.dbUser.id;
    return this.ordersService.listOrders(userId);
  }

  @Get(':orderId')
  async getOrder(@Req() req: any, @Param('orderId') orderId: string) {
    const userId = req.user.dbUser.id;
    return this.ordersService.getOrder(orderId, userId);
  }
}
