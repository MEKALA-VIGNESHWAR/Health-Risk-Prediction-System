import { useEffect, useState } from 'react'
import {
  BellRing,
  Plus,
  Trash2,
  History,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Card, Badge, Button, Modal, Spinner } from '@/components/ui'
import {
  fetchReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
  fetchIntakeLogs,
  logIntake,
  type MedicineReminder,
  type MedicineLog,
} from '@/features/dashboard/medicineApi'

export function Reminders() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<MedicineReminder[]>([])
  const [logs, setLogs] = useState<MedicineLog[]>([])
  const [loading, setLoading] = useState(true)

  // Creation State
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('1 tablet')
  const [frequency, setFrequency] = useState('DAILY')
  const [times, setTimes] = useState('08:00')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!user?.userId) return
    setLoading(true)
    try {
      const [fetchedReminders, fetchedLogs] = await Promise.all([
        fetchReminders(user.userId),
        fetchIntakeLogs(user.userId),
      ])
      setReminders(fetchedReminders)
      setLogs(fetchedLogs)
    } catch (err) {
      console.error('Failed to load medicine reminders', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.userId || !name.trim() || !times.trim()) return
    setCreating(true)
    setError(null)
    try {
      await createReminder({
        userId: user.userId,
        medicineName: name.trim(),
        dosage: dosage.trim(),
        frequency,
        times: times.trim(),
        startDate,
        endDate: endDate.trim() || undefined,
      })
      setModalOpen(false)
      setName('')
      setDosage('1 tablet')
      setTimes('08:00')
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to create reminder.')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleReminder(id)
      await loadData()
    } catch (err) {
      console.error('Failed to toggle reminder status', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication schedule?')) return
    try {
      await deleteReminder(id)
      await loadData()
    } catch (err) {
      console.error('Failed to delete reminder', err)
    }
  }

  const handleLog = async (reminderId: string, scheduledTime: string, status: 'TAKEN' | 'MISSED') => {
    try {
      await logIntake(reminderId, scheduledTime, status)
      await loadData()
    } catch (err) {
      console.error('Failed to log medicine intake status', err)
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Spinner size={36} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Medication Tracker</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Configure dosage routines and log take schedules to monitor safety limits.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Medication
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Active Schedules list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle">Active Schedules</h3>

          {reminders.length === 0 ? (
            <Card className="text-center p-12">
              <BellRing className="h-10 w-10 text-ink-subtle mx-auto mb-3" />
              <h4 className="font-semibold text-ink text-sm">No reminders set</h4>
              <p className="text-xs text-ink-muted mt-1">Configure a schedule to trigger notifications.</p>
            </Card>
          ) : (
            <div className="grid gap-3.5">
              {reminders.map((rem) => (
                <Card key={rem.id} padding="md" className="relative group hover:border-brand-300 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                        <BellRing className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-ink">{rem.medicineName}</h4>
                        <p className="text-xs text-ink-muted mt-1 flex items-center gap-2">
                          <span>{rem.dosage}</span>
                          <span>•</span>
                          <span className="capitalize">{rem.frequency.toLowerCase()}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
                          <span className="flex items-center gap-1 font-semibold text-brand-600">
                            <Clock className="h-3.5 w-3.5" /> Times: {rem.times}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => rem.id && handleToggle(rem.id)}
                        className={cn(
                          'px-2.5 py-1 text-xs font-semibold rounded-lg border transition',
                          rem.active
                            ? 'border-brand-200 bg-brand-50/10 text-brand-700 dark:text-brand-400'
                            : 'border-line text-ink-subtle',
                        )}
                      >
                        {rem.active ? 'Active' : 'Paused'}
                      </button>
                      <button
                        onClick={() => rem.id && handleDelete(rem.id)}
                        className="p-1.5 rounded-lg border border-transparent text-ink-subtle hover:text-danger hover:border-danger-100 hover:bg-danger-50/10 transition"
                        title="Delete schedule"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Intake log */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle flex items-center gap-1">
            <History className="h-4 w-4" /> Intake Log
          </h3>

          {logs.length === 0 ? (
            <Card className="text-center p-8 text-xs text-ink-muted">
              No intake logs registered yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((logItem) => {
                const correspondingReminder = reminders.find(r => r.id === logItem.reminderId)
                return (
                  <Card key={logItem.id} padding="sm" className="bg-surface/30">
                    <div className="flex items-start justify-between gap-2.5">
                      <div>
                        <p className="text-xs font-bold text-ink">
                          {correspondingReminder?.medicineName || 'Medication'}
                        </p>
                        <p className="text-[10px] text-ink-muted mt-0.5">
                          Scheduled: {new Date(logItem.scheduledTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {logItem.status === 'MISSED' && (
                          <div className="flex items-center gap-1.5">
                            <Badge tone="danger">Missed</Badge>
                            <button
                              onClick={() => handleLog(logItem.reminderId, logItem.scheduledTime, 'TAKEN')}
                              className="grid h-6 w-6 place-items-center rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition"
                              title="Mark taken"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        {logItem.status === 'TAKEN' && (
                          <Badge tone="brand">Taken</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Medication Modal ─────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Medication Schedule"
        description="Configure dynamic daily doses."
        size="md"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button onClick={() => setModalOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={creating} variant="primary">
              {creating ? <Spinner size={16} /> : 'Save Medication'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="flex gap-2 rounded-xl border border-danger-100 bg-danger-50/10 p-3 text-xs text-danger-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-ink-subtle uppercase block mb-1">Medication Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Metformin"
              className="w-full px-3 py-2 border border-line rounded-xl bg-surface/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-ink-subtle uppercase block mb-1">Dosage</label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g., 1 tablet"
                className="w-full px-3 py-2 border border-line rounded-xl bg-surface/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-subtle uppercase block mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-xl bg-surface/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="ONCE">Once</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-subtle uppercase block mb-1">Times (comma-separated)</label>
            <input
              type="text"
              required
              value={times}
              onChange={(e) => setTimes(e.target.value)}
              placeholder="e.g., 08:00, 20:00"
              className="w-full px-3 py-2 border border-line rounded-xl bg-surface/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <span className="text-[10px] text-ink-subtle mt-1 block">Specify hour values in 24h format.</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-ink-subtle uppercase block mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-xl bg-surface/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-subtle uppercase block mb-1">End Date (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-xl bg-surface/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
export default Reminders
