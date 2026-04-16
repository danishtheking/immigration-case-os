'use client';

import { useState, type ReactElement } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Rocket,
  Palette,
  Heart,
  ShieldAlert,
  HelpCircle,
  Link2,
} from 'lucide-react';

const PROFILE_TYPES = [
  { id: 'researcher', label: 'Researcher / Academic', icon: GraduationCap },
  { id: 'engineer', label: 'Engineer / Tech', icon: Briefcase },
  { id: 'founder', label: 'Founder / Executive', icon: Rocket },
  { id: 'artist', label: 'Artist / Athlete', icon: Palette },
  { id: 'family', label: 'Family of USC / LPR', icon: Heart },
  { id: 'asylum', label: 'Asylum Seeker', icon: ShieldAlert },
  { id: 'other', label: 'Other', icon: HelpCircle },
] as const;

export default function IntakePage(): ReactElement {
  const [step, setStep] = useState(0);
  const [profileType, setProfileType] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    currentStatus: '',
    linkedinUrl: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 3;

  function handleNext(): void {
    if (step < totalSteps - 1) setStep(step + 1);
  }
  function handleBack(): void {
    if (step > 0) setStep(step - 1);
  }
  function handleSubmit(): void {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg py-24 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">We received your information</h2>
          <p className="mt-3 text-zinc-500">
            Our team will review your profile and reach out within 24 hours with an initial assessment
            of your strongest visa path.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            View demo dashboard
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-2xl py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-[12px] text-zinc-400">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(((step + 1) / totalSteps) * 100)}% complete</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {step === 0 && (
            <StepOne profileType={profileType} onSelect={setProfileType} />
          )}
          {step === 1 && (
            <StepTwo form={form} onChange={setForm} />
          )}
          {step === 2 && (
            <StepThree
              form={form}
              onChange={setForm}
              file={file}
              onFileChange={setFile}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:invisible"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              disabled={step === 0 && !profileType}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-40"
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Submit application <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

/* ── Shell ─────────────────────────────────────────────────────────── */

function Shell({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30">
      <header className="border-b border-zinc-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-black text-white">
              SB
            </div>
            <span className="text-sm font-semibold text-zinc-900">StitchBoat Immigration</span>
          </div>
          <select className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] text-zinc-600">
            <option>English</option>
            <option>Espanol</option>
            <option>Hindi</option>
            <option>Mandarin</option>
            <option>Arabic</option>
            <option>Portuguese</option>
          </select>
        </div>
      </header>
      {children}
      <footer className="py-6 text-center text-[11px] text-zinc-400">
        Your information stays with StitchBoat Immigration. We do not share it.
      </footer>
    </div>
  );
}

/* ── Step 1: Profile type ──────────────────────────────────────────── */

function StepOne({
  profileType,
  onSelect,
}: {
  profileType: string;
  onSelect: (v: string) => void;
}): ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900">
        Let&apos;s see if we can help
      </h2>
      <p className="mt-2 text-[14px] text-zinc-500">
        Select what best describes you today. This helps us find the strongest visa path for your profile.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {PROFILE_TYPES.map((type) => {
          const Icon = type.icon;
          const active = profileType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left text-[13px] font-medium transition-all ${
                active
                  ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                  : 'border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-zinc-400'}`} />
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 2: Contact info ──────────────────────────────────────────── */

interface FormData {
  firstName: string; lastName: string; email: string; phone: string;
  country: string; currentStatus: string; linkedinUrl: string;
  [key: string]: string;
}

function StepTwo({
  form,
  onChange,
}: {
  form: FormData;
  onChange: (v: FormData) => void;
}): ReactElement {
  const set = (key: string, val: string) => onChange({ ...form, [key]: val });

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900">Your details</h2>
      <p className="mt-2 text-[14px] text-zinc-500">
        We need basic contact info to reach you with your assessment.
      </p>
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" value={form.firstName} onChange={(v) => set('firstName', v)} required />
          <Field label="Last name" value={form.lastName} onChange={(v) => set('lastName', v)} required />
        </div>
        <Field label="Email" value={form.email} onChange={(v) => set('email', v)} type="email" required />
        <Field label="Phone (optional)" value={form.phone} onChange={(v) => set('phone', v)} type="tel" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Country of citizenship" value={form.country} onChange={(v) => set('country', v)} placeholder="e.g. India" />
          <Field label="Current U.S. status (if any)" value={form.currentStatus} onChange={(v) => set('currentStatus', v)} placeholder="e.g. H-1B valid to 2027" />
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Documents ─────────────────────────────────────────────── */

function StepThree({
  form,
  onChange,
  file,
  onFileChange,
}: {
  form: FormData;
  onChange: (v: FormData) => void;
  file: File | null;
  onFileChange: (f: File | null) => void;
}): ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900">Upload your CV</h2>
      <p className="mt-2 text-[14px] text-zinc-500">
        Optional but recommended — it speeds up the assessment significantly.
      </p>

      <div className="mt-6">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 transition-colors hover:border-blue-400 hover:bg-blue-50/30">
          <Upload className="h-8 w-8 text-zinc-400" />
          <p className="mt-3 text-[13px] font-medium text-zinc-600">
            {file ? file.name : 'Drop PDF or DOCX here, or click to browse'}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">Max 10 MB</p>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-[12px] text-zinc-400">
          <div className="h-px flex-1 bg-zinc-200" />
          <span>or paste your LinkedIn</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>
        <div className="relative mt-3">
          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={form.linkedinUrl}
            onChange={(e) => onChange({ ...form, linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Shared Field ──────────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}): ReactElement {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-zinc-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
      />
    </div>
  );
}
