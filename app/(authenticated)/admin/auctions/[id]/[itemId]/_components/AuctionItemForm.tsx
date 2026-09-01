'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateAuctionItem } from 'lib/actions/admin/auction/updateAuctionItem'
import { deleteAuctionItem } from 'lib/actions/admin/auction/deleteAuctionItem'
import { uploadFileToFirebase } from 'lib/firebase/firebase.utils'
import { formatMoney } from 'lib/utils/currency.utils'
import { store } from 'lib/store/store'
import { showToast } from 'lib/store/slices/toastSlice'
import type { SellingFormat } from 'types/_auction-item'
import { IAuctionItemPhoto } from 'types/_auction-item-photo'
import { AuctionItemDangerZone } from './AuctionItemDangerZone'
import { createAuctionItem } from 'lib/actions/admin/auction/createAuctionItem'
import { AuctionStatus } from '@prisma/client'
import { AuctionItemFormHeader } from './AuctionItemFormHeader'
import { AuctionItemFormTitleBand } from './AuctionItemFormTitleBand'
import { AuctionItemFields } from './AuctionItemFields'
import { AuctionItemPhotoPanel } from './AuctionItemPhotoPanel'

interface FormInputs {
  name: string
  description: string
  sellingFormat: SellingFormat
  startingPrice: string
  buyNowPrice: string
  totalQuantity: string
  requiresShipping: boolean
  shippingCosts: string
  photos: IAuctionItemPhoto[]
}

export interface FormErrors {
  name?: string
  startingPrice?: string
  buyNowPrice?: string
  form?: string
}

interface PendingPhoto {
  file: File
  previewUrl: string
}

function validate(inputs: FormInputs, type: SellingFormat): FormErrors {
  const errs: FormErrors = {}
  if (!inputs.name.trim()) errs.name = 'Name is required'
  if (type === 'AUCTION' && !inputs.startingPrice) errs.startingPrice = 'Starting price is required'
  if (type === 'FIXED' && !inputs.buyNowPrice) errs.buyNowPrice = 'Buy now price is required'
  return errs
}

export function AuctionItemForm({
  auctionItem,
  auctionId,
  type,
  auctionStatus
}: {
  auctionItem: {
    id: string
    name: string
    description: string
    sellingFormat: SellingFormat
    startingPrice: number
    buyNowPrice: number
    totalQuantity: number
    requiresShipping: boolean
    shippingCosts: number
    photos: any
  }
  auctionId: string
  type: SellingFormat
  auctionStatus: AuctionStatus
}) {
  const router = useRouter()

  const isUpdating = !!auctionItem
  const isActive = auctionStatus === 'ACTIVE'
  const showBuyNow = type === 'FIXED'

  const [inputs, setInputs] = useState<FormInputs>(() => ({
    name: auctionItem?.name ?? '',
    description: auctionItem?.description ?? '',
    sellingFormat: auctionItem?.sellingFormat ?? type,
    startingPrice: auctionItem?.startingPrice?.toString() ?? '',
    buyNowPrice: auctionItem?.buyNowPrice?.toString() ?? '',
    totalQuantity: auctionItem?.totalQuantity?.toString() ?? '1',
    requiresShipping: auctionItem?.requiresShipping ?? true,
    shippingCosts: auctionItem?.shippingCosts?.toString() ?? '',
    photos: auctionItem?.photos ?? []
  }))

  const patch = (data: Partial<FormInputs>) => setInputs((prev) => ({ ...prev, ...data }))

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => patch({ [e.target.name]: e.target.value } as Partial<FormInputs>)

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const handleSave = async () => {
    const errs = validate(inputs, type)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setErrors({})

    let photos: string[] = []
    if (pendingPhotos.length > 0) {
      try {
        photos = await Promise.all(
          pendingPhotos.map(({ file }) =>
            uploadFileToFirebase(file, (progress) => setUploadProgress(progress))
          )
        )
      } catch {
        setErrors({ form: 'Failed to upload photos. Please try again.' })
        setLoading(false)
        return
      }
    }

    const payload = {
      auctionId,
      name: inputs.name.trim(),
      description: inputs.description.trim() || null,
      sellingFormat: inputs.sellingFormat,
      startingPrice: inputs.startingPrice ? Number(inputs.startingPrice) : null,
      buyNowPrice: inputs.buyNowPrice ? Number(inputs.buyNowPrice) : null,
      totalQuantity: inputs.totalQuantity ? Number(inputs.totalQuantity) : 1,
      requiresShipping: inputs.requiresShipping,
      shippingCosts: inputs.shippingCosts ? Number(inputs.shippingCosts) : null,
      photos
    }

    const result = isUpdating
      ? await updateAuctionItem(auctionItem!.id, payload)
      : await createAuctionItem(payload)

    if (!result.success) {
      setErrors({ form: result.error ?? 'Something went wrong.' })
      setLoading(false)
      return
    }

    const price =
      payload.sellingFormat === 'AUCTION'
        ? payload.startingPrice != null
          ? `starting at ${formatMoney(payload.startingPrice)}`
          : null
        : payload.buyNowPrice != null
          ? `${formatMoney(payload.buyNowPrice)} each`
          : null

    const shipping = payload.requiresShipping
      ? payload.shippingCosts != null
        ? `+${formatMoney(payload.shippingCosts)} shipping`
        : 'shipping TBD'
      : 'no shipping'

    store.dispatch(
      showToast({
        type: 'success',
        message: `${payload.name} ${isUpdating ? 'updated' : 'created'}`,
        description:
          [
            payload.sellingFormat === 'AUCTION' ? 'Auction item' : 'Instant buy',
            price,
            shipping,
            photos.length > 0
              ? `${photos.length} photo${photos.length === 1 ? '' : 's'} added`
              : null
          ]
            .filter(Boolean)
            .join(' · ') || undefined,
        duration: 5000
      })
    )

    if (isUpdating) {
      router.refresh()
      setLoading(false)
      setUploadProgress(0)
      setPendingPhotos([])
    } else {
      router.push(`/admin/auctions/${auctionId}?tab=items&type=${result.data.sellingFormat}`)
    }
  }

  const handleDelete = async () => {
    if (!confirmDel) {
      setConfirmDel(true)
      return
    }

    setDeleting(true)
    const result = await deleteAuctionItem(auctionItem!.id, auctionId)

    if (!result.success) {
      setErrors({ form: result.error ?? 'Failed to delete item.' })
      setDeleting(false)
      setConfirmDel(false)
      return
    }

    store.dispatch(showToast({ type: 'success', message: `${auctionItem!.name} deleted` }))
    router.push(`/admin/auctions/${auctionId}?tab=items&type=${auctionItem!.sellingFormat}`)
  }

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AuctionItemFormHeader
        auctionId={auctionId}
        auctionItemSellingFormat={auctionItem?.sellingFormat}
        isUpdating={isUpdating}
        isActive={isActive}
      />

      <div className="w-full px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AuctionItemFormTitleBand
            auctionId={auctionId}
            auctionItemId={auctionItem?.id}
            isUpdating={isUpdating}
            itemName={inputs.name}
          />

          {/* Body */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 xl:gap-8 items-start pb-6">
            {/* Left — fields */}
            <AuctionItemFields
              auctionId={auctionId}
              isActive={isActive}
              isUpdating={isUpdating}
              loading={loading}
              uploadProgress={uploadProgress}
              type={type}
              showBuyNow={showBuyNow}
              inputs={inputs}
              errors={errors}
              handleInput={handleInput}
              patch={patch}
              onSave={handleSave}
            />

            {/* Right — photos & danger zone */}
            <div className="space-y-5 min-w-0">
              <AuctionItemPhotoPanel
                auctionId={auctionId}
                auctionItemId={auctionItem?.id}
                isUpdating={isUpdating}
                photos={inputs.photos}
                pendingPhotos={pendingPhotos}
                onPatchPhotos={(photos) => patch({ photos })}
                onSetPendingPhotos={setPendingPhotos}
              />

              {isUpdating && auctionStatus === 'DRAFT' && (
                <AuctionItemDangerZone
                  deleting={deleting}
                  confirmDel={confirmDel}
                  onDelete={handleDelete}
                  onCancelDelete={() => setConfirmDel(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
