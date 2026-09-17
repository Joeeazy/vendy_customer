import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import { cn } from './cn';

const control =
  'w-full rounded-sm bg-chalk text-ink hairline placeholder:text-slate focus-visible:border-duka disabled:opacity-60';

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  className?: string;
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode;
};

/** Label, control, hint and error, wired together for screen readers. */
export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-body font-semibold">
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && (
        <p id={hintId} className="text-caption text-slate">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption font-medium text-clay">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, 'h-12 px-3.5 text-body-l', className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'min-h-28 px-3.5 py-3 text-body-l', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, 'h-12 appearance-none px-3.5 text-body-l', className)} {...props}>
      {children}
    </select>
  );
}
