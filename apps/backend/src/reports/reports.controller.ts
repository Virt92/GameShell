import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Статистика дашборду' })
  getDashboard(@CurrentUser('clubId') clubId: string) {
    return this.reportsService.getDashboardStats(clubId);
  }

  @Get('revenue')
  @UseGuards(RolesGuard)
  @Roles('owner', 'accountant')
  @ApiOperation({ summary: 'Звіт по виручці' })
  getRevenue(
    @CurrentUser('clubId') clubId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('groupBy') groupBy: 'day' | 'hour' = 'day',
  ) {
    return this.reportsService.getRevenueReport(clubId, from, to, groupBy);
  }

  @Get('occupancy')
  @UseGuards(RolesGuard)
  @Roles('owner', 'accountant', 'devops')
  @ApiOperation({ summary: 'Звіт по завантаженості' })
  getOccupancy(
    @CurrentUser('clubId') clubId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getOccupancyReport(clubId, from, to);
  }
}
