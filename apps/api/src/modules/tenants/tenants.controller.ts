import { Controller, Get } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { Ctx } from '../../common/context.decorator.js';
import type { RequestContext, ApiResponse } from '@ico/shared';
import type { Tenant } from '@ico/db';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get('me')
  async me(@Ctx() ctx: RequestContext): Promise<ApiResponse<Tenant>> {
    const tenant = await this.tenants.getCurrent(ctx);
    return { ok: true, data: tenant };
  }
}
