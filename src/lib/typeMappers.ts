// Type mappers to convert between Supabase database format (snake_case)
// and the existing app types (camelCase)

import type {
  ProfileRow,
  ProfileUpdate,
  SkillListingRow,
  SkillListingInsert,
  SkillListingUpdate,
  ConversationRow,
  ConversationInsert,
  MessageRow,
  MessageInsert,
  MessageUpdate,
  SwapProposalRow,
  SwapProposalInsert,
  SwapProposalUpdate,
  ReviewRow,
  ReviewInsert,
} from '@/types/database'

import type {
  User,
  SkillListing,
  Conversation,
  Message,
  SwapProposal,
  Review,
} from '@/types'

// ============================================
// Profile <-> User
// ============================================

export function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    neighbourhood: profile.neighbourhood,
    postcode: profile.postcode,
    joinedAt: profile.joined_at,
    isVerifiedNeighbour: profile.is_verified_neighbour,
    // These are computed/not stored in profiles table
    skillsOffered: [],
    skillsWanted: [],
  }
}

export function mapUserToProfileUpdate(user: Partial<User>): ProfileUpdate {
  const update: ProfileUpdate = {}

  if (user.firstName !== undefined) update.first_name = user.firstName
  if (user.lastName !== undefined) update.last_name = user.lastName
  if (user.email !== undefined) update.email = user.email
  if (user.avatarUrl !== undefined) update.avatar_url = user.avatarUrl
  if (user.bio !== undefined) update.bio = user.bio
  if (user.neighbourhood !== undefined) update.neighbourhood = user.neighbourhood
  if (user.postcode !== undefined) update.postcode = user.postcode
  if (user.isVerifiedNeighbour !== undefined) update.is_verified_neighbour = user.isVerifiedNeighbour

  return update
}

// ============================================
// SkillListing
// ============================================

export function mapDbSkillToListing(row: SkillListingRow): SkillListing {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category,
    level: row.level,
    listingType: row.listing_type,
    availability: row.availability,
    isRemote: row.is_remote,
    isInPerson: row.is_in_person,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapListingToDbInsert(
  listing: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt'>
): SkillListingInsert {
  return {
    user_id: listing.userId,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    level: listing.level,
    listing_type: listing.listingType,
    availability: listing.availability,
    is_remote: listing.isRemote,
    is_in_person: listing.isInPerson,
    tags: listing.tags,
  }
}

export function mapListingToDbUpdate(data: Partial<SkillListing>): SkillListingUpdate {
  const update: SkillListingUpdate = {}

  if (data.title !== undefined) update.title = data.title
  if (data.description !== undefined) update.description = data.description
  if (data.category !== undefined) update.category = data.category
  if (data.level !== undefined) update.level = data.level
  if (data.listingType !== undefined) update.listing_type = data.listingType
  if (data.availability !== undefined) update.availability = data.availability
  if (data.isRemote !== undefined) update.is_remote = data.isRemote
  if (data.isInPerson !== undefined) update.is_in_person = data.isInPerson
  if (data.tags !== undefined) update.tags = data.tags

  return update
}

// ============================================
// Conversation
// ============================================

export function mapDbConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    participantIds: row.participant_ids as [string, string],
    swapId: row.swap_id,
    createdAt: row.created_at,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
  }
}

export function mapConversationToDbInsert(
  conversation: Omit<Conversation, 'id' | 'createdAt' | 'lastMessageAt' | 'lastMessagePreview'>
): ConversationInsert {
  return {
    participant_ids: conversation.participantIds,
    swap_id: conversation.swapId,
  }
}

// ============================================
// Message
// ============================================

export function mapDbMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    sentAt: row.sent_at,
    isRead: row.is_read,
  }
}

export function mapMessageToDbInsert(
  message: Omit<Message, 'id' | 'sentAt' | 'isRead'>
): MessageInsert {
  return {
    conversation_id: message.conversationId,
    sender_id: message.senderId,
    content: message.content,
  }
}

export function mapMessageToDbUpdate(data: Partial<Message>): MessageUpdate {
  const update: MessageUpdate = {}

  if (data.isRead !== undefined) update.is_read = data.isRead

  return update
}

// ============================================
// SwapProposal
// ============================================

export function mapDbSwapProposal(row: SwapProposalRow): SwapProposal {
  return {
    id: row.id,
    proposerId: row.proposer_id,
    recipientId: row.recipient_id,
    offeredSkillId: row.offered_skill_id,
    requestedSkillId: row.requested_skill_id,
    message: row.message,
    status: row.status,
    proposedAt: row.proposed_at,
    respondedAt: row.responded_at,
    completedAt: row.completed_at,
    conversationId: row.conversation_id,
    proposerCompleted: row.proposer_completed,
    recipientCompleted: row.recipient_completed,
  }
}

export function mapSwapProposalToDbInsert(
  proposal: Omit<SwapProposal, 'id' | 'proposedAt' | 'respondedAt' | 'completedAt' | 'status' | 'proposerCompleted' | 'recipientCompleted'>
): SwapProposalInsert {
  return {
    proposer_id: proposal.proposerId,
    recipient_id: proposal.recipientId,
    offered_skill_id: proposal.offeredSkillId,
    requested_skill_id: proposal.requestedSkillId,
    message: proposal.message,
    conversation_id: proposal.conversationId,
  }
}

export function mapSwapProposalToDbUpdate(data: Partial<SwapProposal>): SwapProposalUpdate {
  const update: SwapProposalUpdate = {}

  if (data.status !== undefined) update.status = data.status
  if (data.respondedAt !== undefined) update.responded_at = data.respondedAt
  if (data.completedAt !== undefined) update.completed_at = data.completedAt
  if (data.proposerCompleted !== undefined) update.proposer_completed = data.proposerCompleted
  if (data.recipientCompleted !== undefined) update.recipient_completed = data.recipientCompleted

  return update
}

// ============================================
// Review
// ============================================

export function mapDbReview(row: ReviewRow): Review {
  return {
    id: row.id,
    swapId: row.swap_id,
    reviewerId: row.reviewer_id,
    revieweeId: row.reviewee_id,
    rating: row.rating,
    comment: row.comment,
    skillCategory: row.skill_category,
    createdAt: row.created_at,
  }
}

export function mapReviewToDbInsert(review: Omit<Review, 'id' | 'createdAt'>): ReviewInsert {
  return {
    swap_id: review.swapId,
    reviewer_id: review.reviewerId,
    reviewee_id: review.revieweeId,
    rating: review.rating,
    comment: review.comment,
    skill_category: review.skillCategory,
  }
}
