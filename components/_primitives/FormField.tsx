import { forwardRef } from 'react'

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

type FormFieldProps = {
  id: string
  label: string
  name: string
  value?: string
  onChange?: React.ChangeEventHandler<FieldElement>
  onBlur?: React.FocusEventHandler<FieldElement>
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

export const FormField = forwardRef<FieldElement, FormFieldProps>(function FormField(
  {
    id,
    label,
    name,
    value,
    onChange,
    onBlur,
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
  },
  ref
) {
  const fieldClass = unstyled
    ? className
    : `w-full px-3.5 py-3 text-sm font-mono border-2 border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50 transition-colors duration-200 focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark ${readOnly || disabled ? 'cursor-not-allowed opacity-70' : ''}`

  const labelClass = `block text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2`
  const errorClass = `text-[11px] text-red-500 dark:text-red-400 font-mono mt-1.5`

  const shared = {
    id,
    name,
    value,
    onChange,
    onBlur,
    required,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined
  }

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
          {...shared}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          placeholder={placeholder}
          rows={rows ?? 4}
          readOnly={readOnly}
          disabled={disabled}
          className={`${fieldClass} resize-none`}
        />
      ) : type === 'select' ? (
        <select {...shared} ref={ref as React.Ref<HTMLSelectElement>} disabled={disabled} className={fieldClass}>
          {children}
        </select>
      ) : (
        <input
          {...shared}
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          readOnly={readOnly}
          disabled={disabled}
          maxLength={maxLength}
          className={fieldClass}
        />
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-1.5">
          {hint}
        </p>
      )}
    </div>
  )
})
