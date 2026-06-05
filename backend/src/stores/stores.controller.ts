import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  listStores(
    @CurrentUser() currentUser: any,
    @Query('search') search?: string,
  ) {
    return this.storesService.listStores(currentUser.userId, search);
  }
}
