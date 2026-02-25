import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import DeleteAccountFlow from '../components/account/DeleteAccountFlow'
import ChangeEmailForm from '../components/account/ChangeEmailForm'
import ChangePasswordForm from '../components/account/ChangePasswordForm'

export function AccountSettingsPage() {
  const { currentUser, session } = useAuth()

  const isOAuthUser = session?.user?.app_metadata?.provider !== 'email'
  const oauthProvider = session?.user?.app_metadata?.provider

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/profile/edit"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to profile
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Account settings</h1>

      {/* Account information */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account information</h2>
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-gray-500">Member since</span>
            <span className="text-sm text-gray-900">
              {currentUser?.joinedAt
                ? new Date(currentUser.joinedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Security</h2>
        {isOAuthUser ? (
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-sm text-gray-500">
              Your login credentials are managed by{' '}
              {oauthProvider === 'google' ? 'Google' : 'Apple'}.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            <ChangeEmailForm />
            <ChangePasswordForm />
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="text-lg font-semibold text-red-700 mb-4">Danger zone</h2>
        <div className="border border-red-200 rounded-lg p-6">
          <DeleteAccountFlow />
        </div>
      </section>
    </div>
  )
}
