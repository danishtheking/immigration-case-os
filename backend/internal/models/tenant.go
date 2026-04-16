package models

import (
	"time"

	"github.com/google/uuid"
)

// Tenant represents an immigration law firm on the platform.
// Every business table in the database has a tenant_id FK to this.
type Tenant struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	Slug            string     `json:"slug" db:"slug"`
	Name            string     `json:"name" db:"name"`
	CustomDomain    *string    `json:"custom_domain,omitempty" db:"custom_domain"`
	Branding        JSON       `json:"branding" db:"branding"`
	Plan            string     `json:"plan" db:"plan"`
	Region          string     `json:"region" db:"region"`
	BrendaEnabled   bool       `json:"brenda_enabled" db:"brenda_enabled"`
	CaseTypesEnabled JSON      `json:"case_types_enabled" db:"case_types_enabled"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
}

// User represents anyone who logs into the platform.
type User struct {
	ID                uuid.UUID  `json:"id" db:"id"`
	TenantID          uuid.UUID  `json:"tenant_id" db:"tenant_id"`
	Email             string     `json:"email" db:"email"`
	FirstName         *string    `json:"first_name,omitempty" db:"first_name"`
	LastName          *string    `json:"last_name,omitempty" db:"last_name"`
	Role              UserRole   `json:"role" db:"role"`
	Phone             *string    `json:"phone,omitempty" db:"phone"`
	PreferredLanguage string     `json:"preferred_language" db:"preferred_language"`
	LastLoginAt       *time.Time `json:"last_login_at,omitempty" db:"last_login_at"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
}

type UserRole string

const (
	RoleFirmAdmin   UserRole = "firm_admin"
	RoleAttorney    UserRole = "attorney"
	RoleCaseManager UserRole = "case_manager"
	RoleParalegal   UserRole = "paralegal"
	RoleCandidate   UserRole = "candidate"
)

// JSON is a raw JSON type for JSONB columns.
type JSON = map[string]interface{}
