import { supabase } from '@/lib/supabase'

export class ContactServiceError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ContactServiceError'
    this.code = code
  }
}

export async function submitContactEnquiry(data: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  const { error } = await supabase
    .from('contact_enquiries')
    .insert({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    })

  if (error) {
    throw new ContactServiceError(
      error.message || 'Failed to submit contact enquiry',
      error.code,
    )
  }
}
