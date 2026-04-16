package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool is the shared database connection pool.
// All services use this to talk to Supabase Postgres.
var Pool *pgxpool.Pool

// Connect initializes the database connection pool.
func Connect(ctx context.Context) error {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		url = "postgres://postgres:postgres@localhost:5433/immigration_case_os"
	}

	config, err := pgxpool.ParseConfig(url)
	if err != nil {
		return fmt.Errorf("parse db config: %w", err)
	}

	config.MaxConns = 20
	config.MinConns = 2

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return fmt.Errorf("create pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping db: %w", err)
	}

	Pool = pool
	return nil
}

// Close shuts down the connection pool gracefully.
func Close() {
	if Pool != nil {
		Pool.Close()
	}
}

// SetTenantContext sets the RLS context variables for a transaction.
// Every query within this transaction will be scoped to the tenant.
// This is the Go equivalent of the NestJS TenantInterceptor.
func SetTenantContext(ctx context.Context, tenantID, userID, requestID string) error {
	conn, err := Pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("acquire conn: %w", err)
	}
	defer conn.Release()

	_, err = conn.Exec(ctx, `
		SELECT set_config('app.current_tenant', $1, true);
		SELECT set_config('app.current_actor', $2, true);
		SELECT set_config('app.current_request_id', $3, true);
	`, tenantID, userID, requestID)

	return err
}
