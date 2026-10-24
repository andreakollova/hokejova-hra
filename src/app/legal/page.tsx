import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Legal & Policies',
};

const DOCUMENTS = [
  {
    title: 'Terms of Service',
    version: 'v1.1',
    href: '/terms',
    desc: 'Rules for using Hockey Beats, account registration, subscriptions, and acceptable use.',
  },
  {
    title: 'Privacy Policy',
    version: 'v1.1',
    href: '/privacy',
    desc: 'How we collect, use, store, and protect your personal data under GDPR.',
  },
  {
    title: 'Subscription, Cancellation & Refund Policy',
    version: 'v1.0',
    href: '/subscription-policy',
    desc: 'Premium plans, free trial, automatic renewal, cancellation, and refund rights.',
  },
  {
    title: 'Cookie & Local Storage Policy',
    version: 'v1.0',
    href: '/cookies',
    desc: 'Cookies, browser storage, consent, and how to manage your preferences.',
  },
  {
    title: 'Parental Consent & Children\'s Privacy Notice',
    version: 'v1.0',
    href: '/parental-consent',
    desc: 'Age requirements, parental authorization, and privacy protections for younger players.',
  },
  {
    title: 'Age Verification & Premium Checkout Specification',
    version: 'v1.0',
    href: '/age-verification',
    desc: 'Registration flows, parental authorization, subscription checkout, and implementation requirements.',
  },
  {
    title: 'Fair Play & Leaderboard Rules',
    version: 'v1.1',
    href: '/fair-play',
    desc: 'Fair gameplay, score integrity, prohibited manipulation, and leaderboard rules.',
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 sm:px-10 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/images/hb-logo-hero-dark.png" alt="Hockey Beats" width={130} height={30} className="h-6 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 sm:px-10 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Legal & Policies</h1>
        <p className="text-gray-500 text-sm mb-10">All legal documents, policies, and guidelines for Hockey Beats.</p>

        <div className="space-y-4">
          {DOCUMENTS.map(doc => (
            <Link key={doc.href} href={doc.href} className="block group">
              <div className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{doc.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{doc.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg flex-shrink-0">{doc.version}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            <strong>DRIXTON s. r. o.</strong> · Mudrochova 7480/15, 831 06 Bratislava – Rača, Slovak Republic<br />
            IČO: 53874871 · DIČ: 2121518399 · IČ DPH: SK2121518399<br />
            Contact: <a href="mailto:studio@drixton.com" className="underline hover:text-gray-600">studio@drixton.com</a>
          </p>
        </div>
      </main>
    </div>
  );
}
