import { describe, expect, it } from 'vitest';

import { ApiError, errorMessage } from './errors';
import { ago, distance, firstName, kes, phone, telHref, when } from './format';

describe('kes', () => {
  it('formats whole shillings with grouping', () => {
    expect(kes(1500)).toBe('KSh 1,500');
    expect(kes(38400)).toBe('KSh 38,400');
    expect(kes(0)).toBe('KSh 0');
  });
});

describe('distance', () => {
  it('uses metres under a kilometre and one decimal above', () => {
    expect(distance(400)).toBe('400 m');
    expect(distance(40)).toBe('100 m');
    expect(distance(2100)).toBe('2.1 km');
    expect(distance(5000)).toBe('5 km');
  });
});

describe('when (East Africa Time)', () => {
  const now = new Date('2026-09-15T06:41:00Z'); // 09:41 in Nairobi

  it('says today and tomorrow in Nairobi time', () => {
    expect(when('2026-09-15T11:00:00Z', now)).toBe('Today, 2:00 pm');
    expect(when('2026-09-16T06:30:00Z', now)).toBe('Tomorrow, 9:30 am');
  });

  it('rolls to the next day at midnight Nairobi time, not UTC', () => {
    // 22:30 UTC on the 15th is 01:30 on the 16th in Nairobi.
    expect(when('2026-09-15T22:30:00Z', now)).toBe('Tomorrow, 1:30 am');
  });
});

describe('ago', () => {
  const now = new Date('2026-09-15T12:00:00Z');

  it('is short and human', () => {
    expect(ago('2026-09-15T11:59:40Z', now)).toBe('just now');
    expect(ago('2026-09-15T11:52:00Z', now)).toBe('8 min ago');
    expect(ago('2026-09-15T09:00:00Z', now)).toBe('3 hrs ago');
    expect(ago('2026-09-14T10:00:00Z', now)).toBe('yesterday');
  });
});

describe('names and phones', () => {
  it('takes the first name', () => {
    expect(firstName('Grace Wanjiru Kamau')).toBe('Grace');
  });

  it('shows Kenyan numbers locally and dials them in full', () => {
    expect(phone('+254722000111')).toBe('0722 000 111');
    expect(telHref('+254722000111')).toBe('tel:+254722000111');
  });
});

describe('ApiError', () => {
  it('uses the backend detail', () => {
    const error = ApiError.from(409, { code: 'booking.cancel_after_start', detail: "Work has started, so this booking can't be cancelled." });
    expect(error.code).toBe('booking.cancel_after_start');
    expect(errorMessage(error)).toBe("Work has started, so this booking can't be cancelled.");
  });

  it('turns validation errors into field messages', () => {
    const error = ApiError.from(422, {
      code: 'validation_error',
      detail: 'The request is invalid.',
      errors: [{ loc: ['body', 'phone'], msg: 'Value error, Enter a Kenyan mobile number, e.g. 0712 345 678.' }],
    });
    expect(error.fieldErrors).toEqual({ phone: 'Enter a Kenyan mobile number, e.g. 0712 345 678.' });
    expect(error.message).toBe('Enter a Kenyan mobile number, e.g. 0712 345 678.');
  });

  it('has a sentence even without a body', () => {
    expect(errorMessage(ApiError.from(502, null))).toBe('Something went wrong. Please try again.');
    expect(errorMessage(new TypeError('fetch failed'))).toMatch(/connection/);
  });
});
