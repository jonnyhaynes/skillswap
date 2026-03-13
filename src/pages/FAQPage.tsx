import { Link } from 'react-router'

const FAQ_SECTIONS = [
  {
    heading: 'Getting Started',
    items: [
      {
        q: 'What is SkillSwap?',
        a: 'SkillSwap is a free community platform that connects neighbours who want to exchange skills and knowledge. Instead of paying for lessons or services, you swap what you know — teach guitar, learn web design; share a recipe, pick up some woodworking. It\'s neighbourly, practical, and completely free to join.',
      },
      {
        q: 'Who can join SkillSwap?',
        a: 'Anyone is welcome. You don\'t need to be an expert — if you can bake a decent loaf of bread or know your way around a spreadsheet, you have something worth sharing. The platform is for people of all ages and backgrounds.',
      },
      {
        q: 'Is SkillSwap free to use?',
        a: 'Yes, completely. There are no subscription fees, no transaction charges, and no hidden costs. The whole idea is a direct skill-for-skill exchange between neighbours.',
      },
      {
        q: 'Do I need to be local to other members?',
        a: 'The platform is designed around local communities, so most swaps work best when you\'re nearby. That said, some skills — like language practice, coding help, or tutoring — can be swapped remotely over video call.',
      },
    ],
  },
  {
    heading: 'Listings & Skills',
    items: [
      {
        q: 'How do I post a skill listing?',
        a: 'Once you\'ve created an account, head to "Post a Skill" from the navigation menu. Choose whether you\'re offering a skill or looking for one, pick a category, write a short description, and you\'re done. Your listing will appear in the browse directory immediately.',
      },
      {
        q: 'Can I post both skills I\'m offering and skills I\'m looking for?',
        a: 'Absolutely. You can create as many listings as you like — both "I\'m offering" and "I\'m looking for" types. Having a wanted listing makes it easy for others to find you if they have a matching skill.',
      },
      {
        q: 'What kinds of skills can I list?',
        a: 'Almost anything! Popular categories include cooking & food, music, languages, technology, gardening, arts & crafts, fitness, and home & DIY. If you\'re unsure, have a look at what others have posted — you might be surprised what\'s out there.',
      },
      {
        q: 'Can I edit or remove a listing?',
        a: 'Yes. Go to "My Listings" in your account and you can edit the details or delete any listing at any time.',
      },
    ],
  },
  {
    heading: 'The Swap Process',
    items: [
      {
        q: 'How does a swap actually work?',
        a: 'Find a listing that interests you and send a message to the person. Once you\'ve agreed on what you\'ll each teach and when, a swap is created. After both sessions are done you can leave each other a review. The whole thing is flexible — you decide the details between yourselves.',
      },
      {
        q: 'Does every swap have to be perfectly equal?',
        a: 'Not at all. You might swap one guitar lesson for two hours of garden help, or agree to do a few sessions each way. It\'s entirely up to you and the other person. The platform records the swap and lets you both confirm it\'s complete.',
      },
      {
        q: 'What if a swap doesn\'t go as planned?',
        a: 'If something comes up — a cancellation, a misunderstanding, or a disagreement — try to resolve it directly with the other person first. If things escalate, you can report the issue through the platform and we\'ll look into it.',
      },
      {
        q: 'Can I swap with the same person more than once?',
        a: 'Of course. If you get on well with someone and enjoy the exchange, there\'s nothing stopping you from swapping again. You\'ll already have an open message thread to arrange it.',
      },
    ],
  },
  {
    heading: 'Safety & Trust',
    items: [
      {
        q: 'What is the "Verified Neighbour" badge?',
        a: 'A Verified Neighbour badge is awarded to members who have completed at least 5 swaps and hold a perfect 5.0 average review rating. It\'s a signal from the community that this person is reliable, friendly, and follows through on what they offer.',
      },
      {
        q: 'How do reviews work?',
        a: 'After a swap is marked complete by both parties, you can leave a star rating and a short written review. Reviews are public and help other members make informed decisions. You can only review someone after a completed swap — not before.',
      },
      {
        q: 'What should I do if I feel unsafe?',
        a: 'Your safety is the priority. If you ever feel uncomfortable, you can end or cancel a swap at any time with no obligation. You should meet in public places for first swaps, let someone know where you\'re going, and trust your instincts. If something happens, please report it immediately using the report button on the relevant profile or listing.',
      },
      {
        q: 'How does SkillSwap handle inappropriate content?',
        a: 'We review reports from the community and take action against listings, messages, or accounts that violate our community guidelines. Serious or repeated violations result in account suspension.',
      },
    ],
  },
  {
    heading: 'Account & Privacy',
    items: [
      {
        q: 'What personal information is visible to other users?',
        a: 'Other users can see your display name, profile photo, bio, skill listings, and public reviews. Your email address is never shown publicly and is only used to send you notifications and account-related emails.',
      },
      {
        q: 'Can I change my email address or password?',
        a: 'Yes. Go to Settings → Account to update your email address or change your password at any time.',
      },
      {
        q: 'How do I delete my account?',
        a: 'You can request account deletion from Settings → Account. Your profile and listings will be removed. Please note that messages within completed swaps may be retained for a short period as part of our record-keeping obligations.',
      },
      {
        q: 'Does SkillSwap share my data with third parties?',
        a: 'We don\'t sell your personal data. We use a small number of trusted services to keep the platform running — see our Privacy Policy for the full breakdown.',
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-slate-100 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-slate-900 marker:hidden [&::-webkit-details-marker]:hidden">
        {q}
        <svg
          className="w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div className="pb-4">
        <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
      </div>
    </details>
  )
}

export function FAQPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
          Everything you need to know about SkillSwap. Can't find what you're looking for?{' '}
          <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
            Get in touch.
          </Link>
        </p>
      </div>

      {/* FAQ sections */}
      <div className="mx-auto max-w-3xl space-y-10">
        {FAQ_SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-4">
              {section.heading}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200/80 px-6 shadow-sm ring-1 ring-black/[0.02]">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-14 text-center">
        <p className="text-sm text-slate-500 mb-4">Still have questions?</p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-primary-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          style={{
            background: 'linear-gradient(135deg, #43c1a6 0%, #6366f1 100%)',
            boxShadow: '0 4px 20px rgba(67, 193, 166, 0.25)',
          }}
        >
          Contact us
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link to="/" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
          &larr; Back to home
        </Link>
      </div>
    </div>
  )
}
