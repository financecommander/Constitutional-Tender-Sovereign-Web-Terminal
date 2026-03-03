import { Controller, Post, Get, Param, Body, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser, UserFromToken } from '../auth/decorators/current-user.decorator';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@CurrentUser() user: UserFromToken, @Body() dto: CreateOrderDto) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.ordersService.createOrder(
      user.dbUserId,
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
  async listOrders(@CurrentUser() user: UserFromToken) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.ordersService.listOrders(user.dbUserId);
  }

  @Get(':orderId')
  async getOrder(@CurrentUser() user: UserFromToken, @Param('orderId') orderId: string) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.ordersService.getOrder(orderId, user.dbUserId);
  }
}
