'use client'

import Picture from 'components/_common/Picture'
import { deleteAuctionItemPhoto } from 'lib/actions/admin/auction/deleteAuctionItemPhoto'
import { setPrimaryAuctionItemPhoto } from 'lib/actions/admin/auction/setPrimaryAuctionItemPhoto'
import { convertIfHeic } from 'lib/utils/image.utils'
import { ImagePlus, Star, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IAuctionItemPhoto } from 'types/auction-item-photo'

type PendingPhoto = {
  file: File
  previewUrl: string
}

type Props = {
  auctionId: string
  auctionItemId?: string
  isUpdating: boolean
  photos: IAuctionItemPhoto[]
  pendingPhotos: PendingPhoto[]
  onPatchPhotos: (photos: IAuctionItemPhoto[]) => void
  onSetPendingPhotos: React.Dispatch<React.SetStateAction<PendingPhoto[]>>
}

export function AuctionItemPhotoPanel({
  auctionId,
  auctionItemId,
  isUpdating,
  photos,
  pendingPhotos,
  onPatchPhotos,
  onSetPendingPhotos
}: Props) {
  const router = useRouter()

  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark">
        <h3 className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
          Photos
        </h3>
      </div>
      {/* Existing + pending photos grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Existing photos */}
        {isUpdating &&
          photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square border border-border-light dark:border-border-dark overflow-hidden"
            >
              <Picture
                priority={false}
                src={photo.url}
                alt={photo.name ?? 'Photo'}
                className="w-full h-full object-cover"
              />
              {photo.isPrimary && (
                <span className="absolute top-1 left-1 text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 bg-primary-light dark:bg-primary-dark text-white">
                  Primary
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.isPrimary && (
                  <button
                    type="button"
                    onClick={async () => {
                      await setPrimaryAuctionItemPhoto(photo.id, auctionItemId!, auctionId)
                      router.refresh()
                      onPatchPhotos(photos.map((p) => ({ ...p, isPrimary: p.id === photo.id })))
                    }}
                    aria-label="Set as primary photo"
                    className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-primary-light dark:hover:bg-primary-dark text-white backdrop-blur-sm transition-colors"
                  >
                    <Star size={13} aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await deleteAuctionItemPhoto(photo.id, auctionId)
                    router.refresh()
                    onPatchPhotos(photos.filter((p) => p.id !== photo.id))
                  }}
                  aria-label="Remove photo"
                  className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-red-500 text-white backdrop-blur-sm transition-colors"
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}

        {/* Pending photos */}
        {pendingPhotos.map(({ file, previewUrl }, i) => (
          <div
            key={`${file.name}-${i}`}
            className="relative group aspect-square border border-border-light dark:border-border-dark overflow-hidden"
          >
            <Picture
              priority={false}
              src={previewUrl}
              alt={file.name}
              className="w-full h-full object-cover"
            />
            {i === 0 && !isUpdating && (
              <span className="absolute top-1 left-1 text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 bg-primary-light dark:bg-primary-dark text-white">
                Primary
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(previewUrl)
                onSetPendingPhotos((prev) => prev.filter((_, idx) => idx !== i))
              }}
              className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Remove ${file.name}`}
            >
              <X size={10} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {/* File input */}
      <label
        htmlFor="photos"
        className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark text-[10px] font-mono tracking-[0.2em] uppercase cursor-pointer transition-colors"
      >
        <ImagePlus size={13} aria-hidden="true" />
        {pendingPhotos.length > 0 ? `${pendingPhotos.length} selected — add more` : 'Select photos'}
      </label>
      <input
        id="photos"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? [])
          const pending = await Promise.all(
            files.map(async (file) => {
              const converted = await convertIfHeic(file)
              return { file: converted, previewUrl: URL.createObjectURL(converted) }
            })
          )
          onSetPendingPhotos((prev) => [...prev, ...pending])
          e.target.value = ''
        }}
      />
    </section>
  )
}
