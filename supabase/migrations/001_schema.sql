-- SkillSwap Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- CUSTOM TYPES (Enums)
-- ============================================

CREATE TYPE skill_category AS ENUM (
  'technology',
  'music',
  'languages',
  'cooking',
  'fitness',
  'arts-crafts',
  'gardening',
  'diy-repairs',
  'tutoring',
  'photography',
  'business',
  'other'
);

CREATE TYPE skill_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

CREATE TYPE listing_type AS ENUM (
  'offered',
  'wanted'
);

CREATE TYPE swap_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'in_progress',
  'completed',
  'cancelled'
);

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  neighbourhood TEXT NOT NULL,
  postcode TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified_neighbour BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Listings
CREATE TABLE public.skill_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category skill_category NOT NULL,
  level skill_level NOT NULL,
  listing_type listing_type NOT NULL,
  availability TEXT NOT NULL,
  is_remote BOOLEAN DEFAULT FALSE,
  is_in_person BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  swap_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT DEFAULT ''
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Swap Proposals
CREATE TABLE public.swap_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offered_skill_id UUID NOT NULL REFERENCES public.skill_listings(id) ON DELETE CASCADE,
  requested_skill_id UUID NOT NULL REFERENCES public.skill_listings(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status swap_status DEFAULT 'pending',
  proposed_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  proposer_completed BOOLEAN DEFAULT FALSE,
  recipient_completed BOOLEAN DEFAULT FALSE,

  -- Ensure proposer and recipient are different users
  CONSTRAINT different_users CHECK (proposer_id != recipient_id)
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_id UUID NOT NULL REFERENCES public.swap_proposals(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  skill_category skill_category NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One review per user per swap
  UNIQUE(swap_id, reviewer_id)
);

-- Add foreign key from conversations to swap_proposals (after swap_proposals exists)
ALTER TABLE public.conversations
  ADD CONSTRAINT fk_conversations_swap
  FOREIGN KEY (swap_id) REFERENCES public.swap_proposals(id) ON DELETE SET NULL;

-- ============================================
-- INDEXES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_neighbourhood ON public.profiles(neighbourhood);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Skill Listings
CREATE INDEX idx_skill_listings_user_id ON public.skill_listings(user_id);
CREATE INDEX idx_skill_listings_category ON public.skill_listings(category);
CREATE INDEX idx_skill_listings_listing_type ON public.skill_listings(listing_type);
CREATE INDEX idx_skill_listings_created_at ON public.skill_listings(created_at DESC);

-- Conversations
CREATE INDEX idx_conversations_participants ON public.conversations USING GIN(participant_ids);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX idx_conversations_swap_id ON public.conversations(swap_id);

-- Messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON public.messages(conversation_id, sent_at);
CREATE INDEX idx_messages_unread ON public.messages(conversation_id, is_read) WHERE is_read = FALSE;

-- Swap Proposals
CREATE INDEX idx_swap_proposals_proposer_id ON public.swap_proposals(proposer_id);
CREATE INDEX idx_swap_proposals_recipient_id ON public.swap_proposals(recipient_id);
CREATE INDEX idx_swap_proposals_status ON public.swap_proposals(status);
CREATE INDEX idx_swap_proposals_conversation_id ON public.swap_proposals(conversation_id);

-- Reviews
CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_swap_id ON public.reviews(swap_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER skill_listings_updated_at
  BEFORE UPDATE ON public.skill_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_at = NEW.sent_at,
    last_message_preview = LEFT(NEW.content, 100)
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, neighbourhood, postcode)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'neighbourhood', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'postcode', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are created via trigger only"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Skill Listings Policies
CREATE POLICY "Skill listings are viewable by everyone"
  ON public.skill_listings FOR SELECT
  USING (true);

CREATE POLICY "Users can create own skill listings"
  ON public.skill_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill listings"
  ON public.skill_listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skill listings"
  ON public.skill_listings FOR DELETE
  USING (auth.uid() = user_id);

-- Conversations Policies
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can create conversations they participate in"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = ANY(participant_ids));

-- Messages Policies
CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND auth.uid() = ANY(participant_ids)
    )
  );

CREATE POLICY "Users can send messages to own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND auth.uid() = ANY(participant_ids)
    )
  );

CREATE POLICY "Users can update messages in own conversations"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND auth.uid() = ANY(participant_ids)
    )
  );

-- Swap Proposals Policies
CREATE POLICY "Users can view own swaps"
  ON public.swap_proposals FOR SELECT
  USING (auth.uid() = proposer_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create swap proposals"
  ON public.swap_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

CREATE POLICY "Users can update own swaps"
  ON public.swap_proposals FOR UPDATE
  USING (auth.uid() = proposer_id OR auth.uid() = recipient_id);

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for own completed swaps"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.swap_proposals
      WHERE id = swap_id
      AND status = 'completed'
      AND (proposer_id = auth.uid() OR recipient_id = auth.uid())
    )
  );

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
