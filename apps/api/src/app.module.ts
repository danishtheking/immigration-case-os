import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { HealthController } from './health.controller.js';
import { AuthGuard } from './common/auth.guard.js';
import { TenantInterceptor } from './common/tenant.interceptor.js';
import { ExceptionFilter } from './common/exception.filter.js';
import { TenantsModule } from './modules/tenants/tenants.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';

@Module({
  imports: [TenantsModule, UsersModule, WebhooksModule],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class AppModule {}
