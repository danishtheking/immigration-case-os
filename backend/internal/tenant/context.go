package tenant

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

// contextKey is unexported to prevent collisions.
type contextKey string

const (
	tenantIDKey contextKey = "tenant_id"
	userIDKey   contextKey = "user_id"
	userRoleKey contextKey = "user_role"
	requestIDKey contextKey = "request_id"
)

// RequestContext holds the per-request tenant and user info.
// Every handler receives this from the middleware.
type RequestContext struct {
	TenantID  uuid.UUID
	UserID    uuid.UUID
	UserRole  string
	RequestID string
}

// FromContext extracts the RequestContext from the request context.
// Returns nil if the middleware hasn't run (which should never happen
// for authenticated routes).
func FromContext(ctx context.Context) *RequestContext {
	tid, _ := ctx.Value(tenantIDKey).(uuid.UUID)
	uid, _ := ctx.Value(userIDKey).(uuid.UUID)
	role, _ := ctx.Value(userRoleKey).(string)
	rid, _ := ctx.Value(requestIDKey).(string)

	if tid == uuid.Nil {
		return nil
	}

	return &RequestContext{
		TenantID:  tid,
		UserID:    uid,
		UserRole:  role,
		RequestID: rid,
	}
}

// WithTenant injects tenant context into the request context.
// Called by the auth middleware after JWT verification.
func WithTenant(r *http.Request, tenantID, userID uuid.UUID, role, requestID string) *http.Request {
	ctx := r.Context()
	ctx = context.WithValue(ctx, tenantIDKey, tenantID)
	ctx = context.WithValue(ctx, userIDKey, userID)
	ctx = context.WithValue(ctx, userRoleKey, role)
	ctx = context.WithValue(ctx, requestIDKey, requestID)
	return r.WithContext(ctx)
}
