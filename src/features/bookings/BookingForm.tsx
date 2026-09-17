'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LocateFixed } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import { api, unwrap } from '@/api/client';
import { errorMessage, isApiError } from '@/api/errors';
import { kes, phone as formatPhone } from '@/api/format';
import { keys } from '@/api/keys';
import type { VendorProfile } from '@/api/types';
import { useArea } from '@/features/area/area';
import { useRequireUser } from '@/features/auth/session';
import { priceChoices } from '@/features/vendors/priceChoices';
import { Avatar } from '@/ui/Avatar';
import { LockedRow, Notice, Skeleton } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Field, Select, TextArea, TextInput } from '@/ui/Field';
import { SegmentedControl } from '@/ui/SegmentedControl';

import { clearDraft, readDraft, saveDraft, type WhenChoice } from './draft';
import type { LatLng } from './LocationMap';
import { addDays, dateFor, nairobiDate, openSlots, slotLabel, toInstant } from './schedule';

const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full sm:h-80" />,
});

const WHEN_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'date', label: 'Pick a date' },
] as const;

type Errors = Partial<
  Record<'choice' | 'description' | 'slot' | 'date' | 'address_text' | 'contact_phone' | 'lat', string>
>;

function newAttemptKey(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function BookingForm({ vendor }: { vendor: VendorProfile }) {
  const user = useRequireUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const area = useArea();

  const choices = useMemo(() => priceChoices(vendor.services), [vendor.services]);
  const [choice, setChoice] = useState(choices[0]?.value ?? '');
  const [description, setDescription] = useState('');
  const [when, setWhen] = useState<WhenChoice>('today');
  const [pickedDate, setPickedDate] = useState('');
  const [slot, setSlot] = useState('');
  const [emergency, setEmergency] = useState(false);
  const [point, setPoint] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [address, setAddress] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  // One key per attempt: a retry after a dropped connection can't book twice.
  const attemptKey = useRef(newAttemptKey());

  // Pick up what was started on the profile page (after hydration: sessionStorage).
  useEffect(() => {
    const draft = readDraft(vendor.slug);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (draft.choice && choices.some((option) => option.value === draft.choice)) setChoice(draft.choice);
    if (draft.when) setWhen(draft.when);
    if (draft.description) setDescription(draft.description);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [vendor.slug, choices]);

  useEffect(() => {
    saveDraft(vendor.slug, { choice, when, description });
  }, [vendor.slug, choice, when, description]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!point && area.point) setPoint(area.point);
  }, [point, area.point]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user && !contactPhone) setContactPhone(formatPhone(user.phone));
    // Only prefill once the user loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selected = choices.find((option) => option.value === choice);
  const now = new Date();
  const today = nairobiDate(now);
  const date = dateFor(when, pickedDate, now);
  const slots = date ? openSlots(date, now) : [];

  const submit = useMutation({
    mutationFn: () => {
      if (!selected || !point) throw new Error('Choose a service and put the pin on the job.');
      return unwrap(
        api.POST('/bookings', {
          params: { header: { 'Idempotency-Key': attemptKey.current } },
          body: {
            vendor_id: vendor.id,
            service_type_id: selected.serviceTypeId,
            price_item_id: selected.item?.id ?? null,
            description: description.trim(),
            preferred_at: emergency || !slot ? null : toInstant(date, Number(slot)).toISOString(),
            is_emergency: emergency,
            lat: Number(point.lat.toFixed(6)),
            lng: Number(point.lng.toFixed(6)),
            address_text: address.trim(),
            access_notes: accessNotes.trim() || null,
            contact_phone:
              user && contactPhone.replace(/\s/g, '') !== user.phone.replace(/^\+254/, '0')
                ? contactPhone
                : null,
          },
        }),
      );
    },
    onSuccess: async (booking) => {
      clearDraft(vendor.slug);
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.setQueryData(keys.booking(booking.id), booking);
      router.replace(`/bookings/${booking.id}?sent=1`);
    },
    onError: (error) => {
      if (isApiError(error) && Object.keys(error.fieldErrors).length) setErrors(error.fieldErrors as Errors);
    },
  });

  function validate(): Errors {
    const found: Errors = {};
    if (!selected) found.choice = 'Choose what you need done.';
    if (description.trim().length < 10)
      found.description = 'Tell the vendor a little more (at least 10 characters).';
    if (!emergency) {
      if (when === 'date' && !pickedDate) found.date = 'Pick a date.';
      else if (!slot || !slots.includes(Number(slot))) found.slot = 'Choose a time.';
    }
    if (!point) found.lat = 'Put the pin where the job is.';
    if (address.trim().length < 5) found.address_text = 'Add the building, street or estate.';
    return found;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length === 0) submit.mutate();
  }

  function locateMe() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPoint({ lat: coords.latitude, lng: coords.longitude });
        setLocating(false);
      },
      () => {
        setErrors((current) => ({
          ...current,
          lat: "We couldn't get your location. Tap the map where the job is.",
        }));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8" aria-busy="true">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const estimate = selected?.item
    ? selected.item.price_type === 'callout'
      ? `${kes(selected.item.price_kes)} callout`
      : kes(selected.item.price_kes)
    : 'Vendor quotes';

  const serviceArea =
    vendor.approx_lat != null && vendor.approx_lng != null
      ? { center: { lat: vendor.approx_lat, lng: vendor.approx_lng }, radiusM: vendor.service_radius_m }
      : null;

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto flex max-w-2xl flex-col pb-32 lg:pb-12">
      <header className="flex items-center gap-3 px-4 py-4 sm:px-6">
        <Link
          href={`/vendors/${vendor.slug}`}
          className="-ml-2 rounded-sm p-2"
          aria-label={`Back to ${vendor.display_name}`}
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
        <h1 className="font-display text-display-m font-bold">Request booking</h1>
      </header>

      <div className="flex items-center gap-3 bg-chalk px-4 py-3 hairline-b hairline-t sm:mx-6 sm:rounded-card sm:hairline">
        <Avatar name={vendor.display_name} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-display font-bold">{vendor.display_name}</p>
          <p className="truncate text-caption text-slate">
            {vendor.jobs_completed} jobs completed · {vendor.neighbourhood?.name ?? 'Nairobi'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 pt-6 sm:px-6">
        {!user.email_verified && (
          <Notice tone="warn" title="Verify your email to book">
            We sent a code to {user.email}.{' '}
            <Link
              href={`/verify-email?next=/vendors/${vendor.slug}/book`}
              className="font-semibold underline"
            >
              Enter the code
            </Link>
          </Notice>
        )}

        <Field label="Service" error={errors.choice}>
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

        <Field label="What needs doing?" error={errors.description}>
          {(props) => (
            <TextArea
              {...props}
              value={description}
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Kitchen sink pipe is leaking under the cabinet. Water collecting in the cupboard since yesterday."
            />
          )}
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1.5 text-body font-semibold">When?</legend>
          {vendor.accepts_emergency && (
            <label className="flex items-start gap-3 rounded-sm bg-chalk p-3 hairline">
              <input
                type="checkbox"
                checked={emergency}
                onChange={(event) => setEmergency(event.target.checked)}
                className="mt-0.5 size-5 accent-duka"
              />
              <span>
                <span className="font-semibold">It&apos;s an emergency</span>
                <span className="block text-caption text-slate">
                  Burst pipe, no power, flooding. The vendor has less time to answer, and comes as soon as
                  they can.
                </span>
              </span>
            </label>
          )}
          {!emergency && (
            <>
              <SegmentedControl label="Day" options={WHEN_OPTIONS} value={when} onChange={setWhen} />
              <div className="grid gap-3 sm:grid-cols-2">
                {when === 'date' && (
                  <Field label="Date" error={errors.date}>
                    {(props) => (
                      <TextInput
                        {...props}
                        type="date"
                        min={addDays(today, 2)}
                        max={addDays(today, 60)}
                        value={pickedDate}
                        onChange={(event) => setPickedDate(event.target.value)}
                      />
                    )}
                  </Field>
                )}
                <Field
                  label="Time"
                  error={errors.slot}
                  hint={date && slots.length === 0 ? 'No times left today. Try tomorrow.' : undefined}
                >
                  {(props) => (
                    <Select
                      {...props}
                      value={slot}
                      onChange={(event) => setSlot(event.target.value)}
                      disabled={slots.length === 0}
                    >
                      <option value="">Choose a time</option>
                      {slots.map((hour) => (
                        <option key={hour} value={hour}>
                          {slotLabel(hour)}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>
            </>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1.5 text-body font-semibold">Where?</legend>
          <div className="flex flex-col gap-2">
            {point ? (
              <LocationMap point={point} onMove={setPoint} serviceArea={serviceArea} />
            ) : (
              <Skeleton className="h-64 w-full sm:h-80" />
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-caption text-slate">Tap the map or drag the pin to the job.</p>
              <Button variant="secondary" size="sm" onClick={locateMe} loading={locating}>
                <LocateFixed aria-hidden="true" className="size-4" />
                Use my location
              </Button>
            </div>
            {errors.lat && <p className="text-caption font-medium text-clay">{errors.lat}</p>}
          </div>

          <Field
            label="Address"
            error={errors.address_text}
            hint="The exact address is shared only after the vendor confirms."
          >
            {(props) => (
              <TextInput
                {...props}
                value={address}
                maxLength={300}
                autoComplete="street-address"
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Kilimani, Ring Road · Apt 4B"
              />
            )}
          </Field>
          <Field label="Directions (optional)">
            {(props) => (
              <TextInput
                {...props}
                value={accessNotes}
                maxLength={300}
                onChange={(event) => setAccessNotes(event.target.value)}
                placeholder="Blue gate opposite the chemist, 3rd floor"
              />
            )}
          </Field>
        </fieldset>

        <Field
          label="Your phone for this job"
          error={errors.contact_phone}
          hint="The vendor sees it once they confirm."
        >
          {(props) => (
            <TextInput
              {...props}
              type="tel"
              autoComplete="tel"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
            />
          )}
        </Field>

        <LockedRow
          title="Phone number unlocks when the vendor confirms your booking."
          detail="Chat opens as soon as you send the request, so you can ask about the job first."
        />

        {submit.error && !(isApiError(submit.error) && submit.error.status === 422) && (
          <Notice tone="error" title="Your request wasn't sent">
            {errorMessage(submit.error)}
            {isApiError(submit.error, 'booking.email_unverified') && (
              <>
                {' '}
                <Link
                  href={`/verify-email?next=/vendors/${vendor.slug}/book`}
                  className="font-semibold underline"
                >
                  Verify now
                </Link>
              </>
            )}
          </Notice>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[1000] bg-paper px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] hairline-t lg:static lg:mt-8 lg:bg-transparent lg:px-6 lg:[border-top:0]">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <p className="flex items-baseline justify-between">
            <span className="text-caption text-slate">{selected?.item ? 'Price' : 'Estimate'}</span>
            <span className="font-display text-title font-bold tabular">{estimate}</span>
          </p>
          <Button type="submit" size="lg" block loading={submit.isPending}>
            {submit.isPending ? 'Sending…' : 'Request booking'}
          </Button>
        </div>
      </div>
    </form>
  );
}
