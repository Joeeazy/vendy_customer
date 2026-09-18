import { Mail, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';

import { loadCategories } from '@/api/catalog';
import { site, telHref, whatsappHref } from '@/config/site';
import { BrushUnderline } from '@/ui/BrushStroke';

function Column({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <h2 className="text-caption font-semibold tracking-widest text-paper/55 uppercase">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a href={link.href} className="text-body text-paper/85 hover:text-paper">
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="text-body text-paper/85 hover:text-paper">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SiteFooter() {
  const categories = await loadCategories();
  const { support, vendorAppUrl } = site;
  const iconLink =
    'flex size-9 items-center justify-center rounded-sm border-[1.5px] border-paper/25 text-paper/85 hover:border-paper hover:text-paper';

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-12 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:px-12">
        <div>
          <p className="text-caption font-semibold tracking-widest text-sign uppercase">Pata mtu wa kazi</p>
          <p className="mt-4 max-w-xs text-body text-paper/75">
            Verified local vendors across Nairobi. Free for customers, no commission on the work.
          </p>
          <div className="mt-5 flex gap-2">
            {support.whatsapp && (
              <a
                href={whatsappHref(support.whatsapp)}
                className={iconLink}
                aria-label="WhatsApp Vendy support"
              >
                <MessageCircle aria-hidden="true" className="size-4" />
              </a>
            )}
            {support.email && (
              <a href={`mailto:${support.email}`} className={iconLink} aria-label="Email Vendy support">
                <Mail aria-hidden="true" className="size-4" />
              </a>
            )}
            {support.phone && (
              <a href={telHref(support.phone)} className={iconLink} aria-label="Call Vendy support">
                <Phone aria-hidden="true" className="size-4" />
              </a>
            )}
          </div>
        </div>

        <Column
          title="Services"
          links={categories
            .slice(0, 6)
            .map((category) => ({ href: `/search?category=${category.slug}`, label: category.name }))}
        />
        <Column
          title="Company"
          links={[
            { href: '/#how-it-works', label: 'How it works' },
            { href: '/search', label: 'Find a vendor' },
            { href: vendorAppUrl, label: 'Work with us', external: true },
          ]}
        />
        <Column
          title="Help & safety"
          links={[
            { href: '/#faq', label: 'Common questions' },
            { href: '/#safety', label: 'Safety and privacy' },
            { href: '/bookings', label: 'Report a problem' },
          ]}
        />
        <div>
          <h2 className="text-caption font-semibold tracking-widest text-paper/55 uppercase">Contact</h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-body text-paper/85">
            {support.phone && (
              <li>
                <a href={telHref(support.phone)} className="font-semibold tabular hover:text-paper">
                  {support.phone}
                </a>
              </li>
            )}
            {support.email && (
              <li>
                <a href={`mailto:${support.email}`} className="hover:text-paper">
                  {support.email}
                </a>
              </li>
            )}
            {support.vendorEmail && (
              <li>
                <a href={`mailto:${support.vendorEmail}`} className="hover:text-paper">
                  {support.vendorEmail}
                </a>
              </li>
            )}
            <li className="text-paper/60">{support.hours}</li>
            {support.address && <li className="text-paper/60">{support.address}</li>}
          </ul>
        </div>
      </div>

      <div
        className="mx-auto max-w-[1440px] overflow-hidden px-4 hairline-t sm:px-6 lg:px-12"
        aria-hidden="true"
      >
        <div className="inline-flex flex-col pt-8">
          <span className="font-display text-[26vw] leading-[0.8] font-extrabold tracking-tight text-paper font-condensed lg:text-[18rem]">
            VENDY
          </span>
          <BrushUnderline className="mt-2 h-4 w-full" />
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 text-caption text-paper/55 sm:flex-row sm:justify-between sm:px-6 lg:px-12">
        <p>© {new Date().getFullYear()} Vendy. Made in Nairobi.</p>
        <p>Nothing is charged through Vendy. You agree the price with the vendor and pay them directly.</p>
      </div>
    </footer>
  );
}
