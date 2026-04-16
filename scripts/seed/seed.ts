/**
 * Seed script. Creates the SwagatUSA tenant + a default attorney user
 * for local development. Idempotent — safe to re-run.
 *
 * Run with `pnpm db:seed`.
 */

import postgres from 'postgres';

const ADMIN_URL =
  process.env.DATABASE_URL_ADMIN ??
  process.env.DATABASE_URL ??
  'postgres://app_admin:dev@localhost:5432/immcaseos';

async function main(): Promise<void> {
  const sql = postgres(ADMIN_URL, { max: 1, prepare: false });

  console.log('[seed] upserting SwagatUSA tenant');
  const tenants = await sql<{ id: string }[]>`
    INSERT INTO tenants (slug, name, clerk_org_id, branding)
    VALUES (
      'swagatusa',
      'SwagatUSA Immigration',
      'org_seed_swagatusa',
      ${{
        primary_color: '#1d4ed8',
        agent_persona: 'Neha',
      }}::jsonb
    )
    ON CONFLICT (clerk_org_id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      updated_at = now()
    RETURNING id
  `;
  const tenantId = tenants[0]!.id;
  console.log(`[seed]   tenant id: ${tenantId}`);

  console.log('[seed] upserting demo attorney user');
  await sql`
    INSERT INTO users (tenant_id, clerk_user_id, email, first_name, last_name, role)
    VALUES (
      ${tenantId},
      'user_seed_atal',
      'atal@swagatusa.io',
      'Atal',
      'Bihari',
      'firm_admin'
    )
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      email = EXCLUDED.email,
      updated_at = now()
  `;

  console.log('[seed] done');
  await sql.end();
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
