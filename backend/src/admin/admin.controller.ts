import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserDto, CreateStoreDto, UserFilterDto, StoreFilterDto } from './admin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Get('users')
  listUsers(@Query() filters: UserFilterDto) {
    return this.adminService.listUsers(filters);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Get('stores')
  listStores(@Query() filters: StoreFilterDto) {
    return this.adminService.listStores(filters);
  }

  @Post('stores')
  createStore(@Body() dto: CreateStoreDto) {
    return this.adminService.createStore(dto);
  }

  // Utility endpoint — populates owner dropdown on Add Store form
  @Get('store-owners')
  listStoreOwners() {
    return this.adminService.listStoreOwners();
  }
}
