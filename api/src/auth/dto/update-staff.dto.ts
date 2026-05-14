import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  /** Set to Mongo id to assign role; omit to leave unchanged; send '' to remove role assignment. */
  @IsOptional()
  @IsString()
  roleId?: string;

  /** Omit to leave unchanged; send '' or null-equivalent trimmed empty to remove PIN. */
  @IsOptional()
  @IsString()
  pin?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
