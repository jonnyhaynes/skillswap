-- ============================================
-- SkillSwap Seed Data
-- ============================================
-- This file seeds the database with realistic test data.
-- It is run automatically by `supabase db reset` (configured in config.toml).
--
-- Order of operations:
--   1. Auth users (triggers auto-profile creation)
--   2. Update profiles with full details
--   3. Skill listings
--   4. Conversations (without swap_id to avoid circular FK)
--   5. Swap proposals (references conversations)
--   6. Update conversations with swap_id
--   7. Messages
--   8. Reviews

-- Ensure pgcrypto is available for crypt() and gen_salt()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================
-- 1. AUTH USERS
-- ============================================
-- Insert test users into auth.users. The handle_new_user() trigger will
-- auto-create a profile row for each. We then update profiles with full data.

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  email_change_confirm_status,
  phone_change,
  phone_change_token,
  reauthentication_token
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alex.chen@email.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    NOW(),
    jsonb_build_object('first_name', 'Alex', 'last_name', 'Chen', 'neighbourhood', 'Wickersley', 'postcode', 'S66 1AA'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '2025-11-01T09:00:00Z',
    '2025-11-01T09:00:00Z',
    '', '', '', '', '', 0, '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'maria.santos@email.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    NOW(),
    jsonb_build_object('first_name', 'Maria', 'last_name', 'Santos', 'neighbourhood', 'Wickersley', 'postcode', 'S66 2BB'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '2025-11-10T14:30:00Z',
    '2025-11-10T14:30:00Z',
    '', '', '', '', '', 0, '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'james.obrien@email.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    NOW(),
    jsonb_build_object('first_name', 'James', 'last_name', 'O''Brien', 'neighbourhood', 'Maltby', 'postcode', 'S66 7AA'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '2025-11-15T11:00:00Z',
    '2025-11-15T11:00:00Z',
    '', '', '', '', '', 0, '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'priya.patel@email.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    NOW(),
    jsonb_build_object('first_name', 'Priya', 'last_name', 'Patel', 'neighbourhood', 'Bramley', 'postcode', 'S66 3CC'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '2025-12-01T08:15:00Z',
    '2025-12-01T08:15:00Z',
    '', '', '', '', '', 0, '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'tom.williams@email.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    NOW(),
    jsonb_build_object('first_name', 'Tom', 'last_name', 'Williams', 'neighbourhood', 'Swinton', 'postcode', 'S64 8DD'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '2025-12-05T16:45:00Z',
    '2025-12-05T16:45:00Z',
    '', '', '', '', '', 0, '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'lena.fischer@email.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    NOW(),
    jsonb_build_object('first_name', 'Lena', 'last_name', 'Fischer', 'neighbourhood', 'Maltby', 'postcode', 'S66 7EE'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '2025-12-10T10:00:00Z',
    '2025-12-10T10:00:00Z',
    '', '', '', '', '', 0, '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'david.kim@email.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    NOW(),
    jsonb_build_object('first_name', 'David', 'last_name', 'Kim', 'neighbourhood', 'Bramley', 'postcode', 'S66 3FF'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '2025-12-15T13:20:00Z',
    '2025-12-15T13:20:00Z',
    '', '', '', '', '', 0, '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'sarah.johnson@email.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    NOW(),
    jsonb_build_object('first_name', 'Sarah', 'last_name', 'Johnson', 'neighbourhood', 'Rawmarsh', 'postcode', 'S62 6GG'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '2025-12-20T09:30:00Z',
    '2025-12-20T09:30:00Z',
    '', '', '', '', '', 0, '', '', ''
  );

-- Also insert into auth.identities (required by Supabase auth)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000001', 'email', 'alex.chen@email.com'), 'email', NOW(), '2025-11-01T09:00:00Z', '2025-11-01T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000002', 'email', 'maria.santos@email.com'), 'email', NOW(), '2025-11-10T14:30:00Z', '2025-11-10T14:30:00Z'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000003', 'email', 'james.obrien@email.com'), 'email', NOW(), '2025-11-15T11:00:00Z', '2025-11-15T11:00:00Z'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000004', 'email', 'priya.patel@email.com'), 'email', NOW(), '2025-12-01T08:15:00Z', '2025-12-01T08:15:00Z'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000005', 'email', 'tom.williams@email.com'), 'email', NOW(), '2025-12-05T16:45:00Z', '2025-12-05T16:45:00Z'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000006', 'email', 'lena.fischer@email.com'), 'email', NOW(), '2025-12-10T10:00:00Z', '2025-12-10T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000007', 'email', 'david.kim@email.com'), 'email', NOW(), '2025-12-15T13:20:00Z', '2025-12-15T13:20:00Z'),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000008', 'email', 'sarah.johnson@email.com'), 'email', NOW(), '2025-12-20T09:30:00Z', '2025-12-20T09:30:00Z');

-- ============================================
-- 2. UPDATE PROFILES
-- ============================================
-- The trigger created basic profiles. Now update them with full bios and details.

UPDATE public.profiles SET
  avatar_url = 'https://i.pravatar.cc/150?u=alex.chen',
  bio = 'Full-stack developer by day, aspiring musician by night. Always looking to pick up new creative skills from the community.',
  is_verified_neighbour = TRUE,
  joined_at = '2025-11-01T09:00:00Z'
WHERE id = '00000000-0000-0000-0000-000000000001';

UPDATE public.profiles SET
  avatar_url = 'https://i.pravatar.cc/150?u=maria.santos',
  bio = 'Classically trained guitarist with 15 years of experience. Passionate about flamenco and teaching others to find their rhythm.',
  is_verified_neighbour = TRUE,
  joined_at = '2025-11-10T14:30:00Z'
WHERE id = '00000000-0000-0000-0000-000000000002';

UPDATE public.profiles SET
  avatar_url = 'https://i.pravatar.cc/150?u=james.obrien',
  bio = 'Head chef at a local Italian restaurant with a love for sharing recipes. Recently got into food photography and want to level up.',
  is_verified_neighbour = TRUE,
  joined_at = '2025-11-15T11:00:00Z'
WHERE id = '00000000-0000-0000-0000-000000000003';

UPDATE public.profiles SET
  avatar_url = 'https://i.pravatar.cc/150?u=priya.patel',
  bio = 'Certified yoga instructor specialising in Vinyasa and mindfulness. Trying to build an online presence and need help with web design.',
  is_verified_neighbour = FALSE,
  joined_at = '2025-12-01T08:15:00Z'
WHERE id = '00000000-0000-0000-0000-000000000004';

UPDATE public.profiles SET
  avatar_url = 'https://i.pravatar.cc/150?u=tom.williams',
  bio = 'Carpenter with 20 years of experience in furniture restoration. Planning a trip to Barcelona and want to brush up on my Spanish.',
  is_verified_neighbour = TRUE,
  joined_at = '2025-12-05T16:45:00Z'
WHERE id = '00000000-0000-0000-0000-000000000005';

UPDATE public.profiles SET
  avatar_url = 'https://i.pravatar.cc/150?u=lena.fischer',
  bio = 'Born in Berlin, fluent in German and Spanish. I love helping people unlock new languages and want to get fitter this year.',
  is_verified_neighbour = FALSE,
  joined_at = '2025-12-10T10:00:00Z'
WHERE id = '00000000-0000-0000-0000-000000000006';

UPDATE public.profiles SET
  avatar_url = 'https://i.pravatar.cc/150?u=david.kim',
  bio = 'Professional photographer with a studio in Bramley. Just moved into a place with a garden and have no idea where to start.',
  is_verified_neighbour = TRUE,
  joined_at = '2025-12-15T13:20:00Z'
WHERE id = '00000000-0000-0000-0000-000000000007';

UPDATE public.profiles SET
  avatar_url = 'https://i.pravatar.cc/150?u=sarah.johnson',
  bio = 'Allotment enthusiast and community garden organiser. Keen to learn programming so I can build an app for our gardening co-op.',
  is_verified_neighbour = TRUE,
  joined_at = '2025-12-20T09:30:00Z'
WHERE id = '00000000-0000-0000-0000-000000000008';

-- ============================================
-- 3. SKILL LISTINGS
-- ============================================

INSERT INTO public.skill_listings (id, user_id, title, description, category, level, listing_type, availability, is_remote, is_in_person, tags, created_at, updated_at) VALUES
  -- Alex Chen: offers web dev, wants guitar
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Intro to Web Development',
    'Learn the fundamentals of building websites with HTML, CSS, and JavaScript. I can take you from zero to deploying your first site, covering responsive design and modern best practices along the way.',
    'technology', 'advanced', 'offered',
    'Weekday evenings and Saturday mornings',
    TRUE, TRUE,
    ARRAY['html', 'css', 'javascript', 'web design', 'beginners welcome'],
    '2025-12-01T10:30:00Z', '2025-12-15T08:00:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Learn Acoustic Guitar',
    'Complete beginner looking to learn acoustic guitar. I would love to be able to play some folk and indie songs. Happy to practise regularly between sessions.',
    'music', 'beginner', 'wanted',
    'Flexible on weekends',
    FALSE, TRUE,
    ARRAY['acoustic guitar', 'folk', 'indie', 'beginner'],
    '2025-12-02T14:00:00Z', '2025-12-02T14:00:00Z'
  ),

  -- Maria Santos: offers flamenco guitar, wants cooking
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'Flamenco Guitar Lessons',
    'Offering flamenco and classical guitar lessons for all levels. I have been playing for over 15 years and performing professionally for the last 8. We will cover technique, rhythm, and musicality.',
    'music', 'expert', 'offered',
    'Tuesday and Thursday evenings, all day Sunday',
    FALSE, TRUE,
    ARRAY['flamenco', 'classical guitar', 'music theory', 'performance'],
    '2025-12-05T09:15:00Z', '2025-12-20T11:30:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Mediterranean Cooking',
    'Looking to learn authentic Mediterranean and Spanish cooking. I grew up with basic home cooking but want to expand my repertoire with proper techniques and regional dishes.',
    'cooking', 'beginner', 'wanted',
    'Weekend afternoons',
    FALSE, TRUE,
    ARRAY['mediterranean', 'spanish cuisine', 'cooking basics', 'recipes'],
    '2025-12-06T16:45:00Z', '2025-12-06T16:45:00Z'
  ),

  -- James O'Brien: offers cooking, wants photography
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000003',
    'Italian Cooking Masterclass',
    'Professional chef offering hands-on Italian cooking sessions. Learn to make fresh pasta from scratch, perfect risotto, and classic sauces. I bring 12 years of restaurant experience to every lesson.',
    'cooking', 'expert', 'offered',
    'Monday and Wednesday mornings, Saturday afternoons',
    FALSE, TRUE,
    ARRAY['italian', 'pasta', 'risotto', 'sauces', 'professional techniques'],
    '2025-12-08T12:00:00Z', '2025-12-28T09:00:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000003',
    'Portrait Photography',
    'I want to learn portrait photography to better photograph my dishes and eventually do lifestyle photography. I have a decent camera but do not know how to use it beyond auto mode.',
    'photography', 'beginner', 'wanted',
    'Weekday mornings before work',
    TRUE, TRUE,
    ARRAY['portrait', 'food photography', 'camera basics', 'lighting'],
    '2025-12-09T08:30:00Z', '2025-12-09T08:30:00Z'
  ),

  -- Priya Patel: offers yoga, wants web dev
  (
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000004',
    'Yoga & Meditation Basics',
    'Offering gentle Vinyasa yoga and guided meditation sessions suitable for all fitness levels. Focus on building flexibility, core strength, and mental clarity. I tailor each session to your personal goals.',
    'fitness', 'advanced', 'offered',
    'Early mornings (6-8am) and weekend afternoons',
    TRUE, TRUE,
    ARRAY['yoga', 'vinyasa', 'meditation', 'flexibility', 'mindfulness'],
    '2025-12-12T07:00:00Z', '2026-01-05T07:00:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000004',
    'WordPress Website Setup',
    'I need help setting up a professional-looking WordPress site for my yoga studio. Want to learn how to manage it myself going forward, including booking integrations and a blog.',
    'technology', 'beginner', 'wanted',
    'Flexible, prefer weekday afternoons',
    TRUE, FALSE,
    ARRAY['wordpress', 'web design', 'small business', 'booking system'],
    '2025-12-13T15:30:00Z', '2025-12-13T15:30:00Z'
  ),

  -- Tom Williams: offers furniture repair, wants Spanish
  (
    '10000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000005',
    'Furniture Repair & Upcycling',
    'I can teach you how to repair, restore, and upcycle furniture. From fixing wobbly chairs to stripping and refinishing vintage pieces. I have a fully equipped workshop we can use for sessions.',
    'diy-repairs', 'advanced', 'offered',
    'Saturday mornings and weekday evenings after 6pm',
    FALSE, TRUE,
    ARRAY['furniture', 'woodwork', 'upcycling', 'restoration', 'tools'],
    '2025-12-15T18:00:00Z', '2026-01-08T18:00:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000005',
    'Conversational Spanish',
    'Planning a trip to Spain and want to learn enough Spanish to hold basic conversations. Looking for someone patient who can help me with practical phrases and pronunciation.',
    'languages', 'beginner', 'wanted',
    'Tuesday and Thursday evenings',
    TRUE, TRUE,
    ARRAY['spanish', 'conversational', 'travel', 'pronunciation'],
    '2025-12-16T10:00:00Z', '2025-12-16T10:00:00Z'
  ),

  -- Lena Fischer: offers German + Spanish, wants fitness
  (
    '10000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000006',
    'German Language Tutoring',
    'Native German speaker offering structured lessons from beginner to advanced. I use a conversational approach mixed with grammar fundamentals so you can start speaking from day one.',
    'languages', 'advanced', 'offered',
    'Monday, Wednesday, and Friday evenings',
    TRUE, TRUE,
    ARRAY['german', 'native speaker', 'grammar', 'conversational'],
    '2025-12-18T11:00:00Z', '2026-01-10T11:00:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000006',
    'Beginner Spanish Lessons',
    'Offering introductory Spanish lessons with a focus on everyday conversation and travel phrases. I lived in Madrid for three years and can help you build confidence speaking quickly.',
    'languages', 'intermediate', 'offered',
    'Weekend mornings',
    TRUE, TRUE,
    ARRAY['spanish', 'beginner friendly', 'travel', 'conversation'],
    '2025-12-19T14:30:00Z', '2026-01-12T14:30:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000006',
    'Personal Fitness Training',
    'Looking for someone who can put together a personalised fitness plan and keep me accountable. Open to strength training, cardio, or a mix. Complete gym beginner here.',
    'fitness', 'beginner', 'wanted',
    'Weekday mornings before 9am',
    TRUE, TRUE,
    ARRAY['fitness', 'strength training', 'accountability', 'beginner'],
    '2025-12-20T09:00:00Z', '2025-12-20T09:00:00Z'
  ),

  -- David Kim: offers photography, wants gardening
  (
    '10000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000007',
    'Photography Fundamentals',
    'Professional photographer offering lessons on composition, lighting, and camera settings. Whether you shoot on a DSLR or your phone, I can help you take dramatically better photos.',
    'photography', 'expert', 'offered',
    'Weekends and Wednesday afternoons',
    TRUE, TRUE,
    ARRAY['photography', 'composition', 'lighting', 'DSLR', 'phone photography'],
    '2025-12-22T13:00:00Z', '2026-01-15T10:00:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000007',
    'Vegetable Garden Setup',
    'Just moved into a flat with a neglected back garden and I want to turn it into a productive vegetable patch. Need help with everything from soil prep to choosing what to plant for the season.',
    'gardening', 'beginner', 'wanted',
    'Weekend afternoons',
    FALSE, TRUE,
    ARRAY['vegetable garden', 'raised beds', 'seasonal planting', 'soil'],
    '2025-12-23T10:45:00Z', '2025-12-23T10:45:00Z'
  ),

  -- Sarah Johnson: offers gardening, wants Python
  (
    '10000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000008',
    'Organic Gardening Guide',
    'I have been running a community allotment for 6 years and can teach you everything about organic vegetable gardening. From composting and soil health to pest control and succession planting.',
    'gardening', 'advanced', 'offered',
    'Saturday and Sunday mornings, Thursday afternoons',
    FALSE, TRUE,
    ARRAY['organic', 'composting', 'vegetables', 'allotment', 'pest control'],
    '2025-12-25T08:00:00Z', '2026-01-18T08:00:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-000000000008',
    'Python Programming Basics',
    'Complete coding novice looking to learn Python from scratch. My goal is to build a simple web app for our community garden group to coordinate volunteer schedules.',
    'technology', 'beginner', 'wanted',
    'Weekday evenings after 7pm',
    TRUE, TRUE,
    ARRAY['python', 'programming', 'beginner', 'web app'],
    '2025-12-26T19:00:00Z', '2025-12-26T19:00:00Z'
  ),

  -- Alex Chen: also offers React mentoring
  (
    '10000000-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-000000000001',
    'React & TypeScript Mentoring',
    'Offering mentoring in React and TypeScript for developers who already know the basics. We can work through real projects together covering hooks, state management, and component architecture.',
    'technology', 'expert', 'offered',
    'Wednesday and Friday evenings',
    TRUE, TRUE,
    ARRAY['react', 'typescript', 'frontend', 'mentoring', 'state management'],
    '2025-12-28T20:00:00Z', '2026-01-20T15:00:00Z'
  );

-- ============================================
-- 4. CONVERSATIONS (without swap_id initially)
-- ============================================

INSERT INTO public.conversations (id, participant_ids, created_at, last_message_at, last_message_preview) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    ARRAY['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002']::UUID[],
    '2025-12-10T18:00:00Z',
    '2026-01-20T17:00:00Z',
    'Thanks for everything, Alex! Really enjoyed our swap.'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    ARRAY['00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001']::UUID[],
    '2026-01-05T10:00:00Z',
    '2026-01-28T09:15:00Z',
    'See you Wednesday at 6pm then!'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    ARRAY['00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001']::UUID[],
    '2026-01-25T14:30:00Z',
    '2026-01-25T14:30:00Z',
    'Hello Alex! I run a community allotment in Rawmarsh and I am keen to learn some web development...'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    ARRAY['00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002']::UUID[],
    '2026-01-08T12:00:00Z',
    '2026-01-27T18:30:00Z',
    'Bring your guitar, I will have the carbonara ingredients ready!'
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    ARRAY['00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006']::UUID[],
    '2026-01-12T16:00:00Z',
    '2026-01-13T11:20:00Z',
    'No worries at all, good luck with the trip! Maybe another time.'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    ARRAY['00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008']::UUID[],
    '2025-12-28T11:00:00Z',
    '2026-01-22T16:30:00Z',
    'The tomato seedlings are coming along brilliantly!'
  );

-- ============================================
-- 5. SWAP PROPOSALS
-- ============================================

INSERT INTO public.swap_proposals (id, proposer_id, recipient_id, offered_skill_id, requested_skill_id, message, status, proposed_at, responded_at, completed_at, conversation_id, proposer_completed, recipient_completed) VALUES
  -- swap-1: Alex <-> Maria (completed: web dev for guitar)
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'Hi Maria! I saw your flamenco guitar listing and I would love to learn. I can offer web development lessons in return - could be handy for building a music portfolio site. Fancy a swap?',
    'completed',
    '2025-12-10T18:00:00Z',
    '2025-12-11T09:30:00Z',
    '2026-01-20T17:00:00Z',
    '20000000-0000-0000-0000-000000000001',
    TRUE, TRUE
  ),
  -- swap-2: Priya <-> Alex (accepted: yoga for React mentoring)
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000018',
    'Hey Alex, I noticed you offer React mentoring. I am trying to build a website for my yoga studio and would love some guidance. I can offer yoga and meditation sessions in return if you are interested!',
    'accepted',
    '2026-01-05T10:00:00Z',
    '2026-01-06T08:15:00Z',
    NULL,
    '20000000-0000-0000-0000-000000000002',
    FALSE, FALSE
  ),
  -- swap-3: Sarah <-> Alex (pending: gardening for web dev)
  (
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000016',
    '10000000-0000-0000-0000-000000000001',
    'Hello Alex! I run a community allotment in Rawmarsh and I am keen to learn some web development to build a volunteer coordination tool. Could teach you organic gardening in exchange - great stress relief from coding!',
    'pending',
    '2026-01-25T14:30:00Z',
    NULL,
    NULL,
    '20000000-0000-0000-0000-000000000003',
    FALSE, FALSE
  ),
  -- swap-4: James <-> Maria (in_progress: cooking for guitar)
  (
    '30000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000003',
    'Hi Maria, fellow local here! I am a chef and can teach you authentic Italian cooking. Would love to learn guitar in return - always wanted to play at the restaurant on quiet evenings.',
    'in_progress',
    '2026-01-08T12:00:00Z',
    '2026-01-09T10:45:00Z',
    NULL,
    '20000000-0000-0000-0000-000000000004',
    FALSE, FALSE
  ),
  -- swap-5: Tom <-> Lena (declined: furniture for Spanish)
  (
    '30000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000009',
    '10000000-0000-0000-0000-000000000012',
    'Hi Lena, I saw you teach Spanish and I am heading to Barcelona this spring. I am a carpenter and could teach you furniture repair in return. What do you think?',
    'declined',
    '2026-01-12T16:00:00Z',
    '2026-01-13T11:20:00Z',
    NULL,
    '20000000-0000-0000-0000-000000000005',
    FALSE, FALSE
  ),
  -- swap-6: David <-> Sarah (completed: photography for gardening)
  (
    '30000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    '10000000-0000-0000-0000-000000000014',
    '10000000-0000-0000-0000-000000000016',
    'Hi Sarah! Just moved to Bramley and my garden is a disaster. I am a professional photographer and can teach you everything about composition and lighting. Would love gardening help in return!',
    'completed',
    '2025-12-28T11:00:00Z',
    '2025-12-29T08:00:00Z',
    '2026-01-22T16:30:00Z',
    '20000000-0000-0000-0000-000000000006',
    TRUE, TRUE
  );

-- ============================================
-- 6. UPDATE CONVERSATIONS WITH SWAP IDS
-- ============================================

UPDATE public.conversations SET swap_id = '30000000-0000-0000-0000-000000000001' WHERE id = '20000000-0000-0000-0000-000000000001';
UPDATE public.conversations SET swap_id = '30000000-0000-0000-0000-000000000002' WHERE id = '20000000-0000-0000-0000-000000000002';
UPDATE public.conversations SET swap_id = '30000000-0000-0000-0000-000000000003' WHERE id = '20000000-0000-0000-0000-000000000003';
UPDATE public.conversations SET swap_id = '30000000-0000-0000-0000-000000000004' WHERE id = '20000000-0000-0000-0000-000000000004';
UPDATE public.conversations SET swap_id = '30000000-0000-0000-0000-000000000005' WHERE id = '20000000-0000-0000-0000-000000000005';
UPDATE public.conversations SET swap_id = '30000000-0000-0000-0000-000000000006' WHERE id = '20000000-0000-0000-0000-000000000006';

-- ============================================
-- 7. MESSAGES
-- ============================================

-- Disable the conversation update trigger temporarily to avoid overwriting
-- the manually set last_message_at / last_message_preview values
ALTER TABLE public.messages DISABLE TRIGGER messages_update_conversation;

INSERT INTO public.messages (id, conversation_id, sender_id, content, sent_at, is_read) VALUES
  -- conv-1: Alex <-> Maria (completed swap - web dev for guitar)
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Hi Maria! I saw your flamenco guitar listing and I would love to learn. I can offer web development lessons in return - could be handy for building a music portfolio site. Fancy a swap?',
    '2025-12-10T18:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Hi Alex! That sounds like a great trade. I have been meaning to get a proper website set up for ages. When works for you?',
    '2025-12-11T09:30:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Brilliant! How about we alternate Saturdays? I can do mornings for the web dev session, then we switch to guitar in the afternoon?',
    '2025-12-11T12:15:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Perfect. Shall we start this Saturday? There is a nice cafe on the high street we could meet at first to plan things out.',
    '2025-12-11T14:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Sounds great! I will bring my laptop and some notes on getting started with HTML and CSS. Do I need to get my own guitar or do you have a spare?',
    '2025-12-11T14:30:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'I have a spare classical guitar you can borrow until you get your own. See you Saturday at 10am!',
    '2025-12-11T15:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Just finished our last session and wanted to say a massive thank you. My chord transitions are so much smoother now. Your website is looking great too!',
    '2026-01-20T16:30:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Thanks for everything, Alex! Really enjoyed our swap. The website is exactly what I needed. Let me know if you ever want to do more sessions.',
    '2026-01-20T17:00:00Z', TRUE
  ),

  -- conv-2: Priya <-> Alex (accepted swap - yoga for React mentoring)
  (
    '40000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'Hey Alex, I noticed you offer React mentoring. I am trying to build a website for my yoga studio and would love some guidance. I can offer yoga and meditation sessions in return if you are interested!',
    '2026-01-05T10:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Hi Priya! I have actually been wanting to try yoga for a while. React might be a bit much if you are starting from scratch though - shall we start with the basics and work up to it?',
    '2026-01-06T08:15:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000011',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'That sounds sensible. I did a tiny bit of HTML years ago so I am not completely new. And yes, we can start with gentle Vinyasa for you - it is great for people who sit at desks all day!',
    '2026-01-06T10:30:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000012',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Ha, you can tell? My back will thank you. How about Wednesday evenings? We could do an hour of coding then an hour of yoga.',
    '2026-01-06T11:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000013',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'Wednesday works perfectly. I have a quiet room at the community centre in Bramley we could use for the yoga portion. For coding, anywhere with wifi is fine for me.',
    '2026-01-06T14:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000014',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'See you Wednesday at 6pm then!',
    '2026-01-28T09:15:00Z', TRUE
  ),

  -- conv-3: Sarah <-> Alex (pending swap - gardening for web dev)
  (
    '40000000-0000-0000-0000-000000000015',
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000008',
    'Hello Alex! I run a community allotment in Rawmarsh and I am keen to learn some web development to build a volunteer coordination tool. Could teach you organic gardening in exchange - great stress relief from coding!',
    '2026-01-25T14:30:00Z', FALSE
  ),

  -- conv-4: James <-> Maria (in_progress swap - cooking for guitar)
  (
    '40000000-0000-0000-0000-000000000016',
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'Hi Maria, fellow local here! I am a chef and can teach you authentic Italian cooking. Would love to learn guitar in return - always wanted to play at the restaurant on quiet evenings.',
    '2026-01-08T12:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000017',
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Hi James! I have been to your restaurant actually, the pasta is incredible. I would love cooking lessons from you. Guitar in a restaurant sounds so charming - let us make it happen!',
    '2026-01-09T10:45:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000018',
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'That is so kind, thank you! We could use the restaurant kitchen on Monday mornings when we are closed. For guitar, I am free whenever works for you.',
    '2026-01-09T13:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000019',
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Monday mornings are perfect. Guitar on Thursday evenings? We just had our first cooking session and I am still buzzing. That carbonara technique was a revelation.',
    '2026-01-15T20:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000020',
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'You are a natural! And I actually managed a full G chord today without buzzing. Slow progress but I love it.',
    '2026-01-20T19:30:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000021',
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Bring your guitar, I will have the carbonara ingredients ready!',
    '2026-01-27T18:30:00Z', TRUE
  ),

  -- conv-5: Tom <-> Lena (declined swap - furniture for Spanish)
  (
    '40000000-0000-0000-0000-000000000022',
    '20000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    'Hi Lena, I saw you teach Spanish and I am heading to Barcelona this spring. I am a carpenter and could teach you furniture repair in return. What do you think?',
    '2026-01-12T16:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000023',
    '20000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006',
    'Hi Tom! That is a lovely offer but I am a bit swamped with my current swaps right now. My schedule is really full until March at the earliest. Sorry about that!',
    '2026-01-13T11:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000024',
    '20000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    'No worries at all, good luck with the trip! Maybe another time.',
    '2026-01-13T11:20:00Z', TRUE
  ),

  -- conv-6: David <-> Sarah (completed swap - photography for gardening)
  (
    '40000000-0000-0000-0000-000000000025',
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    'Hi Sarah! Just moved to Bramley and my garden is a disaster. I am a professional photographer and can teach you everything about composition and lighting. Would love gardening help in return!',
    '2025-12-28T11:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000026',
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000008',
    'David, that sounds wonderful! I have been wanting to take better photos of the allotment for our community newsletter. When can we start?',
    '2025-12-29T08:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000027',
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    'How about this weekend? You could come see the state of my garden and we could do a quick photography walk around the neighbourhood to start.',
    '2025-12-29T10:30:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000028',
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000008',
    'Saturday afternoon works for me. I will bring some seed catalogues so we can plan what to plant based on your garden conditions.',
    '2025-12-29T12:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000029',
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    'Had such a great time today. Cannot believe the difference just understanding the rule of thirds makes. And you have given me real hope for the garden!',
    '2026-01-04T17:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000030',
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000008',
    'Your photos of the allotment were stunning, everyone in the group loved them. Your raised beds are coming together nicely too - just remember to water the garlic!',
    '2026-01-15T09:00:00Z', TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000031',
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    'The tomato seedlings are coming along brilliantly! Thanks again for all the gardening wisdom. The photography sessions were so rewarding for me too.',
    '2026-01-22T16:30:00Z', TRUE
  );

-- Re-enable the trigger
ALTER TABLE public.messages ENABLE TRIGGER messages_update_conversation;

-- ============================================
-- 8. REVIEWS
-- ============================================

INSERT INTO public.reviews (id, swap_id, reviewer_id, reviewee_id, rating, comment, skill_category, created_at) VALUES
  -- swap-1 reviews: Alex <-> Maria (web dev for guitar)
  (
    '50000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    5,
    'Maria is an incredible guitar teacher. She broke down flamenco techniques into manageable steps and was so patient with my clumsy fingers. I can now play three full songs confidently. Highly recommend!',
    'music',
    '2026-01-21T10:00:00Z'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    5,
    'Alex made web development feel approachable and fun. He explained everything clearly and helped me build a portfolio site I am genuinely proud of. Could not have asked for a better swap partner.',
    'technology',
    '2026-01-21T11:30:00Z'
  ),

  -- swap-6 reviews: David <-> Sarah (photography for gardening)
  (
    '50000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    5,
    'Sarah is a gardening encyclopaedia! She helped me plan my entire garden from scratch, from building raised beds to choosing the right crops for the season. My garden has gone from a wasteland to something I am actually proud of.',
    'gardening',
    '2026-01-23T09:00:00Z'
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000007',
    4,
    'David is a brilliant photographer and a patient teacher. My allotment photos have gone from blurry phone snaps to images our community group actually uses in their newsletter. Only giving 4 stars because I wanted more sessions!',
    'photography',
    '2026-01-23T14:00:00Z'
  );
