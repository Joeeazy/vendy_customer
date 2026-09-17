'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';

import { errorMessage } from '@/api/errors';
import { firstName, phone, telHref } from '@/api/format';
import type { Booking } from '@/api/types';
import { LockedRow } from '@/ui/Blocks';
import { Button, buttonClasses } from '@/ui/Button';

import { contactShared } from './status';
import { useVendorContact } from './useBooking';

/** The vendor's number: locked with a reason, then revealed on tap. */
export function VendorContactCard({ booking }: { booking: Booking }) {
  const [requested, setRequested] = useState(false);
  const contact = useVendorContact(booking, requested);
  const vendorName = firstName(booking.vendor.display_name);

  if (!contactShared(booking.status)) {
    const closed = ['declined', 'expired', 'cancelled'].includes(booking.status);
    return closed ? null : (
      <LockedRow
        title={`Phone unlocks once ${vendorName} confirms.`}
        detail="Contact details stay private until then, for both of you."
      />
    );
  }

  if (contact.data) {
    const whatsapp = contact.data.whatsapp;
    return (
      <div className="flex flex-col gap-3 rounded-card bg-chalk p-4 hairline">
        <p className="text-caption text-slate">{contact.data.display_name}</p>
        <a
          href={telHref(contact.data.phone)}
          className="font-display text-display-m font-bold text-duka tabular"
        >
          {phone(contact.data.phone)}
        </a>
        {contact.data.alt_phone && (
          <p className="text-body text-slate tabular">Also {phone(contact.data.alt_phone)}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <a href={telHref(contact.data.phone)} className={buttonClasses({ size: 'md' })}>
            <Phone aria-hidden="true" className="size-4" />
            Call
          </a>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className={buttonClasses({ variant: 'secondary', size: 'md' })}
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-card bg-chalk p-4 hairline">
      <p className="font-semibold">{vendorName}&apos;s number is unlocked.</p>
      <Button onClick={() => setRequested(true)} loading={contact.isFetching}>
        <Phone aria-hidden="true" className="size-4" />
        Show number
      </Button>
      {contact.error && <p className="text-caption text-clay">{errorMessage(contact.error)}</p>}
    </div>
  );
}
