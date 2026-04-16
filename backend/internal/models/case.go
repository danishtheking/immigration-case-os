package models

import (
	"time"

	"github.com/google/uuid"
)

type CaseStage string

const (
	StageLead           CaseStage = "lead"
	StageConsultation   CaseStage = "consultation"
	StageEngaged        CaseStage = "engaged"
	StageIntake         CaseStage = "intake"
	StagePreparation    CaseStage = "preparation"
	StageAttorneyReview CaseStage = "attorney_review"
	StageFiled          CaseStage = "filed"
	StageInAdjudication CaseStage = "in_adjudication"
	StageRfeNoid        CaseStage = "rfe_noid"
	StageDecision       CaseStage = "decision"
	StagePostDecision   CaseStage = "post_decision"
	StageClosed         CaseStage = "closed"
)

// Candidate is the person the firm is helping with immigration.
type Candidate struct {
	ID                   uuid.UUID  `json:"id" db:"id"`
	TenantID             uuid.UUID  `json:"tenant_id" db:"tenant_id"`
	FirstName            string     `json:"first_name" db:"first_name"`
	LastName             string     `json:"last_name" db:"last_name"`
	Email                *string    `json:"email,omitempty" db:"email"`
	Phone                *string    `json:"phone,omitempty" db:"phone"`
	CountryOfCitizenship *string    `json:"country_of_citizenship,omitempty" db:"country_of_citizenship"`
	Source               string     `json:"source" db:"source"`
	VisaInterest         JSON       `json:"visa_interest" db:"visa_interest"`
	Status               string     `json:"status" db:"status"`
	OwnerUserID          *uuid.UUID `json:"owner_user_id,omitempty" db:"owner_user_id"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at" db:"updated_at"`
}

// Case is the unit of work — one petition/application for one candidate.
type Case struct {
	ID               uuid.UUID  `json:"id" db:"id"`
	TenantID         uuid.UUID  `json:"tenant_id" db:"tenant_id"`
	CaseNumber       string     `json:"case_number" db:"case_number"`
	CandidateID      uuid.UUID  `json:"candidate_id" db:"candidate_id"`
	CaseTypeCode     string     `json:"case_type_code" db:"case_type_code"`
	Stage            CaseStage  `json:"stage" db:"stage"`
	AttorneyUserID   *uuid.UUID `json:"attorney_user_id,omitempty" db:"attorney_user_id"`
	OverallScore     *int       `json:"overall_score,omitempty" db:"overall_score"`
	ScoreLabel       *string    `json:"score_label,omitempty" db:"score_label"`
	ReceiptNumber    *string    `json:"receipt_number,omitempty" db:"receipt_number"`
	Notes            *string    `json:"notes,omitempty" db:"notes"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields (populated by queries, not stored)
	Candidate        *Candidate `json:"candidate,omitempty" db:"-"`
	AttorneyName     *string    `json:"attorney_name,omitempty" db:"-"`
}

// Document represents an uploaded file attached to a case.
type Document struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	TenantID       uuid.UUID  `json:"tenant_id" db:"tenant_id"`
	CaseID         *uuid.UUID `json:"case_id,omitempty" db:"case_id"`
	Filename       string     `json:"filename" db:"filename"`
	MimeType       string     `json:"mime_type" db:"mime_type"`
	SizeBytes      int        `json:"size_bytes" db:"size_bytes"`
	StorageKey     string     `json:"storage_key" db:"storage_key"`
	Category       *string    `json:"category,omitempty" db:"category"`
	CriterionTags  JSON       `json:"criterion_tags" db:"criterion_tags"`
	AIConfidence   *string    `json:"ai_confidence,omitempty" db:"ai_confidence"`
	Status         string     `json:"status" db:"status"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
}
