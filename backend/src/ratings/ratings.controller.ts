import { Controller, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { RatingsService, CreateRatingDto, UpdateRatingDto } from './ratings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  createRating(
    @CurrentUser() currentUser: any,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.createRating(currentUser.userId, dto);
  }

  @Put(':id')
  updateRating(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.updateRating(currentUser.userId, id, dto);
  }
}
