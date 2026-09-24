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
  // Picks the phone keyboard (decimal, numeric, tel, email) without the quirks of type="number"
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  unstyled?: boolean
  // Reshapes the value as it's typed, e.g. formatPhone. The formatted value is what the form stores
  format?: (value: string) => string
  inputClassName?: string
}

export const FormField = forwardRef<FieldElement, FormFieldProps>(function FormField(props, ref) {
  const {
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
    inputMode,
    unstyled = false,
    format,
    inputClassName = ''
  } = props

  const fieldClass = unstyled
    ? className
    : `w-full px-3.5 py-3 text-sm font-mono border-2 border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50 transition-colors duration-200 focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark ${readOnly || disabled ? 'cursor-not-allowed opacity-70' : ''}`

  // The native select draws its own background, so appearance-none is needed
  // for the field colours to apply. That removes the arrow, drawn back below.
  const selectClass = `${fieldClass} appearance-none pr-10 cursor-pointer`

  const labelClass = `block text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2`
  const errorClass = `text-[11px] text-red-500 dark:text-red-400 font-mono mt-1.5`

  const handleChange: React.ChangeEventHandler<FieldElement> = (e) => {
    if (format) e.target.value = format(e.target.value)
    onChange?.(e)
  }

  const shared = {
    id,
    name,
    value,
    onChange: handleChange,
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
        <div className="relative">
          <select {...shared} ref={ref as React.Ref<HTMLSelectElement>} disabled={disabled} className={selectClass}>
            {children}
          </select>
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-light dark:text-muted-dark"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="square"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      ) : (
        <input
          {...shared}
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete={autoComplete}
          readOnly={readOnly}
          disabled={disabled}
          maxLength={maxLength}
          className={`${fieldClass} ${inputClassName}`}
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
