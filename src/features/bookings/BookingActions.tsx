'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { api, unwrap } from '@/api/client';
import { errorMessage } from '@/api/errors';
import type { Booking, ReportKind } from '@/api/types';
import { Notice } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Dialog } from '@/ui/Dialog';
import { Field, Select, TextArea } from '@/ui/Field';

import { canCancel, canReport } from './status';
import { useBookingMutation } from './useBooking';

const REPORT_KINDS: { value: ReportKind; label: string }[] = [
  { value: 'no_show', label: "The vendor didn't show up" },
  { value: 'quality', label: 'The work was poor or unfinished' },
  { value: 'payment', label: 'A problem with the price or payment' },
  { value: 'dispute', label: "We can't agree on something" },
  { value: 'safety', label: 'I felt unsafe' },
];

function CancelBooking({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const cancel = useBookingMutation(booking.id, () =>
    unwrap(
      api.POST('/bookings/{booking_id}/cancel', {
        params: { path: { booking_id: booking.id } },
        body: { reason: reason.trim() || null },
      }),
    ),
  );

  return (
    <>
      <Button variant="secondary" block onClick={() => setOpen(true)}>
        Cancel booking
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Cancel this booking?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Keep booking
            </Button>
            <Button
              variant="danger"
              loading={cancel.isPending}
              onClick={() => cancel.mutate(undefined, { onSuccess: () => setOpen(false) })}
            >
              Cancel booking
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body-l">
            {booking.vendor.display_name} will be told straight away. Cancelling is free before work starts.
          </p>
          <Field label="Reason (optional)" hint="Helps the vendor plan their day.">
            {(props) => (
              <TextArea
                {...props}
                value={reason}
                maxLength={500}
                onChange={(event) => setReason(event.target.value)}
              />
            )}
          </Field>
          {cancel.error && <p className="text-caption font-medium text-clay">{errorMessage(cancel.error)}</p>}
        </div>
      </Dialog>
    </>
  );
}

function ReportProblem({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ReportKind>('no_show');
  const [description, setDescription] = useState('');
  const report = useMutation({
    mutationFn: () =>
      unwrap(
        api.POST('/bookings/{booking_id}/reports', {
          params: { path: { booking_id: booking.id } },
          body: { kind, description: description.trim() },
        }),
      ),
  });

  const tooShort = description.trim().length < 10;

  return (
    <>
      <Button variant="link" className="self-start" onClick={() => setOpen(true)}>
        Report a problem
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={report.isSuccess ? 'Thanks for telling us' : 'Report a problem'}
        footer={
          report.isSuccess ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Not now
              </Button>
              <Button loading={report.isPending} disabled={tooShort} onClick={() => report.mutate()}>
                Send report
              </Button>
            </>
          )
        }
      >
        {report.isSuccess ? (
          <p className="text-body-l">
            A person at Vendy reads every report. We&apos;ll email you about {booking.reference}, usually
            within a day.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {kind === 'safety' && (
              <Notice tone="error" title="If you are in danger now, call 999 or 112 first.">
                Then tell us what happened.
              </Notice>
            )}
            <Field label="What went wrong?">
              {(props) => (
                <Select
                  {...props}
                  value={kind}
                  onChange={(event) => setKind(event.target.value as ReportKind)}
                >
                  {REPORT_KINDS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Tell us what happened" hint="At least 10 characters. The vendor doesn't see this.">
              {(props) => (
                <TextArea
                  {...props}
                  value={description}
                  maxLength={3000}
                  onChange={(event) => setDescription(event.target.value)}
                />
              )}
            </Field>
            {report.error && (
              <p className="text-caption font-medium text-clay">{errorMessage(report.error)}</p>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}

export function BookingActions({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-col gap-2">
      {canCancel(booking.status) && <CancelBooking booking={booking} />}
      {canReport(booking.status) && <ReportProblem booking={booking} />}
    </div>
  );
}
