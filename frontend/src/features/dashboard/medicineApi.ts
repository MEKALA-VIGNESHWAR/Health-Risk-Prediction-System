import { api } from '@/lib/api'

export interface MedicineReminder {
  id?: string
  userId: string
  medicineName: string
  dosage: string
  frequency: string // DAILY, WEEKLY, ONCE
  times: string // Comma-separated times (e.g. 08:00, 20:00)
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  active?: boolean
  createdAt?: string
}

export interface MedicineLog {
  id: string
  reminderId: string
  scheduledTime: string
  loggedTime?: string
  status: 'TAKEN' | 'MISSED' | 'SNOOZED'
}

export async function fetchReminders(userId: string): Promise<MedicineReminder[]> {
  try {
    return await api.get<MedicineReminder[]>(`/reminders/user/${userId}`)
  } catch {
    return []
  }
}

export async function createReminder(reminder: MedicineReminder): Promise<MedicineReminder> {
  return await api.post<MedicineReminder>(`/reminders`, reminder)
}

export async function toggleReminder(id: string): Promise<MedicineReminder> {
  return await api.put<MedicineReminder>(`/reminders/${id}/toggle`)
}

export async function deleteReminder(id: string): Promise<void> {
  await api.del(`/reminders/${id}`)
}

export async function fetchIntakeLogs(userId: string): Promise<MedicineLog[]> {
  try {
    return await api.get<MedicineLog[]>(`/reminders/logs/user/${userId}`)
  } catch {
    return []
  }
}

export async function logIntake(reminderId: string, scheduledTime: string, status: 'TAKEN' | 'MISSED' | 'SNOOZED'): Promise<MedicineLog> {
  return await api.post<MedicineLog>(`/reminders/logs`, { reminderId, scheduledTime, status })
}
