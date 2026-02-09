-- Contact enquiries table for public contact form submissions

CREATE TABLE contact_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous or authenticated) can submit a contact enquiry
CREATE POLICY "Anyone can submit contact enquiries"
  ON contact_enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
