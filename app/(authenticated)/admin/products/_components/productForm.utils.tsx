export type SizeEntry = { size: string; quantity: number }

export interface FormState {
  name: string
  description: string
  price: string
  shippingPrice: string
  countInStock: string
  isPhysicalProduct: boolean
  isLive: boolean
  images: string[]
  sizes: SizeEntry[]
}

export const inputCls = `
  w-full px-3 py-2.5 text-[11px] font-mono
  bg-bg-light dark:bg-bg-dark
  border border-border-light dark:border-border-dark
  text-text-light dark:text-text-dark
  placeholder:text-muted-light dark:placeholder:text-muted-dark
  focus:outline-none focus:border-primary-light dark:focus:border-primary-dark
  transition-colors
`

export const labelCls = `
  block text-[10px] font-mono tracking-[0.15em] uppercase
  text-muted-light dark:text-muted-dark mb-1.5
`

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

export function SectionHeader({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border-light dark:border-border-dark">
      <div className="w-1 h-3.5 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
      <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
        {title}
      </h2>
      {aside && <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark ml-auto">{aside}</span>}
    </div>
  )
}
