import { API_BASE, getStoredUser, ApiError, api } from '@/lib/api'

export interface MedicalReport {
  id: string
  userId: string
  fileName: string
  fileType?: string
  extractedText?: string
  structuredData?: string // JSON string array of parameters
  abnormalities?: string // JSON string array of flagged parameters
  recommendations?: string // JSON string array of guidelines
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  updatedAt?: string
}

export interface ParsedReportData {
  patientName: string
  reportDate: string
  labName: string
  summary: string
  parameters: Array<{
    name: string
    value: string
    normalRange: string
    status: string // NORMAL, ELEVATED, HIGH, LOW, CRITICAL
    comments?: string
  }>
  abnormalities: Array<{
    name: string
    value: string
    status: string
  }>
  guidelines: string[]
  status: 'NORMAL' | 'WARNING' | 'CRITICAL'
}

export async function fetchReports(userId: string): Promise<MedicalReport[]> {
  try {
    return await api.get<MedicalReport[]>(`/reports/user/${userId}`)
  } catch {
    return []
  }
}

export async function uploadReport(file: File, userId: string): Promise<MedicalReport> {
  const user = getStoredUser()
  const headers: Record<string, string> = {}
  if (user?.token) {
    headers['Authorization'] = `Bearer ${user.token}`
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('userId', userId)

  const res = await fetch(`${API_BASE}/reports/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const text = await res.text()
  let body: any = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && 'message' in body
        ? String(body.message)
        : typeof body === 'string' && body
          ? body
          : `Upload failed with status ${res.status}`
    throw new ApiError(msg, res.status, body)
  }

  return body as MedicalReport
}
