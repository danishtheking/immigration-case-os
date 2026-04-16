package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/danishtheking/immigration-case-os/backend/internal/db"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Connect to Postgres
	if err := db.Connect(ctx); err != nil {
		log.Fatalf("[gateway] failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("[gateway] connected to database")

	// Router
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://*.vercel.app"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID", "X-Tenant-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check — no auth required
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"ok":true,"service":"gateway","version":"0.0.1"}`))
	})

	// API routes — auth required
	r.Route("/api", func(r chi.Router) {
		// TODO: add auth middleware here once Supabase JWT verification is wired
		// r.Use(authMiddleware)

		// Tenant routes
		r.Get("/tenants/me", handleGetTenant)

		// Cases routes
		r.Get("/cases", handleListCases)
		r.Post("/cases", handleCreateCase)
		r.Get("/cases/{id}", handleGetCase)
		r.Patch("/cases/{id}", handleUpdateCase)

		// Candidates routes
		r.Get("/candidates", handleListCandidates)
		r.Post("/candidates", handleCreateCandidate)

		// Documents routes
		r.Get("/cases/{caseID}/documents", handleListDocuments)
		r.Post("/cases/{caseID}/documents", handleUploadDocument)
	})

	// Server
	port := os.Getenv("GATEWAY_PORT")
	if port == "" {
		port = "8080"
	}
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Graceful shutdown
	go func() {
		log.Printf("[gateway] listening on http://localhost:%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[gateway] server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("[gateway] shutting down...")

	shutdownCtx, shutdownCancel := context.WithTimeout(ctx, 10*time.Second)
	defer shutdownCancel()
	srv.Shutdown(shutdownCtx)
	log.Println("[gateway] stopped")
}

// ── Placeholder handlers ───────────────────────────────────────
// These will be moved to the Case Service once we split services.
// For Phase 1, everything runs in the gateway.

func handleGetTenant(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"ok":true,"data":{"id":"demo","name":"StitchBoat Immigration","slug":"stitchboat"}}`))
}

func handleListCases(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// TODO: query from database with RLS context
	w.Write([]byte(`{"ok":true,"data":[],"meta":{"total":0}}`))
}

func handleCreateCase(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"ok":true,"data":{"id":"new-case"}}`))
}

func handleGetCase(w http.ResponseWriter, r *http.Request) {
	// id := chi.URLParam(r, "id")
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"ok":true,"data":{}}`))
}

func handleUpdateCase(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"ok":true}`))
}

func handleListCandidates(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"ok":true,"data":[]}`))
}

func handleCreateCandidate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"ok":true,"data":{"id":"new-candidate"}}`))
}

func handleListDocuments(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"ok":true,"data":[]}`))
}

func handleUploadDocument(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"ok":true,"data":{"id":"new-doc","upload_url":"https://s3.amazonaws.com/..."}}`))
}
