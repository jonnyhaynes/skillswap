import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChangeEmailForm from '../ChangeEmailForm'

const mockUpdateEmail = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    updateEmail: mockUpdateEmail,
    session: {
      user: {
        email: 'current@example.com',
        app_metadata: { provider: 'email' },
      },
    },
  }),
}))

describe('ChangeEmailForm', () => {
  beforeEach(() => {
    mockUpdateEmail.mockReset()
  })

  it('renders collapsed by default — shows email and Change button', () => {
    render(<ChangeEmailForm />)
    expect(screen.getByText('current@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/new email/i)).not.toBeInTheDocument()
  })

  it('expands form when Change is clicked', () => {
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/new email/i)).toBeInTheDocument()
  })

  it('collapses form when Cancel is clicked', () => {
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText(/new email/i)).not.toBeInTheDocument()
  })

  it('shows validation error when new email matches current email', async () => {
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/new email/i), {
      target: { value: 'current@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'mypassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent("That's already your email address")
    })
    expect(mockUpdateEmail).not.toHaveBeenCalled()
  })

  it('calls updateEmail and shows success banner on success', async () => {
    mockUpdateEmail.mockResolvedValue({})
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'mypassword' },
    })
    fireEvent.change(screen.getByLabelText(/new email/i), {
      target: { value: 'new@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Confirmation email sent')
      expect(screen.getByRole('status')).toHaveTextContent('new@example.com')
    })
    expect(mockUpdateEmail).toHaveBeenCalledWith('mypassword', 'new@example.com')
  })

  it('shows error message when updateEmail returns an error', async () => {
    mockUpdateEmail.mockResolvedValue({ error: 'Incorrect password. Please try again.' })
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.change(screen.getByLabelText(/new email/i), {
      target: { value: 'new@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password')
    })
  })
})
