import { Beef, Bone, Cookie, Croissant, LucideIcon, Pill, Utensils } from 'lucide-react'

export const FEED_A_FOSTER_CONTENT = [
  {
    id: 'kibble',
    title: 'Kibble for a Week',
    textKey:
      "Cover the cost of one foster dog's food for a full week. Every meal fuels their recovery and gets them one step closer to their forever home.",
    amount: 15
  },
  {
    id: 'wet-food',
    title: 'Wet & Canned Food',
    textKey:
      'Some fosters need soft food while they recover or regain their appetite. Your gift stocks a foster with nourishing wet and canned meals.',
    amount: 20
  },
  {
    id: 'treats',
    title: 'Treat & Enrichment Box',
    textKey: "Send a foster dog a month's worth of treats, chews, and enrichment toys. A happy dog is a healthy dog.",
    amount: 25
  },
  {
    id: 'dental-chews',
    title: 'Dental Chews',
    textKey:
      "Dachshunds are prone to dental disease. Dental chews help keep our fosters' teeth clean and their breath fresh between vet visits.",
    amount: 30
  },
  {
    id: 'joint-supplements',
    title: 'Joint Supplements',
    textKey:
      'Long backs mean sensitive joints. Your donation provides a month of joint supplements to keep a foster comfortable and mobile.',
    amount: 40
  },
  {
    id: 'senior-food',
    title: 'Senior Dog Food',
    textKey:
      'Our senior fosters need specially formulated food for aging bodies. Help feed an older dachshund the gentle nutrition they deserve.',
    amount: 50
  }
] as const

export const ITEM_ICONS: Record<string, LucideIcon> = {
  kibble: Utensils,
  'wet-food': Beef,
  treats: Cookie,
  'dental-chews': Bone,
  supplements: Pill,
  'senior-food': Croissant
}

export const FEED_A_FOSTER_ITEMS: Record<string, { name: string; price: number }> = Object.fromEntries(
  FEED_A_FOSTER_CONTENT.map((item) => [item.id, { name: item.title, price: item.amount }])
)
