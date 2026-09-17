'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';

import { firstName } from '@/api/format';
import type { VendorProfile } from '@/api/types';
import { saveDraft, type WhenChoice } from '@/features/bookings/draft';
import { LockedRow } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Field, Select, TextArea } from '@/ui/Field';
import { SegmentedControl } from '@/ui/SegmentedControl';

import { priceChoices } from './priceChoices';

const WHEN_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'date', label: 'Pick a date' },
] as const;

const LOCKED_TITLE = 'Phone number unlocks when the vendor confirms your booking.';
const LOCKED_DETAIL = 'Chat opens as soon as you send the request, so you can ask about the job first.';

/**
 * Desktop: the sticky "Request a booking" panel. Mobile: a bottom bar.
 * Both hand what was chosen to the booking form, which asks where and when.
 */
export function BookingPanel({ vendor }: { vendor: VendorProfile }) {
  const router = useRouter();
  const choices = useMemo(() => priceChoices(vendor.services), [vendor.services]);
  const [choice, setChoice] = useState(choices[0]?.value ?? '');
  const [when, setWhen] = useState<WhenChoice>('today');
  const [description, setDescription] = useState('');
  const bookHref = `/vendors/${vendor.slug}/book`;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    saveDraft(vendor.slug, { choice, when, description });
    router.push(bookHref);
  }

  if (choices.length === 0) return null;

  return (
    <>
      <form onSubmit={onSubmit} className="hidden flex-col gap-5 lg:flex" aria-labelledby="book-heading">
        <div>
          <h2 id="book-heading" className="font-display text-display-m font-bold">
            Request a booking
          </h2>
          <p className="mt-1 text-body text-slate">
            {firstName(vendor.display_name)} gets your request straight away and has 24 hours to confirm.
          </p>
        </div>

        <Field label="Service">
          {(props) => (
            <Select {...props} value={choice} onChange={(event) => setChoice(event.target.value)}>
              {choices.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-body font-semibold" id="when-label">
            When
          </span>
          <SegmentedControl label="When" options={WHEN_OPTIONS} value={when} onChange={setWhen} />
        </div>

        <Field label="What needs doing?">
          {(props) => (
            <TextArea
              {...props}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Kitchen sink pipe is leaking under the cabinet…"
            />
          )}
        </Field>

        <LockedRow title={LOCKED_TITLE} detail={LOCKED_DETAIL} />

        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" block className="justify-start">
            Request booking
          </Button>
          <p className="text-caption text-slate">Nothing is charged through Vendy. You pay the vendor directly.</p>
        </div>
      </form>

      <div className="flex flex-col gap-4 lg:hidden">
        <LockedRow title={LOCKED_TITLE} detail={LOCKED_DETAIL} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 bg-paper px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] hairline-t lg:hidden">
        <Button size="lg" block onClick={() => router.push(bookHref)}>
          Request booking
        </Button>
      </div>
    </>
  );
}
