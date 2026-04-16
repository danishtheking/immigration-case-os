import { Module } from '@nestjs/common';
import { ClerkWebhookController } from './clerk.controller.js';
import { TenantsModule } from '../modules/tenants/tenants.module.js';
import { UsersModule } from '../modules/users/users.module.js';

@Module({
  imports: [TenantsModule, UsersModule],
  controllers: [ClerkWebhookController],
})
export class WebhooksModule {}
