import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';

import { site, telHref, whatsappHref } from '@/config/site';
import { cn } from '@/ui/cn';

function faqs(areas: number | null): { q: string; a: string }[] {
  return [
    {
      q: 'What does it cost me?',
      a: 'Nothing. Searching, chatting and booking are free for customers. You pay the vendor for the work, directly.',
    },
    {
      q: "Why can't I see the phone number?",
      a: 'It unlocks when the vendor confirms your booking. This keeps numbers off scraped lists and keeps the job record on the platform.',
    },
    {
      q: 'How fast will someone reply?',
      a: 'Vendors have 24 hours to confirm a request, and 2 hours for an emergency. Most answer much sooner, and you can chat while you wait.',
    },
    {
      q: 'What if the work is bad?',
      a: 'Report the booking from your bookings list. We can suspend the vendor and will ask both sides for the chat record.',
    },
    {
      q: 'Is there an app?',
      a: 'The website works on any phone browser. Add it to your home screen and it opens like an app.',
    },
    {
      q: 'Which areas do you cover?',
      a: `${areas ? `${areas} Nairobi areas today` : 'Nairobi neighbourhoods'}, starting with Kilimani and the areas around it. More every month.`,
    },
  ];
}

function Channel({
  href,
  icon,
  title,
  detail,
  primary,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  detail: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-sm px-4 py-3',
        primary ? 'bg-duka text-chalk hover:bg-duka-deep' : 'bg-paper hairline hover:bg-chalk',
      )}
    >
      {icon}
      <span>
        <span className="block font-semibold tabular">{title}</span>
        <span className={cn('block text-caption', primary ? 'text-chalk/80' : 'text-slate')}>{detail}</span>
      </span>
    </a>
  );
}

export function FaqAndSupport({ areas }: { areas: number | null }) {
  const { support } = site;
  const hasChannel = Boolean(support.whatsapp || support.phone || support.email);

  return (
    <section id="faq" className="scroll-mt-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12">
        <h2 className="font-display text-display-m font-bold">Common questions</h2>
        <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
          {faqs(areas).map((item) => (
            <div key={item.q} className="py-4 hairline-b">
              <dt className="font-semibold">{item.q}</dt>
              <dd className="mt-1 text-body text-slate">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      <aside
        aria-labelledby="support-heading"
        className="bg-chalk px-4 py-12 sm:px-6 lg:border-l-[1.5px] lg:border-ink-12 lg:px-10"
      >
        <h2 id="support-heading" className="font-display text-display-m font-bold">
          Talk to support
        </h2>
        <p className="mt-3 pt-3 text-body text-slate hairline-t">{support.hours}.</p>

        {hasChannel ? (
          <div className="mt-4 flex flex-col gap-2">
            {support.whatsapp && (
              <Channel
                primary
                href={whatsappHref(support.whatsapp)}
                icon={<MessageCircle aria-hidden="true" className="size-5 shrink-0" />}
                title={`WhatsApp ${support.phone ?? support.whatsapp}`}
                detail="Fastest way to reach us"
              />
            )}
            {support.phone && (
              <Channel
                href={telHref(support.phone)}
                icon={<Phone aria-hidden="true" className="size-5 shrink-0" />}
                title={support.phone}
                detail="Call or SMS, same number"
              />
            )}
            {support.email && (
              <Channel
                href={`mailto:${support.email}`}
                icon={<Mail aria-hidden="true" className="size-5 shrink-0" />}
                title={support.email}
                detail="Replies within one working day"
              />
            )}
          </div>
        ) : (
          <p className="mt-4 text-body text-slate">
            Signed in? Report a problem straight from the booking and a person will pick it up.
          </p>
        )}

        <div className="mt-6">
          <p className="font-semibold">Have a booking reference?</p>
          <p className="mt-1 text-body text-slate">
            Quote it (for example VND-7K2MXP) and support can see the whole job without asking you to explain
            again.
          </p>
        </div>

        {support.address && (
          <p className="mt-6 flex gap-2 text-body text-slate">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {support.address}
          </p>
        )}
      </aside>
    </section>
  );
}
