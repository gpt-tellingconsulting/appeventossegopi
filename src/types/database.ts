// ============================================
// TIPOS DEL DOMINIO - Eventos SEGOPI
// ============================================

export type UserRole = 'admin' | 'organizer' | 'viewer'

export type UserType = 'admin' | 'user'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  first_name: string | null
  last_name: string | null
  user_type: UserType
  company_access: number[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================
// Empresas
// ============================================

export interface Company {
  company_code: number
  name: string
  cif: string
  fiscal_address: string | null
  physical_address: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================
// Eventos
// ============================================

export type EventStatus = 'draft' | 'published' | 'closed' | 'completed' | 'cancelled'

export interface EventBenefit {
  icon: string
  title: string
  description: string
}

export interface Speaker {
  name: string
  title: string
  bio: string
  image_url: string
}

export interface GalleryImage {
  url: string
  alt: string
  caption: string
}

export interface Event {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null

  // Fecha y ubicacion
  event_date: string
  event_start_time: string
  event_end_time: string
  timezone: string
  venue_name: string
  venue_address: string
  city: string
  country: string
  google_maps_embed_url: string | null
  venue_image_url: string | null
  video_url: string | null
  latitude: number | null
  longitude: number | null

  // Sorteos
  raffle_conditions: string | null

  // Contenido JSONB
  benefits: EventBenefit[]
  speakers: Speaker[]
  gallery_images: GalleryImage[]

  // Configuracion
  status: EventStatus
  max_capacity: number | null
  registration_deadline: string | null

  // Organizador
  created_by: string | null

  // Empresa
  company_code: number | null

  // Relacion
  company?: Company

  created_at: string
  updated_at: string
}

// ============================================
// Inscripciones
// ============================================

export type AttendanceStatus = 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

export interface Registration {
  id: string
  event_id: string

  // Datos personales
  first_name: string
  last_name: string
  email: string
  email_verified: boolean
  email_verification_token: string | null
  phone: string
  phone_country_code: string
  company: string | null
  position: string | null
  company_cif: string | null
  invitation_number: string | null

  // Asistencia
  attendance_status: AttendanceStatus
  checked_in_at: string | null

  // RGPD
  registration_ip: string
  user_agent: string | null

  // QR check-in
  qr_token: string | null
  thanked_at: string | null

  // Sorteo
  raffle_eligible: boolean

  // CRM
  tags: string[]
  lead_score: number
  lead_status: LeadStatus

  // NPS
  nps_score: number | null
  survey_completed_at: string | null

  // Notas
  internal_notes: string | null

  created_at: string
  updated_at: string

  // Relaciones
  event?: Event
}

// ============================================
// Consentimientos RGPD
// ============================================

export type ConsentType = 'privacy_policy' | 'commercial_communications' | 'raffle_participation'

export interface Consent {
  id: string
  registration_id: string
  consent_type: ConsentType
  granted: boolean
  consent_timestamp: string
  consent_ip: string
  consent_user_agent: string | null
  withdrawn_at: string | null
  withdrawn_ip: string | null
  policy_version: string
  created_at: string
}

// ============================================
// Lista de supresion
// ============================================

export type SuppressionReason = 'unsubscribe' | 'deletion_request' | 'bounce' | 'complaint'

export interface SuppressionEntry {
  id: string
  email: string
  reason: SuppressionReason
  suppressed_at: string
  requested_ip: string | null
  data_deleted_at: string | null
  deleted_by: string | null
}

// ============================================
// Workflows
// ============================================

export type TriggerType = 'registration' | 'pre_event' | 'post_event' | 'manual'
export type TargetAudience = 'all' | 'attendees' | 'no_shows' | 'commercial_opted_in'
export type WorkflowExecutionStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'

export interface WorkflowDefinition {
  id: string
  name: string
  description: string | null
  trigger_type: TriggerType
  trigger_offset_hours: number | null
  is_active: boolean
  email_subject: string
  email_template: string
  include_ics_attachment: boolean
  target_audience: TargetAudience
  created_at: string
  updated_at: string
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  event_id: string
  registration_id: string | null
  status: WorkflowExecutionStatus
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
  error_message: string | null
  retry_count: number
  resend_email_id: string | null
  created_at: string

  // Relaciones
  workflow?: WorkflowDefinition
  registration?: Registration
}

// ============================================
// Sorteos
// ============================================

export type RaffleStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Raffle {
  id: string
  event_id: string
  name: string
  description: string | null
  prize_description: string
  status: RaffleStatus
  num_winners: number
  require_attendance: boolean
  require_raffle_consent: boolean
  executed_at: string | null
  executed_by: string | null
  random_seed: string | null
  created_at: string
  updated_at: string

  // Relaciones
  event?: Event
  entries?: RaffleEntry[]
}

export interface RaffleEntry {
  id: string
  raffle_id: string
  registration_id: string
  is_winner: boolean
  winner_position: number | null
  created_at: string

  // Relaciones
  registration?: Registration
}

// ============================================
// Premios por Evento
// ============================================

export interface EventPrize {
  id: string
  event_id: string
  name: string
  description: string | null
  image_url: string | null
  estimated_value: number | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateEventPrizeDTO {
  event_id: string
  name: string
  description?: string
  image_url?: string
  estimated_value?: number
  sort_order?: number
  is_active?: boolean
}

export interface UpdateEventPrizeDTO extends Partial<Omit<CreateEventPrizeDTO, 'event_id'>> {}

// ============================================
// Metricas
// ============================================

export interface EventMetric {
  id: string
  event_id: string
  metric_date: string
  total_registrations: number
  new_registrations: number
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  surveys_sent: number
  surveys_completed: number
  avg_nps_score: number | null
  leads_contacted: number
  leads_converted: number
  created_at: string
  updated_at: string
}

// ============================================
// DTOs para operaciones
// ============================================

export interface CreateEventDTO {
  slug: string
  title: string
  subtitle?: string
  description: string
  seo_title?: string
  seo_description?: string
  og_image_url?: string
  event_date: string
  event_start_time: string
  event_end_time: string
  timezone?: string
  venue_name: string
  venue_address: string
  city: string
  country?: string
  google_maps_embed_url?: string
  venue_image_url?: string
  video_url?: string
  latitude?: number
  longitude?: number
  raffle_conditions?: string
  benefits?: EventBenefit[]
  speakers?: Speaker[]
  gallery_images?: GalleryImage[]
  max_capacity?: number
  registration_deadline?: string
  company_code?: number
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  status?: EventStatus
}

export interface CreateRegistrationDTO {
  event_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  phone_country_code: string
  company?: string
  position?: string
  registration_ip: string
  user_agent?: string
  privacy_accepted: boolean
  commercial_accepted: boolean
}

export interface CreateRaffleDTO {
  event_id: string
  name: string
  description?: string
  prize_description: string
  num_winners?: number
  require_attendance?: boolean
  require_raffle_consent?: boolean
}

// ============================================
// DTOs de Empresa
// ============================================

export interface CreateCompanyDTO {
  company_code: number
  name: string
  cif: string
  fiscal_address?: string
  physical_address?: string
  email?: string
}

export interface UpdateCompanyDTO extends Partial<Omit<CreateCompanyDTO, 'company_code'>> {
  is_active?: boolean
}

// ============================================
// Permisos por Tipo de Usuario
// ============================================

export const USER_TYPE_PERMISSIONS = {
  admin: {
    canManageEvents: true,
    canManageRegistrations: true,
    canManageWorkflows: true,
    canManageRaffles: true,
    canViewAnalytics: true,
    canExportData: true,
    canManageUsers: true,
    canManageCompanies: true,
    canManageSettings: true,
  },
  user: {
    canManageEvents: true,
    canManageRegistrations: true,
    canManageWorkflows: true,
    canManageRaffles: true,
    canViewAnalytics: true,
    canExportData: true,
    canManageUsers: false,
    canManageCompanies: false,
    canManageSettings: false,
  },
} as const

export type Permission = keyof typeof USER_TYPE_PERMISSIONS.admin

export function hasPermission(userType: UserType, permission: Permission): boolean {
  return USER_TYPE_PERMISSIONS[userType][permission]
}

// ============================================
// Permisos por Rol (DEPRECATED - usar USER_TYPE_PERMISSIONS)
// ============================================

/** @deprecated Usar USER_TYPE_PERMISSIONS y hasPermission con UserType */
export const ROLE_PERMISSIONS = {
  admin: {
    canManageEvents: true,
    canManageRegistrations: true,
    canManageWorkflows: true,
    canManageRaffles: true,
    canViewAnalytics: true,
    canExportData: true,
    canManageUsers: true,
    canManageSettings: true,
  },
  organizer: {
    canManageEvents: true,
    canManageRegistrations: true,
    canManageWorkflows: true,
    canManageRaffles: true,
    canViewAnalytics: true,
    canExportData: true,
    canManageUsers: false,
    canManageSettings: false,
  },
  viewer: {
    canManageEvents: false,
    canManageRegistrations: false,
    canManageWorkflows: false,
    canManageRaffles: false,
    canViewAnalytics: true,
    canExportData: false,
    canManageUsers: false,
    canManageSettings: false,
  },
} as const

// ============================================
// Database type para Supabase client
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      companies: {
        Row: Company
        Insert: CreateCompanyDTO
        Update: UpdateCompanyDTO
      }
      events: {
        Row: Event
        Insert: CreateEventDTO & { created_by?: string; company_code?: number }
        Update: UpdateEventDTO
      }
      registrations: {
        Row: Registration
        Insert: Omit<Registration, 'id' | 'created_at' | 'updated_at' | 'email_verified' | 'attendance_status' | 'lead_score' | 'lead_status' | 'raffle_eligible'>
        Update: Partial<Omit<Registration, 'id' | 'created_at' | 'event_id'>>
      }
      consents: {
        Row: Consent
        Insert: Omit<Consent, 'id' | 'created_at'>
        Update: Pick<Consent, 'withdrawn_at' | 'withdrawn_ip'>
      }
      suppression_list: {
        Row: SuppressionEntry
        Insert: Omit<SuppressionEntry, 'id' | 'suppressed_at'>
        Update: Partial<Pick<SuppressionEntry, 'data_deleted_at' | 'deleted_by'>>
      }
      workflow_definitions: {
        Row: WorkflowDefinition
        Insert: Omit<WorkflowDefinition, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WorkflowDefinition, 'id' | 'created_at'>>
      }
      workflow_executions: {
        Row: WorkflowExecution
        Insert: Omit<WorkflowExecution, 'id' | 'created_at'>
        Update: Partial<Omit<WorkflowExecution, 'id' | 'created_at' | 'workflow_id' | 'event_id'>>
      }
      raffles: {
        Row: Raffle
        Insert: CreateRaffleDTO
        Update: Partial<Omit<Raffle, 'id' | 'created_at' | 'event_id'>>
      }
      raffle_entries: {
        Row: RaffleEntry
        Insert: Omit<RaffleEntry, 'id' | 'created_at' | 'is_winner' | 'winner_position'>
        Update: Partial<Pick<RaffleEntry, 'is_winner' | 'winner_position'>>
      }
      event_prizes: {
        Row: EventPrize
        Insert: CreateEventPrizeDTO
        Update: UpdateEventPrizeDTO
      }
      event_metrics: {
        Row: EventMetric
        Insert: Omit<EventMetric, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<EventMetric, 'id' | 'created_at' | 'event_id'>>
      }
    }
  }
}
