import { site } from '@/config/site';
import { buttonClasses } from '@/ui/Button';

export function FundiCta() {
  return (
    <section aria-labelledby="fundi-heading" className="bg-duka-soft hairline-t">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div>
          <h2 id="fundi-heading" className="font-display text-display-m font-bold">
            Are you a fundi? List your business.
          </h2>
          <p className="mt-1 text-body text-slate">
            Verification takes about one working day. You keep your own prices and your own customers.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={site.vendorAppUrl} className={buttonClasses({ size: 'md' })}>
            Work with us
          </a>
          <a
            href={`${site.vendorAppUrl}/sign-up`}
            className={buttonClasses({ variant: 'secondary', size: 'md' })}
          >
            Create a vendor account
          </a>
        </div>
      </div>
    </section>
  );
}
