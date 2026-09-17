'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent, type KeyboardEvent } from 'react';

import { api, unwrap } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { keys } from '@/api/keys';
import type { Booking } from '@/api/types';
import { Notice } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { cn } from '@/ui/cn';
import { Field, TextArea } from '@/ui/Field';

const WORDS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Excellent'];

/** Five numbered blocks rather than stars: big targets, readable in sun. */
function RatingPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(5, (value || 0) + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, (value || 2) - 1);
    else return;
    event.preventDefault();
    onChange(next);
    event.currentTarget.querySelectorAll('button')[next - 1]?.focus();
  }

  return (
    <div role="radiogroup" aria-label="Rating" className="grid grid-cols-5 gap-1.5" onKeyDown={onKeyDown}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating}, ${WORDS[rating]}`}
          tabIndex={value === rating || (!value && rating === 1) ? 0 : -1}
          onClick={() => onChange(rating)}
          className={cn(
            'h-12 rounded-sm font-display text-title font-bold tabular',
            rating <= value ? 'bg-duka text-chalk' : 'bg-chalk text-ink hairline hover:bg-paper',
          )}
        >
          {rating}
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ booking }: { booking: Booking }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const review = useMutation({
    mutationFn: () =>
      unwrap(
        api.POST('/bookings/{booking_id}/review', {
          params: { path: { booking_id: booking.id } },
          body: { rating, comment: comment.trim() || null },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.awaitingReviews }),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (rating) review.mutate();
  }

  if (review.isSuccess) {
    return (
      <Notice tone="success" title="Thanks for the review">
        It helps the next person choose, and helps good vendors get more work.
      </Notice>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-card bg-chalk p-4 hairline sm:p-5"
      aria-labelledby="review-heading"
    >
      <div>
        <h2 id="review-heading" className="font-display text-title font-bold">
          How did {booking.vendor.display_name} do?
        </h2>
        <p className="text-caption text-slate">
          Only people who booked can review. Your first name is shown.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <RatingPicker value={rating} onChange={setRating} />
        <p className="h-5 text-caption text-slate" aria-live="polite">
          {WORDS[rating]}
        </p>
      </div>
      <Field label="Anything to add? (optional)">
        {(props) => (
          <TextArea
            {...props}
            value={comment}
            maxLength={1000}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Came the same afternoon, fixed the pipe and cleaned up after."
          />
        )}
      </Field>
      {review.error && <p className="text-caption font-medium text-clay">{errorMessage(review.error)}</p>}
      <Button type="submit" disabled={!rating} loading={review.isPending} className="sm:self-start">
        Post review
      </Button>
    </form>
  );
}
