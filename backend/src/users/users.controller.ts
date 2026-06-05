import { Controller, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService, ChangePasswordDto } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Available to both user and store_owner roles
  @Put('me/password')
  @Roles('user', 'store_owner')
  changePassword(
    @CurrentUser() currentUser: any,
    @Body() body: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      currentUser.userId,
      body.currentPassword,
      body.newPassword,
    );
  }
}
