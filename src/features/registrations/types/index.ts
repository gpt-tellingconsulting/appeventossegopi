// Re-export types from @/types/database for registrations feature
export type {
  Registration,
  AttendanceStatus,
  LeadStatus,
  Consent,
  ConsentType,
} from '@/types/database'

// Additional types specific to registration management

export interface RegistrationFilters {
  search?: string
  attendance_status?: string
  lead_status?: string
  eventId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface RegistrationStats {
  total: number
  registered: number
  confirmed: number
  attended: number
  no_show: number
  cancelled: number
}

export interface UpdateRegistrationDTO {
  attendance_status?: string
  tags?: string[]
  lead_status?: string
  internal_notes?: string
  lead_score?: number
}

export interface RegistrationWithConsents {
  id: string
  event_id: string
  first_name: string
  last_name: string
  email: string
  email_verified: boolean
  phone: string
  phone_country_code: string
  company: string | null
  company_cif: string | null
  position: string | null
  attendance_status: string
  checked_in_at: string | null
  tags: string[]
  lead_score: number
  lead_status: string
  nps_score: number | null
  internal_notes: string | null
  created_at: string
  updated_at: string
  consents?: Array<{
    id: string
    consent_type: string
    granted: boolean
    consent_timestamp: string
    consent_ip: string
    withdrawn_at: string | null
    policy_version: string
  }>
  event?: {
    id: string
    title: string
    event_date: string
  }
}

export interface PaginatedRegistrations {
  data: RegistrationWithConsents[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
