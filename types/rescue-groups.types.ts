export interface IDachshundAttributes {
  name: string
  slug: string
  ageString: string
  ageGroup: string
  sex: string
  breedString: string
  colorDetails: string
  photos: string[]
  isSpecialNeeds: boolean
  isAdoptionPending: boolean
  isCourtesyListing: boolean
  sizeGroup: string
  qualities: string[]
  createdDate: string
}

export interface IDachshund {
  id: string
  attributes: IDachshundAttributes
}

export interface DogAttributes {
  name: string
  slug: string
  ageString: string
  ageGroup: string
  sex: string
  breedString: string
  colorDetails: string
  sizeCurrent: number
  sizeUOM: string
  sizeGroup: string
  activityLevel: string
  energyLevel: string
  exerciseNeeds: string
  groomingNeeds: string
  sheddingLevel: string
  coatLength: string
  vocalLevel: string
  fenceNeeds: string
  newPeopleReaction: string
  ownerExperience: string
  adultSexesOk: string
  isDogsOk: boolean
  isCatsOk: boolean
  isSpecialNeeds: boolean
  isAdoptionPending: boolean
  isCourtesyListing: boolean
  isSponsorable: boolean
  isYardRequired: boolean
  qualities: string[]
  photos: string[]
  descriptionHtml: string
  descriptionText: string
  adoptionFeeString: string
  rescueId: string
  url: string
}

export interface Dog {
  id: string
  attributes: DogAttributes
}
