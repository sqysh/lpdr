import Picture from 'app/components/_common/Picture'
import { Package } from 'lucide-react'
import { IAuctionItem } from 'types/_auction-item'

export function ItemStrip({ items }: { items: IAuctionItem[] }) {
  const shown = items.slice(0, 4)
  const extra = items.length - shown.length

  return (
    <div className="flex items-center gap-1.5">
      {shown.map((item) => {
        const photo = item.photos.find((p) => p.isPrimary) ?? item.photos[0]
        return (
          <div
            key={item.id}
            className="w-10 h-10 shrink-0 border border-border-light dark:border-border-dark overflow-hidden bg-surface-light dark:bg-surface-dark"
          >
            {photo ? (
              <Picture priority={false} src={photo.url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={12} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
              </div>
            )}
          </div>
        )
      })}
      {extra > 0 && (
        <div className="w-10 h-10 shrink-0 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-center">
          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">+{extra}</span>
        </div>
      )}
    </div>
  )
}
