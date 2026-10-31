const OWNER_EXPERIENCE: Record<string, string> = {
  Breed: 'Breed experience preferred',
  Species: 'Dog experience preferred',
  None: 'First-time owners welcome'
}

export const QUALITY_LABELS: Record<string, string> = {
  affectionate: 'Affectionate',
  cratetrained: 'Crate Trained',
  doesWellInCar: 'Good in the Car',
  eagerToPlease: 'Eager to Please',
  lap: 'Lap Dog',
  leashtrained: 'Leash Trained',
  noLargeDogs: 'No Large Dogs',
  olderKidsOnly: 'Older Kids Only',
  ongoingMedical: 'Ongoing Medical Needs',
  playful: 'Playful',
  protective: 'Protective',
  sightImpaired: 'Sight Impaired',
  skittish: 'Skittish',
  specialDiet: 'Special Diet',
  gentle: 'Gentle',
  playsToys: 'Loves Toys',
  timid: 'Timid',
  eventempered: 'Even-Tempered',
  oKForSeniors: 'Good with Seniors',
  apartment: 'Apartment Friendly',
  intelligent: 'Intelligent',
  noSmallDogs: 'No Small Dogs',
  obedient: 'Obedient'
}

/** RescueGroups adds qualities over time, so anything unlisted is split from camelCase rather than shown raw */
export function getQualityLabel(q: string) {
  return QUALITY_LABELS[q] ?? q.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
}
/** "Frank5 (fostered in North Carolina)" carries the foster location, which is worth showing on its own line.
 *  Some brackets also hold a former name, like "Betsy (fka Lil Bit; being fostered in VA)", which is left out */
export function getFosterNote(name?: string) {
  const inside = name?.match(/\(([^)]+)\)/)?.[1]
  if (!inside) return null

  const note = inside
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part && !/^(fka|aka)\b/i.test(part))
    .join('; ')

  return note || null
}

/** Built as a list so pills with no value drop out rather than rendering blank, since RescueGroups leaves plenty unset */
export function getStats(a) {
  return [
    { label: 'Age', value: a?.ageString },
    { label: 'Sex', value: a?.sex },
    { label: 'Weight', value: a?.sizeCurrent ? `${a.sizeCurrent} ${a.sizeUOM}` : null },
    { label: 'Breed', value: a?.breedString },
    { label: 'Coat', value: a?.coatLength ? `${a.coatLength} coat` : null },
    { label: 'Color', value: a?.colorDetails },
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
export type Fact = { key: string; label: string; tone: Tone; detail?: string }

export const TONE_DOT: Record<Tone, string> = {
  yes: 'bg-primary-light dark:bg-primary-dark',
  no: 'bg-secondary-light dark:bg-secondary-dark',
  caution: 'bg-amber-500 dark:bg-amber-400'
}

// RescueGroups' fenceNeeds values. "Any Type" means a fence is needed but any kind will do
const FENCE: Record<string, Fact> = {
  'not required': { key: 'yard', label: 'No fenced yard needed', tone: 'yes' },
  preferred: { key: 'yard', label: 'Fenced yard preferred', tone: 'caution' },
  required: { key: 'yard', label: 'Fenced yard required', tone: 'caution' },
  'any type': { key: 'yard', label: 'Fenced yard required', tone: 'caution' },
  '3 foot': { key: 'yard', label: 'Fenced yard required (3 ft)', tone: 'caution' },
  '6 foot': { key: 'yard', label: 'Fenced yard required (6 ft)', tone: 'caution' }
}

const NEW_PEOPLE: Record<string, Fact> = {
  friendly: { key: 'people', label: 'Friendly with new people', tone: 'yes' },
  cautious: { key: 'people', label: 'Cautious with new people', tone: 'caution' },
  protective: { key: 'people', label: 'Protective with new people', tone: 'caution' },
  aggressive: { key: 'people', label: 'Needs careful introductions', tone: 'no' }
}

// adultSexesOk is about people, not other dogs: Libby is "Women Only" because men haven't always been kind to her
const ADULTS: Record<string, Fact> = {
  'women only': { key: 'adults', label: 'Prefers women', tone: 'caution' },
  'men only': { key: 'adults', label: 'Prefers men', tone: 'caution' }
}

/** Each row states the answer in its own label, so the dot reinforces rather than carries it.
 *  A field RescueGroups left blank drops out rather than reading as "no", since unset isn't the same as false */
export function getCompatibility(a): Fact[] {
  const kids: Fact | null = a?.qualities?.includes('olderKidsOnly')
    ? { key: 'kids', label: 'Older kids only', tone: 'caution' }
    : a?.isKidsOk === true
      ? { key: 'kids', label: 'Good with kids', tone: 'yes' }
      : a?.isKidsOk === false
        ? { key: 'kids', label: 'Adults only', tone: 'no' }
        : null

  // fenceNeeds is the more accurate field: Frank has isYardRequired true but fenceNeeds "Not Required",
  // and his bio says preferred rather than required. Without fenceNeeds, isYardRequired false is still a safe "no"
  const fence =
    FENCE[a?.fenceNeeds?.toLowerCase()] ??
    (a?.isYardRequired === false ? { key: 'yard', label: 'No fenced yard needed', tone: 'yes' } : null)

  // The isSpecialNeeds flag is often left off even when the dog's qualities say otherwise, like Sammy,
  // who is sight impaired and on a special diet
  const NEEDS_QUALITIES = ['sightImpaired', 'specialDiet', 'ongoingMedical']
  const hasNeeds = a?.isSpecialNeeds || NEEDS_QUALITIES.some((q) => a?.qualities?.includes(q))

  const facts: (Fact | null)[] = [
    a?.isDogsOk === true
      ? { key: 'dogs', label: 'Good with dogs', tone: 'yes' }
      : a?.isDogsOk === false
        ? { key: 'dogs', label: 'Needs to be the only dog', tone: 'no' }
        : null,
    a?.isCatsOk === true
      ? { key: 'cats', label: 'Good with cats', tone: 'yes' }
      : a?.isCatsOk === false
        ? { key: 'cats', label: 'Not suited to homes with cats', tone: 'no' }
        : null,
    kids,
    NEW_PEOPLE[a?.newPeopleReaction?.toLowerCase()] ?? null,
    ADULTS[a?.adultSexesOk?.toLowerCase()] ?? null,
    fence,
    hasNeeds ? { key: 'needs', label: 'Has special needs', tone: 'caution' } : { key: 'needs', label: 'No special needs', tone: 'yes' },
    a?.isHousetrained
      ? { key: 'house', label: 'House trained', tone: 'yes' }
      : { key: 'house', label: 'Still house training', tone: 'caution', detail: a?.housetrainedReasonNot }
  ]

  return facts.filter((f): f is Fact => f !== null)
}
