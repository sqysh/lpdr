import Image from 'next/image'
import { FC, memo, MouseEventHandler } from 'react'

interface PictureProps {
  src: string
  alt?: string
  className?: string
  priority?: boolean
  onClick?: MouseEventHandler<HTMLImageElement>
  width?: number
  height?: number
  sizes?: string
  role?: string
  decorative?: boolean
  style?: any
  unoptimized?: boolean
}

const Picture: FC<PictureProps> = ({
  src,
  alt,
  className,
  priority = false,
  onClick,
  width,
  height,
  sizes = '100vw',
  role,
  decorative = false,
  style,
  unoptimized = true
}) => {
  const resolvedAlt = decorative ? '' : alt || 'Little Paws Dachshund Rescue'
  const ariaHidden = decorative ? true : undefined

  return (
    <Image
      onClick={onClick}
      src={src || '/images/no-img.jpg'}
      alt={resolvedAlt}
      width={width || 1}
      height={height || 1}
      className={className}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      sizes={sizes}
      unoptimized={unoptimized}
      role={role}
      aria-hidden={ariaHidden}
      style={style}
    />
  )
}

export default memo(Picture)
