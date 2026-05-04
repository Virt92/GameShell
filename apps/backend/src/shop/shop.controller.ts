import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Shop')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('products')
  @ApiOperation({ summary: 'Список товарів' })
  getProducts(@CurrentUser('clubId') clubId: string) {
    return this.shopService.getProducts(clubId);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Створити замовлення' })
  createOrder(@CurrentUser('clubId') clubId: string, @Body() data: any) {
    return this.shopService.createOrder({ ...data, clubId });
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: 'Оновити статус замовлення' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.shopService.updateOrderStatus(id, status);
  }
}
