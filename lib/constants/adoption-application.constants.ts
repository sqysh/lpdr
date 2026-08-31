export const TERMS_AND_CONDITIONS = [
  {
    title: 'Adoption Requirements',
    content: [
      'Must be 21 years of age or older',
      'Own or rent your home (landlord approval required for rentals)',
      'All household members must agree to the adoption',
      'Financially able to provide proper care'
    ]
  },
  {
    title: 'Home Environment',
    content: [
      'Safe, secure living environment',
      'Proper fencing if you have a yard',
      'No history of animal abuse or neglect',
      'Current pets must be spayed/neutered and up-to-date on vaccinations'
    ]
  },
  {
    title: 'Adoption Process',
    content: [
      'Application fee is non-refundable',
      'Home visit may be required',
      'Reference checks will be conducted',
      'Approval is not guaranteed',
      'Final adoption fee is separate from application fee'
    ]
  },
  {
    title: 'Commitment',
    content: [
      'Lifetime commitment to the adopted dog',
      'Provide necessary medical care',
      'Keep dog indoors as a family member',
      'Return dog to Little Paws if unable to keep'
    ]
  }
]

export const STEPS = ['sign-in', 'terms', 'info', 'payment'] as const

export const STEP_LABELS: Record<string, string> = {
  'sign-in': 'Sign In',
  terms: 'Terms',
  info: 'Info',
  payment: 'Payment'
}
