import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderItemDto {
  @IsString()
  itemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  variantName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonNames?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderPaymentDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsIn(Object.values(PaymentMethod))
  method!: PaymentMethod;
}

export class CreateOrderDto {
  @IsIn(['DINE_IN', 'TAKEAWAY', 'DELIVERY'])
  type!: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

  @IsOptional()
  @IsString()
  tableId?: string;

  @IsString()
  branchId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPaymentDto)
  payments?: CreateOrderPaymentDto[];

  @IsOptional()
  @IsString()
  deliveryRiderName?: string;

  @IsOptional()
  @IsString()
  deliveryPhone?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}

export class AddOrderItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class CheckoutOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPaymentDto)
  payments!: CreateOrderPaymentDto[];

  /** Pay only for items marked done on kitchen; order stays open for the rest */
  @IsOptional()
  @IsBoolean()
  readyItemsOnly?: boolean;
}


export class UpdateOrderStatusDto {
  @IsIn(['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'])
  status!: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
}

export class OrderHistoryQueryDto {
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsIn(['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'])
  status?: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';

  @IsOptional()
  @IsIn(['DINE_IN', 'TAKEAWAY', 'DELIVERY'])
  type?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

  @IsOptional()
  @IsString()
  search?: string;

  /** ISO date (YYYY-MM-DD) start of range */
  @IsOptional()
  @IsString()
  from?: string;

  /** ISO date (YYYY-MM-DD) end of range */
  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : 200))
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : 0))
  @IsInt()
  @Min(0)
  skip?: number;
}
