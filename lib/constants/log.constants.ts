import { Level } from 'types/log.types'

export const PAGE_SIZE = 50

export const LEVELS = ['all', 'info', 'warn', 'error'] as const

export const LEVEL_STYLES: Record<Level, string> = {
  all: '',
  info: 'text-primary-dark',
  warn: 'text-secondary-dark',
  error: 'text-red-400'
}
