import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChangePasswordForm from '../ChangePasswordForm'

const mockUpdatePassword = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    updatePassword: mockUpdatePassword,
  }),
}))

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    mockUpdatePassword.mockReset()
  })

  it('renders collapsed by default — shows password row and Change button', () => {
    render(<ChangePasswordForm />)
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument()
  })

  it('expands when Change is clicked', () => {
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
  })

  it('collapses when Cancel is clicked', () => {
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument()
  })

  it('shows error when new password is too short', async () => {
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'current123' },
    })
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'short' },
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'short' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('at least 8 characters')
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it('shows error when passwords do not match', async () => {
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'current123' },
    })
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newpassword1' },
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpassword2' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('do not match')
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it('calls updatePassword and shows success banner on success', async () => {
    mockUpdatePassword.mockResolvedValue({})
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'current123' },
    })
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newpassword123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpassword123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Password updated successfully')
    })
    expect(mockUpdatePassword).toHaveBeenCalledWith('current123', 'newpassword123')
  })

  it('shows error message when updatePassword returns an error', async () => {
    mockUpdatePassword.mockResolvedValue({ error: 'Incorrect password. Please try again.' })
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newpassword123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpassword123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password')
    })
  })
})
