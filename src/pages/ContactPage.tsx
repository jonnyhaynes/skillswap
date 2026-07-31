import { Link } from 'react-router'
import { ContactForm } from '@/components/contact/ContactForm'
import { useSeo } from '@/hooks/useSeo'
import { breadcrumbSchema, graph } from '@/lib/structuredData'

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

const INFO_ITEMS = [
  {
    icon: ClockIcon,
    title: 'Quick response',
    description: 'We aim to reply within 48 hours.',
  },
  {
    icon: ChatIcon,
    title: 'Friendly support',
    description: 'Questions, feedback, or ideas are all welcome.',
  },
  {
    icon: ShieldIcon,
    title: 'Privacy respected',
    description: 'Your details are only used to respond to your enquiry.',
  },
]

export function ContactPage() {
  useSeo({
    title: 'Contact Us',
    description:
      'Get in touch with the SkillSwap team — questions about swaps, account help, safety concerns, press and partnership enquiries.',
    canonical: '/contact',
    jsonLd: graph(
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' },
      ])
    ),
  })

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
          Get in Touch
        </h1>
        <p className="mt-3 text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
          Have a question, suggestion, or need to report something? We'd love to hear from you.
        </p>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-5 order-2 lg:order-1">
            {INFO_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 text-primary-600">
                    <Icon />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Form card */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm ring-1 ring-black/[0.02]">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-12 text-center">
        <Link to="/" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
          &larr; Back to home
        </Link>
      </div>
    </div>
  )
}
