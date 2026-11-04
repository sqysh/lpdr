'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import { OrderType } from '@prisma/client'
import { useSearchParams } from 'next/navigation'
import { fadeUp } from 'lib/constants/motion.constants'
import { StepSignIn } from 'components/features/payment/SignInStep'
import { SignedInRow } from 'components/features/payment/SignedInRow'
import { formatMoney, formatWithCommas } from 'lib/utils/currency.utils'
import { IPaymentMethod } from 'types/payment-method.types'
import { FormError, FormField, SubmitButton } from 'components/_primitives'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { CardElementField } from 'components/features/payment/CardElementField'
import { StripeSecurityNote } from 'components/features/payment/StripeSecurityNote'
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { useStripeCheckout } from '@hooks/useStripeCheckout.hook'
import { memorialFormSchema, MemorialFormInput, MemorialFormValues } from 'lib/schemas/memorial.schema'
import { AmountState } from 'app/(public)/donate/_components/DonateForm'
import { uploadFileToFirebase } from 'lib/firebase/firebase.utils'
import { CustomAmount } from 'app/(public)/donate/_components/CustomAmount'
import { DonateSaveCardToggle } from 'app/(public)/donate/_components'

export type MemorialFormSettings = {
  fixedAmount: number | null
  minAmount: number
  suggestedAmounts: number[]
  allowMessage: boolean
  messageMaxLength: number
  allowPhoto: boolean
  allowDonorName: boolean
  requireApproval: boolean
  displayDays: number | null
}

type Props = {
  settings: MemorialFormSettings
  savedCards: IPaymentMethod[]
  userName: { firstName?: string; lastName?: string } | null
  isAuthed: boolean
  email: string | null
  userId: string | null
}

const FORM_PATH = '/rainbow-bridge/remember'

const MAX_PHOTO_BYTES = 25 * 1024 * 1024
const MAX_GIF_BYTES = 5 * 1024 * 1024
const PHOTO_EDGE = 1600

type PhotoState = { preview: string | null; url: string | null; progress: number | null; error: string | null }
const EMPTY_PHOTO: PhotoState = { preview: null, url: null, progress: null, error: null }

// Some browsers report HEIC with an empty type, so the file extension is checked too
const isHeic = (file: File) => /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
const isGif = (file: File) => file.type === 'image/gif'

// Only Safari can open HEIC itself, so it is converted first; the converter loads only when needed
async function heicToJpeg(file: File) {
  const { heicTo } = await import('heic-to/csp')
  const blob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 })
  return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
}

// Phone photos are often 5-12MB. Redrawing to a 1600px JPEG keeps uploads quick on cellular,
// and it drops the EXIF data, which can include where the photo was taken
async function shrinkPhoto(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, PHOTO_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Could not read photo')
  return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
}

export function MemorialForm({ settings, savedCards, userName, isAuthed, email, userId }: Props) {
  const presets = settings.suggestedAmounts
  const isFixed = settings.fixedAmount != null

  // Signing in leaves the page, so the name and amount ride along in the redirect and come back here
  const searchParams = useSearchParams()
  const seededDog = searchParams.get('dogName') ?? ''
  const seededParam = Number(searchParams.get('amount'))
  const seeded = Number.isFinite(seededParam) && seededParam > 0 ? seededParam : null
  const seededIsPreset = seeded !== null && presets.includes(seeded)

  const [amount, setAmount] = useState<AmountState>({
    useCustom: seeded !== null && !seededIsPreset,
    customAmount: seeded !== null && !seededIsPreset ? String(seeded) : '',
    selectedAmount: seeded !== null && seededIsPreset ? seeded : (presets[0] ?? null)
  })

  const patchAmount = (data: Partial<AmountState>) => setAmount((prev) => ({ ...prev, ...data }))

  const schema = useMemo(() => memorialFormSchema(settings.messageMaxLength), [settings.messageMaxLength])
  const fullName = [userName?.firstName, userName?.lastName].filter(Boolean).join(' ')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<MemorialFormInput, unknown, MemorialFormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      firstName: userName?.firstName ?? '',
      lastName: userName?.lastName ?? '',
      dogName: seededDog,
      message: '',
      donorDisplayName: fullName,
      showDonorName: true
    }
  })

  const values = useWatch({ control })

  const { payment, patch, usingSavedCard, pay } = useStripeCheckout({
    savedCards,
    isAuthed,
    userId: userId ?? '',
    billingName: `${values.firstName} ${values.lastName}`,
    billingEmail: email ?? ''
  })

  const [photo, setPhoto] = useState<PhotoState>(EMPTY_PHOTO)
  // Picking a second photo while the first is still uploading must not let the first one win
  const uploadRun = useRef(0)
  const uploading = photo.progress !== null

  useEffect(() => {
    return () => {
      if (photo.preview) URL.revokeObjectURL(photo.preview)
    }
  }, [photo.preview])

  const removePhoto = () => {
    uploadRun.current++
    setPhoto(EMPTY_PHOTO)
  }

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/') && !isHeic(file)) return setPhoto({ ...EMPTY_PHOTO, error: 'Please choose a photo.' })
    if (file.size > MAX_PHOTO_BYTES) return setPhoto({ ...EMPTY_PHOTO, error: 'That photo is too large. Please choose another one.' })
    if (isGif(file) && file.size > MAX_GIF_BYTES)
      return setPhoto({ ...EMPTY_PHOTO, error: 'That GIF is too large. Please choose one under 5MB.' })

    const run = ++uploadRun.current
    setPhoto({ preview: null, url: null, progress: 0, error: null })

    try {
      // GIFs go up as they are so they stay animated; everything else becomes a resized JPEG
      const upload = isGif(file) ? file : await shrinkPhoto(isHeic(file) ? await heicToJpeg(file) : file)
      if (run !== uploadRun.current) return

      // Previewing the prepared file rather than the original, since a HEIC original won't display in most browsers
      setPhoto((prev) => ({ ...prev, preview: URL.createObjectURL(upload) }))

      const url = await uploadFileToFirebase(
        upload,
        (progress) => run === uploadRun.current && setPhoto((prev) => ({ ...prev, progress })),
        'image',
        `memorials/${crypto.randomUUID()}.${isGif(file) ? 'gif' : 'jpg'}`
      )
      if (run === uploadRun.current) setPhoto((prev) => ({ ...prev, url, progress: null }))
    } catch {
      if (run === uploadRun.current) {
        setPhoto({ ...EMPTY_PHOTO, error: "That photo didn't upload. Please try again or choose another one." })
      }
    }
  }

  const giftAmount = settings.fixedAmount ?? (amount.useCustom ? parseFloat(amount.customAmount) || 0 : (amount.selectedAmount ?? 0))
  const meetsMinimum = giftAmount >= settings.minAmount
  const processingFee = calculateStripeFees(giftAmount)
  const finalAmount = payment.coverFees ? giftAmount + processingFee : giftAmount
  const enteringNewCard = !isAuthed || savedCards.length === 0 || payment.useNewCard
  const dogName = values.dogName?.trim() ?? ''
  const messageLength = values.message?.length ?? 0
  const messageMax = Math.min(settings.messageMaxLength, 500)

  const isValid =
    meetsMinimum &&
    !!dogName &&
    !!values.firstName?.trim() &&
    !!values.lastName?.trim() &&
    messageLength <= messageMax &&
    !uploading &&
    (usingSavedCard ? true : payment.cardComplete)

  const onSubmit = (data: MemorialFormValues) =>
    pay({
      amount: Math.round(giftAmount * 100),
      coverFees: payment.coverFees,
      orderType: 'MEMORIAL_DONATION' as OrderType,
      memorial: {
        dogName: data.dogName,
        ...(settings.allowMessage && data.message && { message: data.message }),
        ...(settings.allowPhoto && photo.url && { photoUrl: photo.url }),
        ...(settings.allowDonorName && {
          showDonorName: data.showDonorName,
          ...(data.showDonorName && data.donorDisplayName && { donorDisplayName: data.donorDisplayName })
        })
      }
    })

  const signInRedirect = `${FORM_PATH}?${new URLSearchParams({
    ...(dogName && { dogName }),
    ...(!isFixed && giftAmount > 0 && { amount: String(giftAmount) })
  })}`

  const reviewNote = [
    settings.requireApproval
      ? 'Memorials appear on the Rainbow Bridge after a quick review'
      : 'Your memorial appears on the Rainbow Bridge right away',
    settings.displayDays ? ` and stay up for ${settings.displayDays} days.` : '.'
  ].join('')

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Rainbow Bridge memorial gift form" className="w-full space-y-5">
      <FormField
        id="memorial-dogName"
        label="Your dog's name"
        {...register('dogName')}
        placeholder="Biscuit"
        autoComplete="off"
        maxLength={60}
        hint="Shown on the butterfly exactly as you type it."
        error={errors.dogName?.message}
        required
      />

      {!isFixed && presets.length > 0 && (
        <div role="group" aria-label="Gift amount" className="grid grid-cols-3 gap-2">
          {presets.map((value) => {
            const active = !amount.useCustom && amount.selectedAmount === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => patchAmount({ selectedAmount: value, useCustom: false, customAmount: '' })}
                className={`py-3 border font-quicksand font-black text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                  active
                    ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark bg-surface-light dark:bg-surface-dark'
                    : 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark'
                }`}
              >
                ${formatWithCommas(value)}
              </button>
            )
          })}
        </div>
      )}

      {!isFixed && <CustomAmount amount={amount} patchAmount={patchAmount} min={settings.minAmount} />}

      {meetsMinimum && (
        <motion.div
          key={`${giftAmount}-${dogName}`}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 px-4 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
        >
          <span className="text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark">Giving</span>
          <span className="font-quicksand font-black text-2xl text-primary-light dark:text-primary-dark">
            ${formatWithCommas(giftAmount)}
          </span>
          {dogName && <span className="text-sm text-muted-light dark:text-muted-dark">in memory of {dogName}</span>}
        </motion.div>
      )}

      {!isAuthed && <StepSignIn redirectTo={signInRedirect} />}

      {isAuthed && <SignedInRow />}

      {isAuthed && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="space-y-5">
          {settings.allowPhoto && (
            <div>
              <p className="block text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark mb-2">
                A photo of {dogName || 'them'}
                <span className="ml-1 text-muted-light/60 dark:text-muted-dark/60 normal-case tracking-normal font-sans">(optional)</span>
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0 overflow-hidden border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-center">
                  {photo.preview ? (
                    <Image src={photo.preview} alt="" fill unoptimized className="object-cover" />
                  ) : (
                    <ImagePlus className="w-6 h-6 text-muted-light dark:text-muted-dark" aria-hidden="true" />
                  )}
                  {uploading && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" aria-hidden="true">
                      <div
                        className="h-full bg-primary-light dark:bg-primary-dark transition-[width]"
                        style={{ width: `${photo.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <input
                      id="memorial-photo"
                      type="file"
                      accept="image/*,.heic,.heif"
                      className="peer sr-only"
                      onChange={(e) => {
                        handlePhoto(e.target.files?.[0])
                        e.target.value = ''
                      }}
                    />
                    <label
                      htmlFor="memorial-photo"
                      className="cursor-pointer text-[11px] font-mono uppercase tracking-tag text-primary-light dark:text-primary-dark hover:underline underline-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-light dark:peer-focus-visible:ring-primary-dark"
                    >
                      {photo.preview ? 'Choose a different photo' : 'Choose a photo'}
                    </label>
                    {photo.preview && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="text-[11px] font-mono uppercase tracking-tag text-muted-light dark:text-muted-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p
                    role={photo.error ? 'alert' : undefined}
                    aria-live="polite"
                    className={`text-[11px] font-mono ${photo.error ? 'text-red-500 dark:text-red-400' : 'text-muted-light dark:text-muted-dark'}`}
                  >
                    {photo.error ??
                      (uploading
                        ? `Uploading ${Math.round(photo.progress ?? 0)}%`
                        : photo.url
                          ? 'Added. It will appear with their memorial.'
                          : 'Shown with their memorial on the Rainbow Bridge.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
            <FormField
              id="memorial-firstName"
              label="First Name"
              {...register('firstName')}
              placeholder="Jane"
              autoComplete="given-name"
              error={errors.firstName?.message}
              required
            />
            <FormField
              id="memorial-lastName"
              label="Last Name"
              {...register('lastName')}
              placeholder="Smith"
              autoComplete="family-name"
              error={errors.lastName?.message}
              required
            />
          </div>

          <FormField
            id="memorial-email"
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={() => {}}
            autoComplete="email"
            disabled
            readOnly
            hint="Using your signed-in account email."
          />

          {settings.allowMessage && (
            <FormField
              id="memorial-message"
              label="A few words about them"
              type="textarea"
              rows={4}
              maxLength={messageMax}
              {...register('message')}
              placeholder="She loved sunny windowsills and stealing socks..."
              hint={`Optional. ${messageLength}/${messageMax} characters.`}
              error={errors.message?.message}
            />
          )}

          {settings.allowDonorName && (
            <div className="space-y-3">
              <label htmlFor="memorial-showDonor" className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  id="memorial-showDonor"
                  type="checkbox"
                  {...register('showDonorName')}
                  className="w-4 h-4 accent-primary-light dark:accent-primary-dark"
                />
                Show my name on the memorial
              </label>

              {values.showDonorName && (
                <FormField
                  id="memorial-donorDisplayName"
                  label="Name to show"
                  {...register('donorDisplayName')}
                  placeholder="The Smith Family"
                  maxLength={80}
                  hint="For example, your first name or your family name."
                  error={errors.donorDisplayName?.message}
                />
              )}
            </div>
          )}

          <SavedCardSelector
            savedCards={savedCards}
            selectedCardId={payment.selectedCardId}
            useNewCard={payment.useNewCard}
            onSelectCard={(id) => patch({ selectedCardId: id, useNewCard: false })}
            onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
            onUseSavedCard={() => patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })}
          />

          {enteringNewCard && (
            <CardElementField onChange={({ complete, error }) => patch({ cardComplete: complete, error: error ?? null })} />
          )}

          <CoverFeesToggle
            checked={payment.coverFees}
            onChange={() => patch({ coverFees: !payment.coverFees })}
            processingFee={processingFee}
          />

          <DonateSaveCardToggle
            checked={payment.saveCard}
            onToggle={() => patch({ saveCard: !payment.saveCard })}
            usingNewCard={enteringNewCard}
          />

          <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">{reviewNote}</p>

          <FormError error={payment.error} />

          <SubmitButton
            loading={payment.loading}
            isValid={isValid}
            label={uploading ? 'Waiting for photo...' : `Give ${formatMoney(finalAmount)}`}
          />
        </motion.div>
      )}

      <StripeSecurityNote />
    </form>
  )
}
