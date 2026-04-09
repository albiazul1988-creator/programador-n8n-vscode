export type UserRole = 'super_admin' | 'property_manager' | 'president' | 'vocal' | 'neighbor'
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type IncidentPriority = 'low' | 'medium' | 'high' | 'urgent'
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'exempt'
export type ReservationStatus = 'confirmed' | 'cancelled' | 'pending'
export type VoteStatus = 'draft' | 'open' | 'closed'
export type MemberType = 'owner' | 'tenant'
export type AnnouncementType = 'normal' | 'important' | 'urgent'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  address: string
  city: string
  postal_code: string | null
  province: string | null
  cif: string | null
  total_units: number
  plan: 'comunidad' | 'urbanizacion'
  plan_price: number | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled'
  trial_ends_at: string | null
  property_manager_id: string | null
  logo_url: string | null
  primary_color: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CommunityMember {
  id: string
  community_id: string
  profile_id: string
  role: UserRole
  member_type: MemberType
  unit_number: string
  portal: string | null
  floor: string | null
  door: string | null
  coefficient: number
  iban: string | null
  active: boolean
  joined_at: string
  profile?: Profile
}

export interface Announcement {
  id: string
  community_id: string
  author_id: string
  title: string
  body: string
  type: AnnouncementType
  pinned: boolean
  send_push: boolean
  send_email: boolean
  published_at: string
  expires_at: string | null
  created_at: string
  author?: Profile
}

export interface Incident {
  id: string
  community_id: string
  reported_by: string
  assigned_to: string | null
  provider_id: string | null
  title: string
  description: string
  location: string | null
  status: IncidentStatus
  priority: IncidentPriority
  rating: number | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  reporter?: Profile
  photos?: IncidentPhoto[]
  updates?: IncidentUpdate[]
}

export interface IncidentPhoto {
  id: string
  incident_id: string
  url: string
  uploaded_by: string | null
  created_at: string
}

export interface IncidentUpdate {
  id: string
  incident_id: string
  author_id: string
  comment: string
  status_change: IncidentStatus | null
  created_at: string
  author?: Profile
}

export interface CommonArea {
  id: string
  community_id: string
  name: string
  description: string | null
  capacity: number | null
  max_reservations_per_month: number
  advance_booking_days: number
  min_hours_notice: number
  requires_deposit: boolean
  deposit_amount: number | null
  rules: string | null
  image_url: string | null
  active: boolean
  created_at: string
}

export interface Reservation {
  id: string
  area_id: string
  community_id: string
  member_id: string
  date: string
  start_time: string
  end_time: string
  status: ReservationStatus
  notes: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  created_at: string
  area?: CommonArea
  member?: CommunityMember
}

export interface Fee {
  id: string
  community_id: string
  name: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time'
  due_day: number
  active: boolean
  created_at: string
}

export interface FeePayment {
  id: string
  fee_id: string
  community_id: string
  member_id: string
  period: string
  amount: number
  status: PaymentStatus
  stripe_payment_intent_id: string | null
  paid_at: string | null
  due_date: string | null
  notes: string | null
  created_at: string
  fee?: Fee
  member?: CommunityMember
}

export interface Vote {
  id: string
  community_id: string
  created_by: string
  title: string
  description: string | null
  status: VoteStatus
  quorum_pct: number
  allow_abstain: boolean
  starts_at: string | null
  ends_at: string | null
  minutes_pdf_url: string | null
  created_at: string
  options?: VoteOption[]
  responses?: VoteResponse[]
}

export interface VoteOption {
  id: string
  vote_id: string
  text: string
  order_index: number
}

export interface VoteResponse {
  id: string
  vote_id: string
  member_id: string
  option_id: string | null
  delegated_to: string | null
  voted_at: string
}

export interface Document {
  id: string
  community_id: string
  uploaded_by: string
  name: string
  description: string | null
  type: string
  file_url: string
  file_size_bytes: number | null
  mime_type: string | null
  visible_to_all: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  community_id: string
  sender_id: string
  channel: string
  body: string
  reply_to: string | null
  created_at: string
  sender?: Profile
}

export interface Vehicle {
  id: string
  member_id: string
  plate: string
  brand: string | null
  model: string | null
  color: string | null
  type: 'car' | 'motorcycle' | 'van'
  created_at: string
}

// Tipo Database para Supabase client
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      communities: { Row: Community; Insert: Partial<Community>; Update: Partial<Community> }
      community_members: { Row: CommunityMember; Insert: Partial<CommunityMember>; Update: Partial<CommunityMember> }
      announcements: { Row: Announcement; Insert: Partial<Announcement>; Update: Partial<Announcement> }
      incidents: { Row: Incident; Insert: Partial<Incident>; Update: Partial<Incident> }
      incident_photos: { Row: IncidentPhoto; Insert: Partial<IncidentPhoto>; Update: Partial<IncidentPhoto> }
      incident_updates: { Row: IncidentUpdate; Insert: Partial<IncidentUpdate>; Update: Partial<IncidentUpdate> }
      common_areas: { Row: CommonArea; Insert: Partial<CommonArea>; Update: Partial<CommonArea> }
      reservations: { Row: Reservation; Insert: Partial<Reservation>; Update: Partial<Reservation> }
      fees: { Row: Fee; Insert: Partial<Fee>; Update: Partial<Fee> }
      fee_payments: { Row: FeePayment; Insert: Partial<FeePayment>; Update: Partial<FeePayment> }
      votes: { Row: Vote; Insert: Partial<Vote>; Update: Partial<Vote> }
      vote_options: { Row: VoteOption; Insert: Partial<VoteOption>; Update: Partial<VoteOption> }
      vote_responses: { Row: VoteResponse; Insert: Partial<VoteResponse>; Update: Partial<VoteResponse> }
      documents: { Row: Document; Insert: Partial<Document>; Update: Partial<Document> }
      chat_messages: { Row: ChatMessage; Insert: Partial<ChatMessage>; Update: Partial<ChatMessage> }
      vehicles: { Row: Vehicle; Insert: Partial<Vehicle>; Update: Partial<Vehicle> }
    }
  }
}
