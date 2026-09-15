'use client'

import type { ComponentProps } from 'react'
import { useController, type Control, type FieldPathByValue, type FieldValues } from 'react-hook-form'
import { FormField } from './FormField'

/**
 * react-hook-form adapter for FormField. FieldPathByValue restricts `name` to the string-valued
 * fields on the form, so a boolean or array field can't be passed to a text input by mistake.
 */
type ControlledFieldProps<T extends FieldValues> = Omit<
  ComponentProps<typeof FormField>,
  'id' | 'name' | 'value' | 'onChange' | 'onBlur' | 'error'
> & {
  control: Control<T>
  name: FieldPathByValue<T, string>
  id?: string
}

export function ControlledField<T extends FieldValues>({ control, name, id, ...rest }: ControlledFieldProps<T>) {
  const { field, fieldState } = useController({ control, name })

  return (
    <FormField
      {...rest}
      id={id ?? name}
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )
}
