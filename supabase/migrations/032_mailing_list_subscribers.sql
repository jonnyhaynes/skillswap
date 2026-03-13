-- Mailing list subscribers table for footer sign-up form

CREATE TABLE mailing_list_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT mailing_list_subscribers_email_unique UNIQUE (email)
);

ALTER TABLE mailing_list_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous or authenticated) can subscribe
CREATE POLICY "Anyone can subscribe to mailing list"
  ON mailing_list_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT for anon — only service role can read the list
