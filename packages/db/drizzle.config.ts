import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL_ADMIN ??
      process.env.DATABASE_URL ??
      'postgres://app_admin:dev@localhost:5432/immcaseos',
  },
  strict: true,
  verbose: true,
} satisfies Config;
