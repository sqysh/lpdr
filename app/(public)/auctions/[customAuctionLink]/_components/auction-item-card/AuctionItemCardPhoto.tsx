import Picture from 'components/_common/Picture'

export function AuctionItemCardPhoto({ isEnded, isSold, item }) {
  const photo = item.photos.find((p) => p.isPrimary) ?? item.photos[0]
  return (
    <div className="relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark">
      {photo ? (
        <Picture
          priority={true}
          src={photo.url}
          alt={item.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${isSold || isEnded ? 'grayscale' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
            aria-hidden="true"
          />
          <span className="font-quicksand font-black text-2xl text-primary-light/20 dark:text-primary-dark/20 select-none">LP</span>
        </div>
      )}
    </div>
  )
}
