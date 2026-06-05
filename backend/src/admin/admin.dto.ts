import {
  IsEmail,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { UserRole } from '../users/user.entity';

export class CreateUserDto {
  @IsString()
  @MinLength(20, { message: 'Name must be at least 20 characters' })
  @MaxLength(60, { message: 'Name cannot exceed 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(16, { message: 'Password cannot exceed 16 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(400, { message: 'Address cannot exceed 400 characters' })
  address?: string;

  @IsEnum(UserRole, { message: 'Role must be admin, user, or store_owner' })
  role: UserRole;
}

export class CreateStoreDto {
  @IsString()
  @MinLength(1, { message: 'Store name is required' })
  @MaxLength(60, { message: 'Store name cannot exceed 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @IsString()
  @MaxLength(400, { message: 'Address cannot exceed 400 characters' })
  address: string;

  @IsUUID('4', { message: 'Owner must be a valid user ID' })
  ownerId: string;
}

export class UserFilterDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}

export class StoreFilterDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}
