const OWNER_EXPERIENCE: Record<string, string> = {
  Breed: 'Breed experience preferred',
  Species: 'Dog experience preferred',
  None: 'First-time owners welcome'
}

export const QUALITY_LABELS: Record<string, string> = {
  affectionate: 'Affectionate',
  cratetrained: 'Crate Trained',
  eagerToPlease: 'Eager to Please',
  noLargeDogs: 'No Large Dogs',
  olderKidsOnly: 'Older Kids Only',
  ongoingMedical: 'Ongoing Medical Needs',
  protective: 'Protective',
  leashtrained: 'Leash Trained'
}

/** "Frank5 (fostered in North Carolina)" carries the foster location, which is worth showing on its own line */
export function getFosterNote(name?: string) {
  return name?.match(/\(([^)]+)\)/)?.[1] ?? null
}

/** Built as a list so pills with no value drop out rather than rendering blank, since RescueGroups leaves plenty unset */
export function getStats(a) {
  return [
    { label: 'Age', value: a?.ageString },
    { label: 'Sex', value: a?.sex },
    { label: 'Weight', value: a?.sizeCurrent ? `${a.sizeCurrent} ${a.sizeUOM}` : null },
    { label: 'Breed', value: a?.breedString },
    { label: 'Coat', value: a?.coatLength ? `${a.coatLength} coat` : null },
    { label: 'Energy', value: a?.activityLevel ?? a?.energyLevel },
    { label: 'Exercise', value: a?.exerciseNeeds },
    { label: 'Barking', value: a?.vocalLevel },
    { label: 'Grooming', value: a?.groomingNeeds },
    { label: 'Shedding', value: a?.sheddingLevel },
    { label: 'Training', value: a?.obedienceTraining },
    { label: 'Owner', value: OWNER_EXPERIENCE[a?.ownerExperience] ?? a?.ownerExperience },
    { label: 'Home', value: a?.indoorOutdoor }
  ].filter((s) => s.value)
}

type Tone = 'yes' | 'no' | 'caution'
export type Fact = { key: string; label: string; tone: Tone }

export const TONE_DOT: Record<Tone, string> = {
  yes: 'bg-primary-light dark:bg-primary-dark',
  no: 'bg-secondary-light dark:bg-secondary-dark',
  caution: 'bg-amber-500 dark:bg-amber-400'
}

/** Each row states the answer in its own label, so the dot reinforces rather than carries it */
export function getCompatibility(a): Fact[] {
  const olderKidsOnly = a?.qualities?.includes('olderKidsOnly')

  const kids: Fact = olderKidsOnly
    ? { key: 'kids', label: 'Older kids only', tone: 'caution' }
    : a?.isKidsOk
      ? { key: 'kids', label: 'Good with kids', tone: 'yes' }
      : { key: 'kids', label: 'Adults only', tone: 'no' }

  // fenceNeeds is the more accurate field: Frank has isYardRequired true but fenceNeeds "Not Required",
  // and his bio says preferred rather than required
  const fence: Fact =
    a?.fenceNeeds === 'Required'
      ? { key: 'yard', label: 'Fenced yard required', tone: 'caution' }
      : a?.fenceNeeds === 'Preferred'
        ? { key: 'yard', label: 'Fenced yard preferred', tone: 'caution' }
        : { key: 'yard', label: 'No fenced yard needed', tone: 'yes' }

  return [
    { key: 'dogs', label: a?.isDogsOk ? 'Good with dogs' : 'Needs to be the only dog', tone: a?.isDogsOk ? 'yes' : 'no' },
    { key: 'cats', label: a?.isCatsOk ? 'Good with cats' : 'Not suited to homes with cats', tone: a?.isCatsOk ? 'yes' : 'no' },
    kids,
    fence,
    a?.isSpecialNeeds
      ? { key: 'needs', label: 'Has special needs', tone: 'caution' }
      : { key: 'needs', label: 'No special needs', tone: 'yes' },
    a?.isHousetrained
      ? { key: 'house', label: 'House trained', tone: 'yes' }
      : { key: 'house', label: 'Still house training', tone: 'caution' }
  ]
}
