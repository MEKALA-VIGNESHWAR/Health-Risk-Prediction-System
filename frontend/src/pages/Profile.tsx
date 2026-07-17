import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  Pencil,
  Check,
  X,
  User as UserIcon,
  HeartPulse,
  ShieldAlert,
  Activity,
  Phone,
  Mail,
  Droplets,
  Moon,
  Cigarette,
  Wine,
  Dumbbell,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar, Badge, Button, Card, Textarea, useToast, SkeletonCard } from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'
import { ApiError } from '@/lib/api'
import { getProfile, updateProfile, type Profile as ProfileT, type ProfileUpdate } from '@/features/profile/profileApi'
import { fileToResizedDataUrl } from '@/features/profile/image'
import { cn } from '@/lib/cn'

const field =
  'h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15'

const SMOKING = ['never', 'former', 'current']
const ALCOHOL = ['none', 'occasional', 'regular']
const EXERCISE = ['sedentary', 'light', 'moderate', 'active']

function toUpdate(p: ProfileT): ProfileUpdate {
  return {
    firstName: p.firstName ?? '',
    lastName: p.lastName ?? '',
    avatarUrl: p.avatarUrl ?? null,
    phone: p.phone ?? '',
    gender: p.gender ?? '',
    dateOfBirth: p.dateOfBirth ?? null,
    age: p.age ?? null,
    heightCm: p.heightCm ?? null,
    weightKg: p.weightKg ?? null,
    bmi: p.bmi ?? null,
    bloodGroup: p.bloodGroup ?? '',
    medicalHistory: p.medicalHistory ?? '',
    currentMedications: p.currentMedications ?? '',
    allergies: p.allergies ?? '',
    emergencyContactName: p.emergencyContactName ?? '',
    emergencyContactPhone: p.emergencyContactPhone ?? '',
    emergencyContactRelation: p.emergencyContactRelation ?? '',
    smokingStatus: p.smokingStatus ?? '',
    alcoholUse: p.alcoholUse ?? '',
    exerciseLevel: p.exerciseLevel ?? '',
    sleepHours: p.sleepHours ?? null,
    waterIntakeLiters: p.waterIntakeLiters ?? null,
  }
}

function bmiInfo(h?: number | null, w?: number | null, manualBmi?: number | null) {
  const bmi = manualBmi ?? (h && w && h > 0 ? Math.round((w / ((h / 100) * (h / 100))) * 10) / 10 : null)
  if (!bmi) return null
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese'
  const tone = bmi < 18.5 ? 'info' : bmi < 25 ? 'success' : bmi < 30 ? 'warning' : 'danger'
  const pct = Math.max(0, Math.min(100, ((bmi - 12) / (40 - 12)) * 100))
  return { bmi, cat, tone, pct } as const
}

function ageFrom(dob?: string | null) {
  if (!dob) return null
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return null
  const diff = Date.now() - d.getTime()
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000))
}

export function Profile() {
  const toast = useToast()
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState<ProfileT | null>(null)
  const [form, setForm] = useState<ProfileUpdate | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p)
        setForm(toUpdate(p))
      })
      .catch((e) => toast.error(e instanceof ApiError ? e.message : 'Could not load your profile.'))
      .finally(() => setLoading(false))
  }, [toast])

  const set = <K extends keyof ProfileUpdate>(key: K, value: ProfileUpdate[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f))

  const num = (v: string): number | null => (v === '' ? null : Number(v))

  const bmi = useMemo(
    () => bmiInfo(form?.heightCm ?? profile?.heightCm, form?.weightKg ?? profile?.weightKg, form?.bmi ?? profile?.bmi),
    [form?.heightCm, form?.weightKg, form?.bmi, profile],
  )

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      set('avatarUrl', dataUrl)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not process the image.')
    }
  }

  async function save() {
    if (!form) return
    setSaving(true)
    try {
      const updated = await updateProfile(form)
      setProfile(updated)
      setForm(toUpdate(updated))
      updateUser({
        firstName: updated.firstName ?? undefined,
        lastName: updated.lastName ?? undefined,
        avatarUrl: updated.avatarUrl ?? null,
      })
      setEditing(false)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    if (profile) setForm(toUpdate(profile))
    setEditing(false)
  }

  if (loading || !profile || !form) {
    return (
      <div>
        <PageHeader title="My Profile" subtitle="Your personal health information" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SkeletonCard className="lg:col-span-3" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ') || profile.username
  const age = form.age ?? ageFrom(form.dateOfBirth) ?? profile.age

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Keep this up to date for more personalized AI insights."
        action={
          editing ? (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={cancel} disabled={saving} leftIcon={<X className="h-4 w-4" />}>
                Cancel
              </Button>
              <Button onClick={save} loading={saving} leftIcon={<Check className="h-4 w-4" />}>
                Save changes
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(true)} leftIcon={<Pencil className="h-4 w-4" />}>
              Edit profile
            </Button>
          )
        }
      />

      {/* Hero */}
      <Card padding="none" className="mb-5 overflow-hidden">
        <div className="h-24 bg-brand-gradient sm:h-28">
          <div className="h-full w-full bg-grid opacity-15" />
        </div>
        <div className="px-5 pb-5 sm:px-7 sm:pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar name={fullName} src={form.avatarUrl} size="xl" className="!h-24 !w-24 ring-4 ring-card" />
                {editing && (
                  <>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white shadow-lift ring-2 ring-card transition hover:bg-brand-600"
                      aria-label="Change photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={onAvatar} className="hidden" />
                  </>
                )}
              </div>
              <div className="pb-1">
                <h2 className="font-display text-2xl font-bold text-ink">{fullName}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" /> @{profile.username}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {profile.email}
                  </span>
                  <Badge tone="brand" className="capitalize">
                    {profile.role.toLowerCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Age" value={age != null ? `${age} yrs` : '—'} />
            <Stat label="Gender" value={form.gender || '—'} className="capitalize" />
            <Stat label="Blood group" value={form.bloodGroup || '—'} />
            <Stat label="BMI" value={bmi ? `${bmi.bmi}` : '—'} hint={bmi?.cat} tone={bmi?.tone} />
          </div>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
      >
        {/* Personal */}
        <Section icon={<UserIcon className="h-5 w-5" />} title="Personal information">
          <Grid>
            <F label="First name" editing={editing} value={form.firstName}>
              <input className={field} value={form.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} />
            </F>
            <F label="Last name" editing={editing} value={form.lastName}>
              <input className={field} value={form.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} />
            </F>
            <F label="Phone" editing={editing} value={form.phone} icon={<Phone className="h-3.5 w-3.5" />}>
              <input className={field} value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 1234" />
            </F>
            <F label="Date of birth" editing={editing} value={form.dateOfBirth}>
              <input type="date" className={field} value={form.dateOfBirth ?? ''} onChange={(e) => set('dateOfBirth', e.target.value || null)} />
            </F>
            <F label="Gender" editing={editing} value={form.gender} className="capitalize">
              <input className={field} value={form.gender ?? ''} onChange={(e) => set('gender', e.target.value)} placeholder="e.g. Male, Female" />
            </F>
            <F label="Blood group" editing={editing} value={form.bloodGroup}>
              <input className={field} value={form.bloodGroup ?? ''} onChange={(e) => set('bloodGroup', e.target.value)} placeholder="e.g. O+, B-" />
            </F>
            <F label="Age" editing={editing} value={form.age != null ? `${form.age} yrs` : ''} className="col-span-2">
              <input type="number" className={field} value={form.age ?? ''} onChange={(e) => set('age', num(e.target.value))} placeholder="e.g. 25" />
            </F>
          </Grid>
        </Section>

        {/* Body metrics */}
        <Section icon={<HeartPulse className="h-5 w-5" />} title="Body metrics">
          <Grid>
            <F label="Height (cm)" editing={editing} value={form.heightCm != null ? `${form.heightCm} cm` : ''}>
              <input type="number" className={field} value={form.heightCm ?? ''} onChange={(e) => set('heightCm', num(e.target.value))} placeholder="170" />
            </F>
            <F label="Weight (kg)" editing={editing} value={form.weightKg != null ? `${form.weightKg} kg` : ''}>
              <input type="number" className={field} value={form.weightKg ?? ''} onChange={(e) => set('weightKg', num(e.target.value))} placeholder="68" />
            </F>
            <F label="BMI (manual override)" editing={editing} value={form.bmi != null ? `${form.bmi}` : ''} className="col-span-2">
              <input type="number" step="0.1" className={field} value={form.bmi ?? ''} onChange={(e) => set('bmi', num(e.target.value))} placeholder="e.g. 22.5" />
            </F>
          </Grid>
          {/* BMI gauge */}
          <div className="mt-4 rounded-xl border border-line bg-surface/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Body Mass Index</span>
              {bmi ? (
                <span className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-ink">{bmi.bmi}</span>
                  <Badge tone={bmi.tone}>{bmi.cat}</Badge>
                </span>
              ) : (
                <span className="text-sm text-ink-subtle">Add height & weight or BMI</span>
              )}
            </div>
            <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-gradient-to-r from-info via-success via-warning to-danger">
              {bmi && (
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-card bg-ink shadow-md"
                  style={{ left: `${bmi.pct}%` }}
                />
              )}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-medium text-ink-subtle">
              <span>Underweight</span><span>Healthy</span><span>Overweight</span><span>Obese</span>
            </div>
          </div>
        </Section>

        {/* Medical */}
        <Section icon={<ShieldAlert className="h-5 w-5" />} title="Medical information" className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FT label="Medical history" editing={editing} value={form.medicalHistory}>
              <Textarea value={form.medicalHistory ?? ''} onChange={(e) => set('medicalHistory', e.target.value)} placeholder="e.g. Hypertension since 2020" className="min-h-[90px]" />
            </FT>
            <FT label="Current medications" editing={editing} value={form.currentMedications}>
              <Textarea value={form.currentMedications ?? ''} onChange={(e) => set('currentMedications', e.target.value)} placeholder="e.g. Metformin 500mg" className="min-h-[90px]" />
            </FT>
            <FT label="Allergies" editing={editing} value={form.allergies}>
              <Textarea value={form.allergies ?? ''} onChange={(e) => set('allergies', e.target.value)} placeholder="e.g. Penicillin, peanuts" className="min-h-[90px]" />
            </FT>
          </div>
        </Section>

        {/* Emergency */}
        <Section icon={<Phone className="h-5 w-5" />} title="Emergency contact">
          <Grid>
            <F label="Name" editing={editing} value={form.emergencyContactName}>
              <input className={field} value={form.emergencyContactName ?? ''} onChange={(e) => set('emergencyContactName', e.target.value)} />
            </F>
            <F label="Phone" editing={editing} value={form.emergencyContactPhone}>
              <input className={field} value={form.emergencyContactPhone ?? ''} onChange={(e) => set('emergencyContactPhone', e.target.value)} />
            </F>
            <F label="Relationship" editing={editing} value={form.emergencyContactRelation} className="col-span-2">
              <input className={field} value={form.emergencyContactRelation ?? ''} onChange={(e) => set('emergencyContactRelation', e.target.value)} placeholder="e.g. Spouse, parent" />
            </F>
          </Grid>
        </Section>

        {/* Lifestyle */}
        <Section icon={<Activity className="h-5 w-5" />} title="Lifestyle">
          <Grid>
            <F label="Smoking" editing={editing} value={form.smokingStatus} className="capitalize" icon={<Cigarette className="h-3.5 w-3.5" />}>
              <select className={field} value={form.smokingStatus ?? ''} onChange={(e) => set('smokingStatus', e.target.value)}>
                <option value="">Select…</option>
                {SMOKING.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </F>
            <F label="Alcohol" editing={editing} value={form.alcoholUse} className="capitalize" icon={<Wine className="h-3.5 w-3.5" />}>
              <select className={field} value={form.alcoholUse ?? ''} onChange={(e) => set('alcoholUse', e.target.value)}>
                <option value="">Select…</option>
                {ALCOHOL.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </F>
            <F label="Exercise" editing={editing} value={form.exerciseLevel} className="capitalize" icon={<Dumbbell className="h-3.5 w-3.5" />}>
              <select className={field} value={form.exerciseLevel ?? ''} onChange={(e) => set('exerciseLevel', e.target.value)}>
                <option value="">Select…</option>
                {EXERCISE.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </F>
            <F label="Sleep (hrs/night)" editing={editing} value={form.sleepHours != null ? `${form.sleepHours} h` : ''} icon={<Moon className="h-3.5 w-3.5" />}>
              <input type="number" step="0.5" className={field} value={form.sleepHours ?? ''} onChange={(e) => set('sleepHours', num(e.target.value))} placeholder="7.5" />
            </F>
            <F label="Water (L/day)" editing={editing} value={form.waterIntakeLiters != null ? `${form.waterIntakeLiters} L` : ''} icon={<Droplets className="h-3.5 w-3.5" />} className="col-span-2 sm:col-span-1">
              <input type="number" step="0.1" className={field} value={form.waterIntakeLiters ?? ''} onChange={(e) => set('waterIntakeLiters', num(e.target.value))} placeholder="2.0" />
            </F>
          </Grid>
        </Section>
      </motion.div>
    </div>
  )
}

// ── Small building blocks ──────────────────────────────────────────────────
function Stat({ label, value, hint, tone, className }: { label: string; value: string; hint?: string; tone?: string; className?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface/50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className={cn('mt-0.5 font-display text-lg font-bold text-ink', className)}>{value}</p>
      {hint && <p className={cn('text-xs font-medium', tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : tone === 'info' ? 'text-info' : 'text-success')}>{hint}</p>}
    </div>
  )
}

function Section({ icon, title, children, className }: { icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card padding="lg" className={className}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-brand-600">{icon}</span>
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </Card>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3.5">{children}</div>
}

function F({ label, value, editing, children, className, icon }: { label: string; value?: string | null; editing: boolean; children: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
        {icon}{label}
      </label>
      {editing ? children : <p className={cn('text-[15px] text-ink', !value && 'text-ink-subtle')}>{value || 'Not set'}</p>}
    </div>
  )
}

// Full-width field (textarea) variant
function FT({ label, value, editing, children }: { label: string; value?: string | null; editing: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</label>
      {editing ? children : <p className={cn('whitespace-pre-wrap text-[15px] text-ink', !value && 'text-ink-subtle')}>{value || 'Not set'}</p>}
    </div>
  )
}
