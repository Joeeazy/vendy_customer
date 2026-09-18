import { Check } from 'lucide-react';

const RULES = [
  'Agree the price in chat before the vendor travels.',
  'Never pay a deposit before anyone arrives.',
  'Keep the chat on Vendy. It is the record if there is a dispute.',
  'Your number and address go to one vendor only, after they confirm.',
  'We never sell your details or send marketing messages.',
  'Cancel free any time before work starts.',
];

export function SafetyBand() {
  return (
    <section id="safety" aria-labelledby="safety-heading" className="scroll-mt-6 bg-duka text-chalk">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:px-12 lg:py-12">
        <div>
          <h2 id="safety-heading" className="font-display text-display-m font-bold">
            Safety, money and privacy
          </h2>
          <p className="mt-3 text-body-l text-chalk/85">
            If something goes wrong, report the booking from your bookings list. A person reads every report
            and can suspend a vendor the same day.
          </p>
        </div>
        <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-3 text-body-l">
              <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-duka-soft" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
