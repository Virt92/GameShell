import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TariffsService } from './tariffs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tariffs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tariffs')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner')
  @ApiOperation({ summary: 'Створити тариф' })
  create(@CurrentUser('clubId') clubId: string, @Body() data: any) {
    return this.tariffsService.create(clubId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Список тарифів' })
  findAll(@CurrentUser('clubId') clubId: string) {
    return this.tariffsService.findByClub(clubId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('owner')
  @ApiOperation({ summary: 'Оновити тариф' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.tariffsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('owner')
  @ApiOperation({ summary: 'Деактивувати тариф' })
  remove(@Param('id') id: string) {
    return this.tariffsService.remove(id);
  }
}
