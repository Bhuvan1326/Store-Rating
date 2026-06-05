import { Controller, Get, UseGuards } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('store_owner')
export class OwnerController {
  constructor(private ownerService: OwnerService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() currentUser: any) {
    return this.ownerService.getDashboard(currentUser.userId);
  }
}
