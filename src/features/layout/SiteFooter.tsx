import { Wordmark } from '@/ui/Wordmark';

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-paper">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-12">
        <div className="flex flex-col gap-2">
          <Wordmark tone="paper" size="md" />
          <p className="font-medium text-paper/80">Pata mtu wa kazi.</p>
        </div>
        <p className="max-w-md text-body text-paper/70">
          Nothing is charged through Vendy. You agree the price with the vendor and pay them directly.
        </p>
      </div>
    </footer>
  );
}
