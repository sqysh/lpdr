type FormFieldProps = {
  id: string
  label: string
  name: string
  value: string
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  error?: string
  type?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  readOnly?: boolean
  className?: string
  rows?: number
  children?: React.ReactNode // for select options
  hint?: string
  disabled?: boolean
  maxLength?: number
  unstyled?: boolean
}

export function FormField({
  id,
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  required = false,
  readOnly = false,
  className = '',
  rows,
  children,
  hint,
  disabled = false,
  maxLength,
  unstyled = false
}: FormFieldProps) {
  const fieldClass = unstyled
    ? className
    : `w-full px-3.5 py-3 text-sm font-mono border-2 border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50 transition-colors duration-200 focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark ${readOnly || disabled ? 'cursor-not-allowed opacity-70' : ''}`
  const labelClass = `block text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2`
  const errorClass = `text-[11px] text-red-500 dark:text-red-400 font-mono mt-1.5`

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && (
          <span className="ml-1 text-primary-light dark:text-primary-dark" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows ?? 4}
          readOnly={readOnly}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${fieldClass} resize-none`}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={fieldClass}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          readOnly={readOnly}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={fieldClass}
          disabled={disabled}
          maxLength={maxLength}
        />
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      )}
      {hint && (
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-1.5">{hint}</p>
      )}
    </div>
  )
}
