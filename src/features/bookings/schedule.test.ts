import { describe, expect, it } from 'vitest';

import { addDays, dateFor, nairobiDate, openSlots, slotLabel, toInstant } from './schedule';

// 17 Sep 2026, 21:30 UTC = 18 Sep 00:30 in Nairobi.
const lateNightUtc = new Date('2026-09-17T21:30:00Z');
// 17 Sep 2026, 10:10 in Nairobi.
const morning = new Date('2026-09-17T07:10:00Z');

describe('schedule', () => {
  it('uses the Nairobi calendar day, not UTC', () => {
    expect(nairobiDate(lateNightUtc)).toBe('2026-09-18');
    expect(dateFor('tomorrow', '', lateNightUtc)).toBe('2026-09-19');
    expect(dateFor('date', '2026-10-01', morning)).toBe('2026-10-01');
  });

  it('crosses month ends', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
  });

  it('turns a local slot into the exact instant', () => {
    expect(toInstant('2026-09-17', 14).toISOString()).toBe('2026-09-17T11:00:00.000Z');
  });

  it('offers only slots at least half an hour away', () => {
    expect(openSlots('2026-09-17', morning)[0]).toBe(11);
    expect(openSlots('2026-09-18', morning)).toHaveLength(13);
    expect(openSlots('2026-09-17', new Date('2026-09-17T16:00:00Z'))).toEqual([]);
  });

  it('labels slots in 12-hour time', () => {
    expect([slotLabel(9), slotLabel(12), slotLabel(14)]).toEqual(['9:00 am', '12:00 pm (midday)', '2:00 pm']);
  });
});
