'use client'

import { ReactNode } from 'react'

export type Column<T> = {
  header: string
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  caption?: string
  emptyMessage?: ReactNode
  rowClassName?: (row: T) => string
  onRowClick?: (row: T) => void
}

const defaultRowClass = 'group hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors'

export default function AdminTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  emptyMessage = 'No results',
  rowClassName,
  onRowClick
}: Props<T>) {
  return (
    <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-x-auto">
      <table className="w-full text-left">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border-light dark:border-border-dark">
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className={`px-4 py-2.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark font-normal whitespace-nowrap ${
                  col.headerClassName ?? ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light dark:divide-border-dark">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={rowClassName?.(row) ?? defaultRowClass}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onRowClick(row)
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
            >
              {columns.map((col, i) => (
                <td key={i} className={`px-4 py-3 ${col.className ?? ''}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
