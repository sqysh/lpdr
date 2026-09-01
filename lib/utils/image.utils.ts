export async function convertIfHeic(file: File): Promise<File> {
  if (!file.type.includes('heic') && !file.name.toLowerCase().endsWith('.heic')) {
    return file
  }

  const heic2any = (await import('heic2any')).default
  const blob = (await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })) as Blob
  return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' })
}
