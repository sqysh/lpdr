'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import Picture from 'components/_common/Picture'
import { uploadFileToFirebase } from 'lib/firebase/firebase.utils'
import { FormState, SectionHeader } from './productForm.utils'

type Props = {
  form: FormState
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}

export function ProductImagesSection({ form, set }: Props) {
  const [uploadingImages, setUploadingImages] = useState<{ file: File; progress: number; url?: string }[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadError(null)

    const newUploads = Array.from(files).map((file) => ({ file, progress: 0 }))
    setUploadingImages((prev) => [...prev, ...newUploads])

    await Promise.all(
      Array.from(files).map(async (file) => {
        try {
          const url = await uploadFileToFirebase(
            file,
            (progress) => {
              setUploadingImages((prev) => prev.map((u) => (u.file.name === file.name ? { ...u, progress } : u)))
            },
            'image'
          )
          setUploadingImages((prev) => prev.map((u) => (u.file.name === file.name ? { ...u, progress: 100, url } : u)))
          set('images', [...form.images, url])
        } catch {
          setUploadingImages((prev) => prev.filter((u) => u.file.name !== file.name))
          setUploadError(`${file.name} failed to upload. Please try again.`)
        }
      })
    )
  }

  const removeImage = (index: number) =>
    set(
      'images',
      form.images.filter((_, i) => i !== index)
    )

  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
      <SectionHeader title="Images" aside={`${form.images.length} uploaded`} />

      <label
        htmlFor="image-upload"
        className="flex flex-col items-center justify-center py-8 border border-dashed border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors cursor-pointer group mb-4"
      >
        <Upload
          className="w-6 h-6 text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors mb-2"
          aria-hidden="true"
        />
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark group-hover:text-text-light dark:group-hover:text-text-dark transition-colors">
          Click to upload images
        </p>
        <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark mt-1">Multiple files supported</p>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => handleImageFiles(e.target.files)}
        />
      </label>

      {uploadError && <p className="text-[10px] font-mono text-red-500 dark:text-red-400 mb-3">{uploadError}</p>}

      <AnimatePresence>
        {uploadingImages
          .filter((u) => !u.url)
          .map(({ file, progress }) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-2.5 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark mb-2"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-light dark:text-primary-dark shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate mb-1">{file.name}</p>
                <div className="h-1 bg-border-light dark:bg-border-dark w-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-light dark:bg-primary-dark"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
              <span className="text-[9px] font-mono text-muted-light dark:text-muted-dark shrink-0">{Math.round(progress)}%</span>
            </motion.div>
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {form.images.map((url, i) => (
          <motion.div
            key={url}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-3 p-2.5 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark mb-2"
          >
            <Picture priority src={url} alt={`Product image ${i + 1}`} className="w-10 h-10 object-cover shrink-0" />
            <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate flex-1">{url}</span>
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="text-muted-light dark:text-muted-dark hover:text-red-500 transition-colors shrink-0"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {form.images.length === 0 && uploadingImages.length === 0 && (
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark text-center py-2">No images uploaded yet</p>
      )}
    </section>
  )
}
