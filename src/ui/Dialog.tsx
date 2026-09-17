'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

import { cn } from './cn';

/**
 * A modal built on <dialog>: focus trapping, Escape and the backdrop come from
 * the browser. Flat chalk sheet with a hairline edge, no shadow.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-lg rounded-card bg-chalk p-0 text-ink hairline backdrop:bg-ink/60',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <h2 className="font-display text-display-m font-bold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="-mt-1 -mr-2 rounded-sm p-2 text-slate hover:text-ink"
          aria-label="Close"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="px-5 pt-3 pb-5">{children}</div>
      {footer && (
        <div className="flex flex-col-reverse gap-2 px-5 pb-5 sm:flex-row sm:justify-end">{footer}</div>
      )}
    </dialog>
  );
}
