'use client'

import { Check, Dog, ImagePlus, LayoutDashboard, Loader2, Minus, Plus, X } from 'lucide-react'
import { IWelcomeWiener, WelcomeWienerProduct } from 'types/_welcome-wiener'
import {
  WELCOME_WIENER_CATALOG,
  WELCOME_WIENER_CATEGORIES,
  WELCOME_WIENER_CATEGORY_LABELS
} from 'lib/constants/welcome-wiener.constants'
import { store } from 'lib/store/store'
import { uploadFileToFirebase } from 'lib/firebase/firebase.utils'
import { showToast } from 'lib/store/slices/toastSlice'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateWelcomeWiener } from 'lib/actions/admin/welcome-wiener/updateWelcomeWiener'
import Link from 'next/link'
import { FormField, SectionLabel, Toggle } from 'app/components/_primitives'
import Picture from 'app/components/_common/Picture'
import { createWelcomeWiener } from 'lib/actions/admin/welcome-wiener/createWelcomeWiener'
import { DangerZone } from './DangerZone'
import { deleteWelcomeWiener } from 'lib/actions/admin/welcome-wiener/deleteWelcomeWiener'

type FormState = {
  name: string
  bio: string
  age: string
  isLive: boolean
  images: string[]
  associatedProducts: WelcomeWienerProduct[]
}

type FormErrors = Partial<Record<'name' | 'form', string>>

function initialState(welcomeWiener: IWelcomeWiener | null): FormState {
  return {
    name: welcomeWiener?.name ?? '',
    bio: welcomeWiener?.bio ?? '',
    age: welcomeWiener?.age ?? '',
    isLive: welcomeWiener?.isLive ?? false,
    images: welcomeWiener?.images ?? [],
    associatedProducts: welcomeWiener?.associatedProducts ?? []
  }
}

export function WelcomeWienerForm({ welcomeWiener }: { welcomeWiener: IWelcomeWiener | null }) {
  const router = useRouter()
  const isUpdating = !!welcomeWiener

  const [form, setForm] = useState<FormState>(() => initialState(welcomeWiener))
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([])

  const patch = (data: Partial<FormState>) => setForm((prev) => ({ ...prev, ...data }))

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => patch({ [e.target.name]: e.target.value } as Partial<FormState>)

  const associated = form.associatedProducts
  const isAdded = (id: string) => associated.some((p) => p.id === id)

  const toggleProduct = (product: WelcomeWienerProduct) => {
    patch({
      associatedProducts: isAdded(product.id)
        ? associated.filter((p) => p.id !== product.id)
        : [...associated, product]
    })
  }
  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrors({ name: 'Required' })
      return
    }
    setLoading(true)
    setErrors({})

    // Upload pending images
    let uploaded: string[] = []
    if (pendingPhotos.length > 0) {
      try {
        uploaded = await Promise.all(
          pendingPhotos.map((file) => uploadFileToFirebase(file, setUploadProgress))
        )
      } catch {
        setErrors({ form: 'Failed to upload images. Please try again.' })
        setLoading(false)
        return
      }
    }

    const payload = {
      name: form.name.trim(),
      bio: form.bio.trim() || undefined,
      age: form.age.trim() || undefined,
      isLive: form.isLive,
      images: [...form.images, ...uploaded],
      associatedProducts: associated
    }

    const result = isUpdating
      ? await updateWelcomeWiener(welcomeWiener!.id, payload)
      : await createWelcomeWiener(payload)

    if (!result.success) {
      setErrors({ form: result.error ?? 'Something went wrong.' })
      setLoading(false)
      return
    }

    store.dispatch(
      showToast({
        type: 'success',
        message: `${payload.name} ${isUpdating ? 'updated' : 'created'}`,
        description: [
          `${associated.length} donation product${associated.length === 1 ? '' : 's'}`,
          payload.isLive ? 'Live' : 'Draft'
        ].join(' · ')
      })
    )

    if (isUpdating) {
      router.refresh()
      setLoading(false)
      setPendingPhotos([])
    } else {
      router.push('/admin/welcome-wieners')
    }
  }

  return (
    <main id="main-content" className="min-h-dvh w-full bg-bg-light dark:bg-bg-dark">
      {/* ── Topbar ── */}
      <header className="fixed top-0 z-10 w-full border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur px-4 h-10 flex items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
          <Link
            href="/admin/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <LayoutDashboard className="w-3 h-3" aria-hidden="true" />
            Dashboard
          </Link>
          <span
            className="hidden sm:inline text-[9px] font-mono text-border-light dark:text-muted-dark/70"
            aria-hidden="true"
          >
            /
          </span>
          <Link
            href="/admin/welcome-wieners"
            className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark shrink-0"
          >
            Welcome Wieners
          </Link>
          <span
            className="text-[9px] font-mono text-border-light dark:text-muted-dark/70"
            aria-hidden="true"
          >
            /
          </span>
          <h1
            className="text-[9px] font-mono tracking-[0.15em] uppercase text-text-light dark:text-text-dark truncate"
            aria-current="page"
          >
            {isUpdating ? 'Edit Wiener' : 'New Wiener'}
          </h1>
        </nav>
      </header>

      <div className="w-full px-4 sm:px-6 pt-10 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* ── Title band ── */}
          <div className="flex items-center gap-3 pt-6 pb-4">
            <div className="w-8 h-8 flex items-center justify-center bg-primary-light/10 dark:bg-primary-dark/10 shrink-0">
              <Dog
                size={15}
                className="text-primary-light dark:text-primary-dark"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                Welcome Wiener
              </p>
              <h2 className="text-xl font-quicksand font-black text-text-light dark:text-text-dark leading-snug truncate">
                {isUpdating ? `Edit ${form?.name ?? 'Wiener'}` : 'Add Wiener'}
              </h2>
            </div>
          </div>

          {/* ── Body grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 xl:gap-8 items-start pb-6">
            {/* ════ Left — profile, settings, products ════ */}
            <div className="space-y-5 min-w-0">
              {errors?.form && (
                <p
                  role="alert"
                  className="px-4 py-3 border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-mono"
                >
                  {errors.form}
                </p>
              )}

              {/* ── Profile ── */}
              <SectionLabel>Profile</SectionLabel>

              <FormField
                id="ww-name"
                label="Name"
                name="name"
                value={form?.name ?? ''}
                onChange={handleInput}
                placeholder="Peanut"
                error={errors?.name}
                required
              />

              <FormField
                id="ww-bio"
                label="Bio"
                name="bio"
                type="textarea"
                value={form?.bio ?? ''}
                onChange={handleInput}
                placeholder="Tell this pup's story..."
                rows={6}
              />

              <FormField
                id="ww-age"
                label="Age"
                name="age"
                value={form?.age ?? ''}
                onChange={handleInput}
                placeholder="3 years"
              />

              {/* ── Donation products ── */}
              <SectionLabel>Donation Products</SectionLabel>
              <div className="space-y-6">
                {WELCOME_WIENER_CATEGORIES.map((category) => {
                  const items = WELCOME_WIENER_CATALOG.filter((p) => p.category === category)
                  return (
                    <div key={category}>
                      <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light/60 dark:text-muted-dark/60 mb-2">
                        {WELCOME_WIENER_CATEGORY_LABELS[category]}
                      </p>
                      <div className="space-y-1">
                        {items.map((product) => {
                          const added = isAdded(product.id)
                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => toggleProduct(product)}
                              aria-pressed={added}
                              className={`w-full flex items-center justify-between px-3.5 py-2.5 border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark text-left ${
                                added
                                  ? 'border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/5'
                                  : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary-light/50 dark:hover:border-primary-dark/50'
                              }`}
                            >
                              <div className="min-w-0">
                                <p
                                  className={`text-xs font-mono truncate ${added ? 'text-primary-light dark:text-primary-dark' : 'text-text-light dark:text-text-dark'}`}
                                >
                                  {product.name}
                                </p>
                                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5 truncate">
                                  {product.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 ml-4">
                                <span
                                  className={`text-xs font-mono font-bold tabular-nums ${added ? 'text-primary-light dark:text-primary-dark' : 'text-muted-light dark:text-muted-dark'}`}
                                >
                                  ${product.price}
                                </span>
                                <div
                                  className={`w-5 h-5 flex items-center justify-center border transition-colors duration-150 ${added ? 'border-primary-light dark:border-primary-dark bg-primary-light dark:bg-primary-dark' : 'border-border-light dark:border-border-dark'}`}
                                >
                                  {added ? (
                                    <Check
                                      className="w-3 h-3 text-white dark:text-bg-dark"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <Plus
                                      className="w-3 h-3 text-muted-light dark:text-muted-dark"
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ════ Right — images + selected summary ════ */}
            <div className="space-y-5 min-w-0">
              {/* ── Settings ── */}
              <SectionLabel>Settings</SectionLabel>
              <Toggle
                id="ww-isLive"
                label="Live"
                description="Visible to the public on the welcome wieners page"
                checked={form?.isLive ?? false}
                onToggle={() => patch({ isLive: !form.isLive })}
              />

              <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark">
                  <h3 className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                    Photos
                  </h3>
                </div>
                <div className="px-4 py-4 flex flex-col gap-1.5">
                  {/* Existing photos (edit mode) */}
                  {isUpdating && form?.images?.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {form?.images.map((photo: string, i: number) => (
                        <div
                          key={photo}
                          className="relative group aspect-square border border-border-light dark:border-border-dark overflow-hidden"
                        >
                          <Picture
                            priority={true}
                            src={photo}
                            alt={`Image ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              patch({ images: form.images.filter((url: string) => url !== photo) })
                            }
                            aria-label={`Remove image ${i + 1}`}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center focus:outline-none"
                          >
                            <X className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pending photos preview */}
                  {pendingPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {pendingPhotos.map((file, i) => (
                        <div
                          key={`${file.name}-${i}`}
                          className="relative group aspect-square border border-border-light dark:border-border-dark overflow-hidden"
                        >
                          <Picture
                            priority={false}
                            src={URL.createObjectURL(file)}
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
                            onClick={() =>
                              setPendingPhotos((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X size={10} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {loading && pendingPhotos.length > 0 ? (
                    <div className="px-4 py-3 border border-border-light dark:border-border-dark">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                          Uploading
                        </span>
                        <span className="text-[9px] font-mono text-primary-light dark:text-primary-dark tabular-nums">
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                      <div className="h-1 w-full bg-bg-light dark:bg-bg-dark overflow-hidden">
                        <div
                          className="h-1 bg-primary-light dark:bg-primary-dark transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <label
                        htmlFor="photos"
                        className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark text-[10px] font-mono tracking-[0.2em] uppercase cursor-pointer transition-colors"
                      >
                        <ImagePlus size={13} aria-hidden="true" />
                        {pendingPhotos.length > 0
                          ? `${pendingPhotos.length} selected — add more`
                          : 'Select photos'}
                      </label>
                      <input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? [])
                          setPendingPhotos((prev) => [...prev, ...files])
                          e.target.value = ''
                        }}
                      />
                    </>
                  )}
                </div>
              </section>

              {/* Selected summary card */}
              {associated.length > 0 && (
                <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                  <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                    <h3 className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                      Selected
                    </h3>
                    <span className="text-[9px] font-mono tabular-nums text-primary-light dark:text-primary-dark">
                      {associated.length}
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-1.5">
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-3">
                      Selected
                    </p>
                    <div className="space-y-1.5">
                      {associated.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-text-light dark:text-text-dark">
                            {p.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-primary-light dark:text-primary-dark tabular-nums">
                              ${p.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleProduct(p)}
                              aria-label={`Remove ${p.name}`}
                              className="text-muted-light dark:text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                            >
                              <Minus className="w-3 h-3" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                        <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                          Total
                        </span>
                        <span className="text-sm font-mono font-bold text-primary-light dark:text-primary-dark tabular-nums">
                          ${associated.reduce((sum, p) => sum + p.price, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <DangerZone
                label="Delete Welcome Wiener"
                description="Permanently removes this entry."
                confirmText="Delete this Welcome Wiener? This can't be undone."
                onDelete={() => deleteWelcomeWiener(welcomeWiener.id)}
                onDeleted={() => {
                  router.push('/admin/welcome-wieners')
                  router.refresh()
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky action bar — replaces the in-column Actions block ── */}
      <div className="fixed bottom-0 inset-x-0 z-20 w-full border-t border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
          {errors?.form && (
            <p
              role="alert"
              className="mr-auto text-[10px] font-mono text-red-500 dark:text-red-400 truncate"
            >
              {errors.form}
            </p>
          )}
          <Link
            href="/admin/welcome-wieners"
            className="px-4 py-2.5 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark text-[10px] font-mono tracking-[0.2em] uppercase hover:text-text-light dark:hover:text-text-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            aria-busy={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white dark:text-bg-dark text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />{' '}
                {isUpdating ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                <Dog size={13} aria-hidden="true" /> {isUpdating ? 'Save Changes' : 'Create Wiener'}
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
