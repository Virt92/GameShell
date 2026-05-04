import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Додати працівника' })
  create(@CurrentUser('clubId') clubId: string, @Body() data: any) {
    return this.staffService.create(clubId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Список персоналу' })
  findAll(@CurrentUser('clubId') clubId: string) {
    return this.staffService.findByClub(clubId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити працівника' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.staffService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Деактивувати працівника' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
