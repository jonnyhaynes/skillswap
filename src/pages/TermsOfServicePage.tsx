import { Link } from 'react-router'
import { useSeo } from '@/hooks/useSeo'

export function TermsOfServicePage() {
  useSeo({
    title: 'Terms of Service',
    description:
      'The terms that govern your use of SkillSwap — member conduct, listings, swaps, liability and account termination.',
    canonical: '/terms',
  })

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: February 2026</p>
      </div>

      <div className="prose-container space-y-8">
        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Acceptance of Terms</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            By accessing or using SkillSwap, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">2. Description of Service</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            SkillSwap is a community platform that connects people who want to exchange skills and knowledge with their neighbours. The platform facilitates the discovery of skill-sharing opportunities and communication between users but does not guarantee the quality, safety, or legality of skills offered or exchanged.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">3. User Accounts</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            To use certain features of SkillSwap, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">4. User Conduct</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            You agree not to use SkillSwap to:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600 list-disc list-inside">
            <li>Post false, misleading, or fraudulent content</li>
            <li>Harass, abuse, or harm another person</li>
            <li>Solicit money or commercial services outside the spirit of skill exchange</li>
            <li>Impersonate any person or entity</li>
            <li>Violate any applicable local, national, or international law</li>
            <li>Collect or store personal data about other users without their consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">5. Skill Exchanges</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            SkillSwap facilitates connections between users but is not a party to any skill exchange arrangement. All exchanges are conducted at the users' own risk. We encourage users to meet in public places and to exercise caution when arranging in-person meetings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">6. Content</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            You retain ownership of any content you post on SkillSwap. By posting content, you grant SkillSwap a non-exclusive, worldwide, royalty-free licence to use, display, and distribute your content in connection with the platform. You are solely responsible for the content you post and must ensure it does not infringe on any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">7. Limitation of Liability</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            SkillSwap is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the platform's reliability, availability, or fitness for a particular purpose. In no event shall SkillSwap be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">8. Termination</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            We reserve the right to suspend or terminate your account at any time, with or without cause, and with or without notice. Upon termination, your right to use the platform will immediately cease.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">9. Changes to Terms</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            We reserve the right to modify these terms at any time. We will notify users of significant changes by posting a notice on the platform. Your continued use of SkillSwap after changes are posted constitutes your acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 font-display">10. Contact</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            If you have any questions about these Terms of Service, please contact us through the platform.
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
