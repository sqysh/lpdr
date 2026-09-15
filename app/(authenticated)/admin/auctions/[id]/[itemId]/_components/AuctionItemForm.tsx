'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateAuctionItem } from 'lib/actions/admin/auction/updateAuctionItem'
import { deleteAuctionItem } from 'lib/actions/admin/auction/deleteAuctionItem'
import { createAuctionItem } from 'lib/actions/admin/auction/createAuctionItem'
import { uploadFileToFirebase } from 'lib/firebase/firebase.utils'
import { createAuctionItemFormSchema, toAuctionItemPayload, type CreateAuctionItemFormValues } from 'lib/schemas/auction.schema'
import type { SellingFormat } from 'types/auction.types'
import { IAuctionItemPhoto } from 'types/auction-item-photo'
import { AuctionStatus } from '@prisma/client'
import { AuctionItemDangerZone } from './AuctionItemDangerZone'
import { AuctionItemFormHeader } from './AuctionItemFormHeader'
import { AuctionItemFormTitleBand } from './AuctionItemFormTitleBand'
import { AuctionItemFields } from './AuctionItemFields'
import { AuctionItemPhotoPanel } from './AuctionItemPhotoPanel'
import { useStatusMessage } from '@hooks/useStatusMessage.hook'
import { buildSummary } from '../_lib/buildSummary'

type Props = {
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
    photos: IAuctionItemPhoto[]
  }
  auctionId: string
  type: SellingFormat
  auctionStatus: AuctionStatus
}

interface PendingPhoto {
  file: File
  previewUrl: string
}

export function AuctionItemForm({ auctionItem, auctionId, type, auctionStatus }: Props) {
  const router = useRouter()
  const { status, flash, clearStatus } = useStatusMessage()

  const isUpdating = !!auctionItem
  const isActive = auctionStatus === 'ACTIVE'
  const showBuyNow = type === 'FIXED'

  const DEFAULT_VALUES = {
    name: auctionItem?.name ?? '',
    description: auctionItem?.description ?? '',
    sellingFormat: auctionItem?.sellingFormat ?? type,
    startingPrice: auctionItem?.startingPrice?.toString() ?? '',
    buyNowPrice: auctionItem?.buyNowPrice?.toString() ?? '',
    totalQuantity: auctionItem?.totalQuantity?.toString() ?? '1',
    requiresShipping: auctionItem?.requiresShipping ?? true,
    shippingCosts: auctionItem?.shippingCosts?.toString() ?? ''
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<CreateAuctionItemFormValues>({
    resolver: zodResolver(createAuctionItemFormSchema),
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES
  })

  // The title band echoes the name as it is typed, so it subscribes to that one field.
  const itemName = useWatch({ control, name: 'name' })

  // Photos stay outside the form: they are files mid-upload until save, not values to validate.
  const [photos, setPhotos] = useState<IAuctionItemPhoto[]>(auctionItem?.photos ?? [])
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  const [deleting, setDeleting] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const onSubmit = async (values: CreateAuctionItemFormValues) => {
    clearStatus()

    let uploaded: string[] = []
    if (pendingPhotos.length > 0) {
      try {
        uploaded = await Promise.all(pendingPhotos.map(({ file }) => uploadFileToFirebase(file, setUploadProgress)))
      } catch {
        setUploadProgress(0)
        flash({ tone: 'error', message: 'The photos did not upload, so nothing was saved. Try again.' })
        return
      }
    }

    const payload = toAuctionItemPayload(values, { auctionId, photos: uploaded })
    const result = isUpdating ? await updateAuctionItem(auctionItem!.id, payload) : await createAuctionItem(payload)

    if (!result.success) {
      flash({ tone: 'error', message: result.error ?? 'Something went wrong.' })
      return
    }

    if (isUpdating) {
      flash({ tone: 'success', message: `${payload.name} updated`, description: buildSummary(payload, uploaded.length) })
      // reset with the saved values so the form is no longer dirty and the refresh can't clobber typing.
      reset(values)
      setUploadProgress(0)
      setPendingPhotos([])
      router.refresh()
      return
    }

    router.push(`/admin/auctions/${auctionId}?tab=items&type=${result.data.sellingFormat}`)
  }

  const handleDelete = async () => {
    if (!confirmDel) {
      setConfirmDel(true)
      return
    }

    setDeleting(true)
    const result = await deleteAuctionItem(auctionItem!.id, auctionId)

    if (!result.success) {
      flash({ tone: 'error', message: result.error ?? 'Failed to delete item.' })
      setDeleting(false)
      setConfirmDel(false)
      return
    }

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
          <AuctionItemFormTitleBand auctionId={auctionId} auctionItemId={auctionItem?.id} isUpdating={isUpdating} itemName={itemName} />

          {/* Body */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 xl:gap-8 items-start pb-6"
          >
            {/* Left: fields */}
            <AuctionItemFields
              auctionId={auctionId}
              control={control}
              status={status}
              isActive={isActive}
              isUpdating={isUpdating}
              isSubmitting={isSubmitting}
              uploadProgress={uploadProgress}
              type={type}
              showBuyNow={showBuyNow}
            />

            {/* Right: photos and danger zone */}
            <div className="flex flex-col gap-5 min-w-0">
              <AuctionItemPhotoPanel
                auctionId={auctionId}
                auctionItemId={auctionItem?.id}
                isUpdating={isUpdating}
                photos={photos}
                pendingPhotos={pendingPhotos}
                onPatchPhotos={setPhotos}
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
          </form>
        </div>
      </div>
    </main>
  )
}
