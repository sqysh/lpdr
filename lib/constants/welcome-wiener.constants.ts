import { WelcomeWienerProduct } from 'types/_welcome-wiener'
import type { WelcomeWienerCategory } from 'types/_welcome-wiener'

export const WELCOME_WIENER_CATALOG: WelcomeWienerProduct[] = [
  // Gear
  {
    id: 'ww-collar',
    name: 'Collar',
    description: 'Adjustable nylon collar sized for a dachshund',
    price: 20,
    category: 'gear'
  },
  {
    id: 'ww-harness',
    name: 'Step-In Harness',
    description: 'Back-clip harness, essential for dachshund spine health',
    price: 35,
    category: 'gear'
  },
  {
    id: 'ww-leash',
    name: 'Leash',
    description: 'Standard 6ft nylon leash',
    price: 15,
    category: 'gear'
  },
  {
    id: 'ww-id-tag',
    name: 'ID Tag',
    description: 'Engraved ID tag with name and rescue contact',
    price: 12,
    category: 'gear'
  },
  {
    id: 'ww-crate',
    name: 'Crate',
    description: 'Wire crate sized for a standard dachshund',
    price: 65,
    category: 'gear'
  },
  {
    id: 'ww-carrier',
    name: 'Soft Travel Carrier',
    description: 'Airline-compatible soft-sided carrier',
    price: 50,
    category: 'gear'
  },
  // Comfort
  {
    id: 'ww-bed',
    name: 'Orthopedic Bed',
    description: 'Memory foam bed to support dachshund backs',
    price: 45,
    category: 'comfort'
  },
  {
    id: 'ww-blanket',
    name: 'Fleece Blanket',
    description: 'Soft fleece blanket for burrowing (dachshund approved)',
    price: 18,
    category: 'comfort'
  },
  {
    id: 'ww-ramp',
    name: 'Dog Ramp',
    description: 'Folding ramp to protect spine when getting on/off furniture',
    price: 55,
    category: 'comfort'
  },
  {
    id: 'ww-steps',
    name: 'Pet Steps',
    description: 'Two-step stairs for couch or bed access',
    price: 30,
    category: 'comfort'
  },
  // Food
  {
    id: 'ww-food-bag',
    name: 'Bag of Kibble',
    description: 'One 15lb bag of quality dry food',
    price: 40,
    category: 'food'
  },
  {
    id: 'ww-wet-food',
    name: 'Wet Food (case)',
    description: '12-can case of wet food for picky or senior dogs',
    price: 28,
    category: 'food'
  },
  {
    id: 'ww-treats',
    name: 'Treat Pack',
    description: 'Assorted training and reward treats',
    price: 16,
    category: 'food'
  },
  {
    id: 'ww-puzzle-feeder',
    name: 'Slow Feeder Bowl',
    description: 'Puzzle bowl to prevent fast eating and bloat',
    price: 22,
    category: 'food'
  },
  // Medical
  {
    id: 'ww-vet-visit',
    name: 'Wellness Vet Visit',
    description: 'Covers one routine vet wellness exam',
    price: 75,
    category: 'medical'
  },
  {
    id: 'ww-flea-tick',
    name: 'Flea & Tick Prevention',
    description: 'Three-month supply of flea and tick treatment',
    price: 38,
    category: 'medical'
  },
  {
    id: 'ww-heartworm',
    name: 'Heartworm Prevention',
    description: 'Six-month supply of heartworm preventative',
    price: 45,
    category: 'medical'
  },
  // Training
  {
    id: 'ww-training-session',
    name: 'Training Session',
    description: 'One one-on-one session with a volunteer trainer',
    price: 60,
    category: 'training'
  },
  {
    id: 'ww-clicker',
    name: 'Clicker + Guide',
    description: 'Training clicker with beginner dachshund guide',
    price: 10,
    category: 'training'
  },
  // Enrichment
  {
    id: 'ww-toy-pack',
    name: 'Toy Bundle',
    description: 'Four toys: plush, rope, squeaker, and chew',
    price: 25,
    category: 'enrichment'
  }
]

export const WELCOME_WIENER_CATEGORY_LABELS: Record<WelcomeWienerProduct['category'], string> = {
  gear: 'Gear',
  comfort: 'Comfort',
  food: 'Food',
  medical: 'Medical',
  training: 'Training',
  enrichment: 'Enrichment'
}

export const WELCOME_WIENER_CATEGORIES = Object.keys(
  WELCOME_WIENER_CATEGORY_LABELS
) as WelcomeWienerProduct['category'][]

export type FilterValue = 'all' | WelcomeWienerCategory

export const FILTERS = [
  { value: 'all', label: 'All Dogs' },
  { value: 'medical', label: 'Medical' },
  { value: 'gear', label: 'Gear' },
  { value: 'food', label: 'Food' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'training', label: 'Training' },
  { value: 'enrichment', label: 'Enrichment' }
] as const satisfies readonly { value: FilterValue; label: string }[]
