import { Controller, Get, Query } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('public/menu')
export class PublicMenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  getPublicMenu(@Query('tenant') tenant?: string) {
    return this.menuService.getPublicMenu(tenant);
  }
}

