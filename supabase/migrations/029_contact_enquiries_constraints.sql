-- Add length CHECK constraints to contact_enquiries.
--
-- The table previously had no constraints beyond NOT NULL, allowing
-- arbitrarily long payloads that could be used to exhaust storage or
-- as a vector for large-payload denial-of-service.

ALTER TABLE contact_enquiries
  ADD CONSTRAINT contact_enquiries_name_length
    CHECK (length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT contact_enquiries_email_length
    CHECK (length(email) BETWEEN 5 AND 254),
  ADD CONSTRAINT contact_enquiries_subject_length
    CHECK (length(subject) BETWEEN 1 AND 200),
  ADD CONSTRAINT contact_enquiries_message_length
    CHECK (length(message) BETWEEN 1 AND 5000);
