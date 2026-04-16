import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { Ctx } from '../../common/context.decorator.js';
import type { RequestContext, ApiResponse } from '@ico/shared';
import type { User } from '@ico/db';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@Ctx() ctx: RequestContext): Promise<ApiResponse<User>> {
    const user = await this.users.getMe(ctx);
    return { ok: true, data: user };
  }

  @Get()
  async list(@Ctx() ctx: RequestContext): Promise<ApiResponse<User[]>> {
    const list = await this.users.listForTenant(ctx);
    return { ok: true, data: list, meta: { total: list.length } };
  }

  @Get(':id')
  async getById(
    @Ctx() ctx: RequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<User>> {
    const user = await this.users.getById(ctx, id);
    return { ok: true, data: user };
  }
}
