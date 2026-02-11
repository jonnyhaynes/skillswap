// Database types for Supabase
// These match the schema in supabase/migrations/001_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum types matching PostgreSQL enums
export type SkillCategoryDb =
  | 'technology'
  | 'music'
  | 'languages'
  | 'cooking'
  | 'fitness'
  | 'arts-crafts'
  | 'gardening'
  | 'diy-repairs'
  | 'tutoring'
  | 'photography'
  | 'business'
  | 'other'

export type SkillLevelDb = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type ListingTypeDb = 'offered' | 'wanted'

export type SwapStatusDb =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type ReportReasonDb =
  | 'harassment'
  | 'inappropriate-content'
  | 'spam'
  | 'scam-fraud'
  | 'dangerous-illegal-activity'
  | 'safety-concern'
  | 'other'

export type ReportStatusDb = 'open' | 'under_review' | 'resolved' | 'dismissed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          avatar_url: string | null
          bio: string
          neighbourhood: string
          postcode: string
          joined_at: string
          is_verified_neighbour: boolean
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          email: string
          avatar_url?: string | null
          bio?: string
          neighbourhood?: string
          postcode?: string
          joined_at?: string
          is_verified_neighbour?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          avatar_url?: string | null
          bio?: string
          neighbourhood?: string
          postcode?: string
          joined_at?: string
          is_verified_neighbour?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      skill_listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: SkillCategoryDb
          level: SkillLevelDb
          listing_type: ListingTypeDb
          availability: string
          is_remote: boolean
          is_in_person: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: SkillCategoryDb
          level: SkillLevelDb
          listing_type: ListingTypeDb
          availability?: string
          is_remote?: boolean
          is_in_person?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: SkillCategoryDb
          level?: SkillLevelDb
          listing_type?: ListingTypeDb
          availability?: string
          is_remote?: boolean
          is_in_person?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'skill_listings_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          participant_ids: string[]
          swap_id: string | null
          created_at: string
          last_message_at: string
          last_message_preview: string
        }
        Insert: {
          id?: string
          participant_ids: string[]
          swap_id?: string | null
          created_at?: string
          last_message_at?: string
          last_message_preview?: string
        }
        Update: {
          id?: string
          participant_ids?: string[]
          swap_id?: string | null
          created_at?: string
          last_message_at?: string
          last_message_preview?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          sent_at: string
          is_read: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          sent_at?: string
          is_read?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          sent_at?: string
          is_read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey'
            columns: ['conversation_id']
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      swap_proposals: {
        Row: {
          id: string
          proposer_id: string
          recipient_id: string
          offered_skill_id: string
          requested_skill_id: string
          message: string
          status: SwapStatusDb
          proposed_at: string
          responded_at: string | null
          completed_at: string | null
          conversation_id: string
          proposer_completed: boolean
          recipient_completed: boolean
        }
        Insert: {
          id?: string
          proposer_id: string
          recipient_id: string
          offered_skill_id: string
          requested_skill_id: string
          message: string
          status?: SwapStatusDb
          proposed_at?: string
          responded_at?: string | null
          completed_at?: string | null
          conversation_id: string
          proposer_completed?: boolean
          recipient_completed?: boolean
        }
        Update: {
          id?: string
          proposer_id?: string
          recipient_id?: string
          offered_skill_id?: string
          requested_skill_id?: string
          message?: string
          status?: SwapStatusDb
          proposed_at?: string
          responded_at?: string | null
          completed_at?: string | null
          conversation_id?: string
          proposer_completed?: boolean
          recipient_completed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'swap_proposals_proposer_id_fkey'
            columns: ['proposer_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'swap_proposals_recipient_id_fkey'
            columns: ['recipient_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          swap_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string
          skill_category: SkillCategoryDb
          created_at: string
        }
        Insert: {
          id?: string
          swap_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string
          skill_category: SkillCategoryDb
          created_at?: string
        }
        Update: {
          id?: string
          swap_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string
          skill_category?: SkillCategoryDb
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_swap_id_fkey'
            columns: ['swap_id']
            referencedRelation: 'swap_proposals'
            referencedColumns: ['id']
          }
        ]
      }
      neighbourhoods: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      contact_enquiries: {
        Row: {
          id: string
          name: string
          email: string
          subject: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string
          reason: ReportReasonDb
          description: string
          evidence_swap_id: string | null
          status: ReportStatusDb
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id: string
          reason: ReportReasonDb
          description: string
          evidence_swap_id?: string | null
          status?: ReportStatusDb
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string
          reason?: ReportReasonDb
          description?: string
          evidence_swap_id?: string | null
          status?: ReportStatusDb
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_reports_reporter_id_fkey'
            columns: ['reporter_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_reports_reported_user_id_fkey'
            columns: ['reported_user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      skill_category: SkillCategoryDb
      skill_level: SkillLevelDb
      listing_type: ListingTypeDb
      swap_status: SwapStatusDb
      report_reason: ReportReasonDb
      report_status: ReportStatusDb
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for table rows
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type SkillListingRow = Database['public']['Tables']['skill_listings']['Row']
export type SkillListingInsert = Database['public']['Tables']['skill_listings']['Insert']
export type SkillListingUpdate = Database['public']['Tables']['skill_listings']['Update']

export type ConversationRow = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']

export type MessageRow = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export type SwapProposalRow = Database['public']['Tables']['swap_proposals']['Row']
export type SwapProposalInsert = Database['public']['Tables']['swap_proposals']['Insert']
export type SwapProposalUpdate = Database['public']['Tables']['swap_proposals']['Update']

export type ReviewRow = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type NeighbourhoodRow = Database['public']['Tables']['neighbourhoods']['Row']

export type ContactEnquiryRow = Database['public']['Tables']['contact_enquiries']['Row']
export type ContactEnquiryInsert = Database['public']['Tables']['contact_enquiries']['Insert']

export type UserReportRow = Database['public']['Tables']['user_reports']['Row']
export type UserReportInsert = Database['public']['Tables']['user_reports']['Insert']
