import { api } from '@/lib/api'

export interface Profile {
  userId: string
  username: string
  email: string
  role: string
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  phone?: string | null
  gender?: string | null
  dateOfBirth?: string | null // ISO yyyy-MM-dd
  age?: number | null
  heightCm?: number | null
  weightKg?: number | null
  bmi?: number | null
  bmiCategory?: string | null
  bloodGroup?: string | null
  medicalHistory?: string | null
  currentMedications?: string | null
  allergies?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  smokingStatus?: string | null
  alcoholUse?: string | null
  exerciseLevel?: string | null
  sleepHours?: number | null
  waterIntakeLiters?: number | null
}

export type ProfileUpdate = Omit<
  Profile,
  'userId' | 'username' | 'email' | 'role' | 'bmiCategory'
>

export const getProfile = () => api.get<Profile>('/profile/me')
export const updateProfile = (data: ProfileUpdate) => api.put<Profile>('/profile/me', data)
