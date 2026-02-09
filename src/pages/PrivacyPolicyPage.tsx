import { Link } from 'react-router'

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: February 2026</p>
      </div>

      <div className="prose-container space-y-8">
        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Information We Collect</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            When you create an account on SkillSwap, we collect information you provide directly, including:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600 list-disc list-inside">
            <li>Name and email address</li>
            <li>Profile information such as your bio, skills, and profile photo</li>
            <li>Location data (postcode or area) to connect you with nearby users</li>
            <li>Messages exchanged with other users through the platform</li>
            <li>Reviews and ratings you leave for other users</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">2. How We Use Your Information</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600 list-disc list-inside">
            <li>Provide, maintain, and improve the SkillSwap platform</li>
            <li>Connect you with other users based on skills and location</li>
            <li>Facilitate communication between users</li>
            <li>Send you relevant notifications about swap requests and messages</li>
            <li>Ensure the safety and security of the platform</li>
            <li>Analyse usage patterns to improve the user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Information Sharing</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            We do not sell your personal information to third parties. Your profile information (name, skills, general location, and bio) is visible to other SkillSwap users. We may share information in the following limited circumstances:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600 list-disc list-inside">
            <li>With your consent or at your direction</li>
            <li>To comply with legal obligations or respond to lawful requests</li>
            <li>To protect the rights, safety, or property of SkillSwap, our users, or the public</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">4. Data Storage and Security</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            We take reasonable measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption and security practices. However, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">5. Your Rights</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            You have the right to:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600 list-disc list-inside">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your account and associated data</li>
            <li>Object to or restrict the processing of your personal data</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            To exercise any of these rights, please contact us through the platform or update your profile settings directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">6. Cookies and Tracking</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            SkillSwap uses essential cookies to maintain your session and remember your preferences. We do not use third-party tracking cookies or advertising networks. Analytics data is collected in an anonymised and aggregated form to help us understand how the platform is used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">7. Children's Privacy</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            SkillSwap is not intended for use by children under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 16, we will take steps to delete that information promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">8. Changes to This Policy</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting a notice on the platform. Your continued use of SkillSwap after changes are posted constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">9. Contact</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            If you have any questions about this Privacy Policy or how we handle your data, please contact us through the platform.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-200">
          <Link to="/" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
