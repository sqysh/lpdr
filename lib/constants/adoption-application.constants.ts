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

export const STEPS = ['sign-in', 'terms', 'details', 'payment'] as const

export const STEP_LABELS: Record<string, string> = {
  'sign-in': 'Sign In',
  terms: 'Terms',
  info: 'Info',
  payment: 'Payment'
}

/**
 * The adoption application, moved from RescueGroups. Saved applications store this version with
 * their answers, so changing a question later never changes what an earlier applicant was asked.
 *
 * Wording is from the live RescueGroups form as of Oct 2026. Lines marked "Changed from RG"
 * are proposals to confirm with Cathy before launch.
 */
export const ADOPTION_APPLICATION_VERSION = '2026-10-05'

export type QuestionType =
  | 'text' // one line
  | 'textarea' // a paragraph
  | 'yesNo'
  | 'radio'
  | 'select'
  | 'agree' // a single required "I agree" box
  | 'dog' // picker of current dogs, synced from RescueGroups
  | 'content' // a paragraph to read, no answer

export interface Question {
  id: string
  type: QuestionType
  label: string
  required?: boolean
  options?: readonly string[]
  /** Only shown, and only required, when another answer matches */
  showIf?: { id: string; equals: string | readonly string[] }
  /** Filled from the signed-in account; the applicant confirms or corrects it */
  prefill?: 'firstName' | 'lastName' | 'email' | 'addressLine1' | 'city' | 'state' | 'zipPostalCode' | 'phone'
}

export interface Section {
  id: string
  title: string
  questions: readonly Question[]
}

const YES_NO = ['Yes', 'No'] as const
const YES_NO_NA = ['Yes', 'No', 'N/A'] as const

export const ADOPTION_APPLICATION: readonly Section[] = [
  {
    id: 'about-you',
    title: 'About you',
    questions: [
      { id: 'firstName', type: 'text', label: 'First name', required: true, prefill: 'firstName' },
      { id: 'lastName', type: 'text', label: 'Last name', required: true, prefill: 'lastName' },
      { id: 'address', type: 'text', label: 'Address', required: true, prefill: 'addressLine1' },
      { id: 'city', type: 'text', label: 'City', required: true, prefill: 'city' },
      { id: 'state', type: 'text', label: 'State', required: true, prefill: 'state' },
      { id: 'zip', type: 'text', label: 'Zip code', required: true, prefill: 'zipPostalCode' },
      // Changed from RG: email comes from their account, and the "willing to communicate by email" question is dropped
      { id: 'email', type: 'text', label: 'Email', required: true, prefill: 'email' },
      { id: 'cellPhone', type: 'text', label: 'Cell phone', required: true, prefill: 'phone' },
      { id: 'homePhone', type: 'text', label: 'Home phone' },
      { id: 'workPhone', type: 'text', label: 'Work phone' },
      { id: 'employer', type: 'text', label: 'Your employer', required: true },
      { id: 'partnerName', type: 'text', label: "Partner's name" },
      { id: 'partnerEmployer', type: 'text', label: "Partner's employer" },
      {
        id: 'residents',
        type: 'textarea',
        label: 'Please list the residents living in your home including relationship and age. Please include yourself and your age.',
        required: true
      },
      {
        id: 'childrenExperience',
        type: 'textarea',
        label: 'If you have children, please describe their previous experience with dogs and their involvement with a new dog?'
      },
      {
        id: 'visitingChildren',
        type: 'textarea',
        label:
          'If you have children or grandchildren stay with you regularly (but do not reside in your home) how have you taught them to interact with a dog?'
      }
    ]
  },
  {
    id: 'dog',
    title: 'Dog of interest',
    questions: [
      {
        id: 'dogOfInterest',
        type: 'dog',
        label:
          "Which of our rescue dogs interests you? (LPDR will determine if the dachshund you applied for is a match for you based on the dog's requirements for adoption and your living situation. If your dog of choice is not a match, we may recommend another dog or ask you to keep checking our website. Unfortunately, we can't guarantee that everyone who applies for a dog will get to adopt a dog.)"
      },
      {
        id: 'commitmentIntro',
        type: 'content',
        label:
          'LPDR makes a lifetime commitment to each and every dog we place. We put a tremendous amount of love and medical resources into each of our dogs to get them as healthy as possible before going to their forever families. We want them to stay that way to bring as much love for as many years as possible to their new families. Therefore, we need to make sure that we are placing our dogs in homes that believe that love and medical care directly impact the life of the dog.'
      }
    ]
  },
  {
    id: 'pets',
    title: 'Current and past pets',
    questions: [
      {
        id: 'currentPets',
        type: 'textarea',
        label: 'Please list all current pets living in your household including name, type, breed, gender, age and weight for all dogs.',
        required: true
      },
      {
        id: 'currentDogPersonalities',
        type: 'textarea',
        label:
          'If you currently have dog(s) please list name(s) and personalities below (i.e., dominant, submissive, playful, aloof, etc.)',
        required: true
      },
      { id: 'heartworm', type: 'yesNo', label: 'Do you currently use heart worm preventative?', options: YES_NO, required: true },
      {
        id: 'heartwormType',
        type: 'text',
        label: 'What brand/type of heart worm preventative do you use? Where do you purchase your HW preventative?',
        required: true,
        // Changed from RG: required there even after answering No
        showIf: { id: 'heartworm', equals: 'Yes' }
      },
      { id: 'heartwormWhyNot', type: 'text', label: 'If no, why not?', required: true, showIf: { id: 'heartworm', equals: 'No' } },
      { id: 'fleaTick', type: 'yesNo', label: 'Are you currently using flea and tick prevention?', options: YES_NO, required: true },
      {
        id: 'fleaTickType',
        type: 'text',
        label: 'What type of flea and tick preventative are you using?',
        required: true,
        // Changed from RG: required there even after answering No
        showIf: { id: 'fleaTick', equals: 'Yes' }
      },
      { id: 'food', type: 'text', label: 'What brand of food do you feed your current dog?' },
      {
        id: 'spayedNeutered',
        type: 'yesNo',
        label: 'Are all of the animals in your home spayed and neutered?',
        options: YES_NO,
        required: true
      },
      {
        id: 'spayedNeuteredWhyNot',
        type: 'textarea',
        label: 'If your animals are not spayed or neutered, please explain why not.',
        required: true,
        showIf: { id: 'spayedNeutered', equals: 'No' }
      },
      {
        id: 'previousDogs',
        type: 'textarea',
        label: 'Please list previous dogs you have owned since adulthood including name, breed, age, date and reason for passing.',
        required: true
      },
      {
        id: 'healthHistory',
        type: 'textarea',
        label:
          'Please describe any health issues (injuries, surgeries, diagnosis) your current or previous pets may have had and how each was treated?',
        required: true
      },
      { id: 'cats', type: 'yesNo', label: 'If you own cats, have they been exposed to dogs?', options: YES_NO_NA, required: true },
      { id: 'catsReaction', type: 'text', label: 'How do they react?', required: true, showIf: { id: 'cats', equals: 'Yes' } }
    ]
  },
  {
    id: 'vet',
    title: 'Vet care',
    questions: [
      {
        id: 'annualVet',
        type: 'yesNo',
        label:
          'Are you willing to take your dogs to your veterinarian at least once per year for a physical exam, vaccines, and heartworm testing?',
        options: YES_NO,
        required: true
      },
      {
        id: 'lifetimeCommitment',
        type: 'yesNo',
        label:
          'Are you able to make a long-term commitment to your adopted dog for their lifetime, which could be for as much as 10 to 20 years?',
        options: YES_NO,
        required: true
      },
      {
        id: 'vetPermission',
        type: 'content',
        label:
          'By submitting this application, you give permission to Little Paws Dachshund Rescue to retrieve information from your veterinarian. I UNDERSTAND THAT MY VET WILL BE CONTACTED TO PROVIDE INFORMATION ABOUT MY CURRENT AND/OR PREVIOUS PETS. If our representative is unable to reach your vet to release the information needed this will result in your application being delayed. We cannot process your application without information from your veterinarian.'
      },
      {
        id: 'vetInfo',
        type: 'textarea',
        label:
          'Please provide the name of your vet practice with full address and phone number (including area code) for your current and previous pets (if more than one vet practice has been used, please list all).',
        required: true
      }
    ]
  },
  {
    id: 'dachshunds',
    title: 'Dachshund know-how',
    questions: [
      { id: 'firstDachshund', type: 'yesNo', label: 'Will this be your first time owning a dachshund?', options: YES_NO, required: true },
      {
        id: 'breedFamiliarity',
        type: 'textarea',
        label: 'Are you familiar with the dachshund breed? Temperament, habits, health issues? Please elaborate.',
        required: true
      },
      { id: 'leashWalk', type: 'yesNo', label: 'Do you leash walk your current dogs?', options: YES_NO_NA, required: true },
      { id: 'collarHarness', type: 'text', label: 'If you have a dachshund, do you walk them with a collar or harness?' },
      {
        id: 'backProblemsAware',
        type: 'yesNo',
        label: "Are you familiar with the dachshunds' tendency to have back problems?",
        options: YES_NO,
        required: true
      },
      { id: 'ivddHistory', type: 'yesNo', label: 'Have you had a dachshund with IVDD (a back issue)?', options: YES_NO, required: true },
      {
        id: 'ivddTreatment',
        type: 'textarea',
        label: 'What treatment options did you utilize? Please explain in detail.',
        required: true,
        showIf: { id: 'ivddHistory', equals: 'Yes' }
      },
      {
        id: 'ivddRiskAware',
        type: 'yesNo',
        label:
          "If you're not familiar with IVDD, are you aware that dachshunds may have back injuries that may make them incontinent and unable to walk? This risk is increased when the dog is allowed to jump on and off furniture, use stairs, and become overweight, and it can happen at any age.",
        options: YES_NO,
        required: true,
        showIf: { id: 'ivddHistory', equals: 'No' }
      },
      {
        id: 'stairsAllowed',
        type: 'radio',
        label: 'Do you allow your current dachshund(s) to go up and down stairs?',
        options: YES_NO_NA,
        required: true
      }
    ]
  },
  {
    id: 'daily-life',
    title: 'Daily life',
    questions: [
      { id: 'dailyRoutine', type: 'textarea', label: 'Describe your daily routine and how a dog fits in.', required: true },
      { id: 'workOutside', type: 'yesNo', label: 'Do you work outside the home?', options: YES_NO, required: true },
      {
        id: 'workSchedule',
        type: 'text',
        label: 'How many days per week? And how many hours per day?',
        required: true,
        showIf: { id: 'workOutside', equals: 'Yes' }
      },
      {
        id: 'hoursAlone',
        type: 'radio',
        label: 'Share with us how long the dog will be left alone in your home daily.',
        // Changed from RG: there it was under an hour, 2-4, 4-6, 8-10, which left gaps
        options: ['Less than an hour', '1 - 2 hours', '2 - 4 hours', '4 - 6 hours', '6 - 8 hours', '8 - 10 hours', 'More than 10 hours'],
        required: true
      },
      {
        id: 'whileOut',
        type: 'textarea',
        label:
          'What are your plans for the dog when you are out of the house? Where will your dog stay? Please be specific, i.e., run of the house, a particular room, in a crate?',
        required: true
      },
      {
        id: 'sleep',
        type: 'textarea',
        label:
          'Where will the dog sleep at night? Please be specific, i.e., in the big bed, in a dog bed, in a crate, in another room of the house, etc.',
        required: true
      },
      { id: 'travel', type: 'textarea', label: "If you travel, who will watch your dog when you're away?", required: true },
      {
        id: 'moving',
        type: 'textarea',
        label: 'What will happen to your dogs if you move? Locally, out of state, out of the country?',
        required: true
      },
      {
        id: 'quietHome',
        type: 'yesNo',
        label:
          'Some of our rescue dogs require a quiet environment. Would you consider your home appropriate for a dog that needs calm surroundings?',
        options: YES_NO,
        required: true
      },
      { id: 'visitors', type: 'textarea', label: 'Please briefly explain how you introduce visitors to your dog?', required: true },
      {
        id: 'agitated',
        type: 'textarea',
        label: 'How would you address the situation if your dog became agitated or frightened by children or a guest in your home?',
        required: true
      }
    ]
  },
  {
    id: 'history',
    title: 'Your history with dogs',
    questions: [
      {
        id: 'appliedBefore',
        type: 'yesNo',
        label: 'Have you previously applied to adopt from a rescue/shelter?',
        options: YES_NO,
        required: true
      },
      {
        id: 'appliedBeforeWhere',
        type: 'text',
        label: 'If you adopted before, please tell us the name of the rescue/shelter?',
        showIf: { id: 'appliedBefore', equals: 'Yes' }
      },
      {
        id: 'otherRescue',
        type: 'yesNo',
        label: 'Are you currently working with another rescue or shelter to find a dog?',
        options: YES_NO,
        required: true
      },
      {
        id: 'otherRescueWhich',
        type: 'text',
        label: 'Please list any other rescues/shelters you are working with?',
        required: true,
        showIf: { id: 'otherRescue', equals: 'Yes' }
      },
      { id: 'bred', type: 'yesNo', label: 'Have you ever bred a dog?', options: YES_NO, required: true },
      { id: 'bredWhen', type: 'text', label: 'How long ago?', required: true, showIf: { id: 'bred', equals: 'Yes' } },
      { id: 'surrendered', type: 'yesNo', label: 'Have you ever surrendered a dog?', options: YES_NO, required: true },
      { id: 'surrenderedWhen', type: 'text', label: 'How long ago?', required: true, showIf: { id: 'surrendered', equals: 'Yes' } },
      {
        id: 'surrenderFuture',
        type: 'textarea',
        label: 'What, if anything, would cause you to surrender a dog in the future?',
        required: true
      },
      {
        id: 'lostPet',
        type: 'yesNo',
        label: 'Have you ever lost a pet (i.e., runaway, stolen, disappeared)?',
        options: YES_NO,
        required: true
      },
      { id: 'lostPetDetails', type: 'textarea', label: 'Please elaborate.', required: true, showIf: { id: 'lostPet', equals: 'Yes' } }
    ]
  },
  {
    id: 'home',
    title: 'Home and yard',
    questions: [
      {
        id: 'homeType',
        type: 'select',
        label: 'What type of home do you live in?',
        options: ['Single family', 'Condo', 'Townhome', 'Duplex', 'Mobile', 'Apartment'],
        required: true
      },
      { id: 'ownRent', type: 'select', label: 'Do you own or rent?', options: ['Own', 'Rent'], required: true },
      {
        id: 'landlord',
        type: 'textarea',
        label: 'Please provide the name and contact information for your landlord. (Name, phone number, and email)',
        required: true,
        showIf: { id: 'ownRent', equals: 'Rent' }
      },
      { id: 'stairs', type: 'yesNo', label: 'Are there stairs in your home?', options: YES_NO, required: true },
      {
        id: 'stairsGated',
        type: 'text',
        label: 'How many, and are they gated for safety?',
        required: true,
        showIf: { id: 'stairs', equals: 'Yes' }
      },
      { id: 'doggyDoor', type: 'yesNo', label: 'Do you have a doggy door?', options: YES_NO, required: true },
      {
        id: 'doggyDoorUnsupervised',
        type: 'yesNo',
        label: "Will your dog have use of the doggy door unsupervised while you're not at home?",
        options: YES_NO,
        required: true,
        showIf: { id: 'doggyDoor', equals: 'Yes' }
      },
      { id: 'fenced', type: 'yesNo', label: 'Is your yard fenced?', options: YES_NO, required: true },
      {
        id: 'fenceType',
        type: 'text',
        label: 'What type of fence is it (i.e. chain, wooden, privacy, invisible)?',
        required: true,
        showIf: { id: 'fenced', equals: 'Yes' }
      },
      {
        id: 'fenceHeight',
        type: 'text',
        label: "How high is your fence and is it low enough to the ground so a dachshund can't crawl or dig under?",
        required: true,
        showIf: { id: 'fenced', equals: 'Yes' }
      },
      {
        id: 'fenceGates',
        type: 'select',
        label: 'Does your fence have gates? If yes, do the gates have latches or locks?',
        options: ['Yes, gate with latch.', 'Yes, gate with lock.', 'No gates - solid fence.'],
        required: true,
        showIf: { id: 'fenced', equals: 'Yes' }
      },
      {
        id: 'yardSupervised',
        type: 'yesNo',
        label: 'Do you supervise your dogs while in the yard?',
        options: YES_NO,
        required: true,
        showIf: { id: 'fenced', equals: 'Yes' }
      },
      {
        id: 'invisibleFence',
        type: 'radio',
        label: 'If you have an invisible fence, will your adopted dog use the invisible fence?',
        options: YES_NO_NA,
        required: true
      },
      {
        id: 'offLeash',
        type: 'yesNo',
        label: 'Do you allow your dog(s) off leash when they are not within a fenced area?',
        options: YES_NO,
        required: true
      },
      { id: 'offLeashDetails', type: 'textarea', label: 'Please elaborate.', required: true, showIf: { id: 'offLeash', equals: 'Yes' } },
      {
        id: 'pool',
        type: 'select',
        label: 'Do you have an inground pool?',
        options: ['No pool', 'Yes, pool without fence.', 'Yes, pool with fence.'],
        required: true
      }
    ]
  },
  {
    id: 'references',
    title: 'References',
    questions: [
      { id: 'reference1', type: 'text', label: 'Personal (non-family) Reference #1: Name and Email Address', required: true },
      { id: 'reference2', type: 'text', label: 'Personal (non-family) Reference #2: Name and Email Address', required: true },
      { id: 'reference3', type: 'text', label: 'Personal (non-family) Reference #3: Name and Email Address', required: true },
      {
        id: 'emergencyContact',
        type: 'textarea',
        label:
          'In the case you are unable to care for your dog, who will be responsible for taking the dogs and contacting Little Paws? Name, phone, relationship.',
        required: true
      },
      {
        id: 'foundUs',
        type: 'text',
        label:
          'How did you find our rescue? If you learned about us from a LPDR adopter or supporter, please share their name so we can thank them?'
      },
      { id: 'anythingElse', type: 'textarea', label: 'Any additional comments or things we should know?' }
    ]
  },
  {
    id: 'agreement',
    title: 'Agreement',
    // Changed from RG: each was a Yes/No pair, so "No" could be submitted. These are single required boxes
    questions: [
      {
        id: 'agreeReturn',
        type: 'agree',
        label:
          'Our contract with our adopters specifies that the dog will be returned to Little Paws Dachshund Rescue if you no longer can take care of the dog for any reason. I agree to this requirement.',
        required: true
      },
      {
        id: 'agreeNonTransferable',
        type: 'agree',
        label:
          "Dogs adopted from LPDR are 'non-transferrable'. This means your new dog must stay in your personal possession. You agree to not give it away, abandon, sell or dispose of your adopted dog in any way. This includes giving it to family members or friends.",
        required: true
      },
      { id: 'agreeBackgroundCheck', type: 'agree', label: 'I consent to a background check.', required: true },
      {
        id: 'agreeHomeVisit',
        type: 'agree',
        label:
          'I understand that a home visit is part of the screening process required before final placement. I am willing to have a LPDR volunteer visit my home in person or via virtual visit with all persons in the home present for the visit.',
        required: true
      },
      { id: 'agreeNoGuarantee', type: 'agree', label: 'I understand that a home visit does not guarantee placement.', required: true },
      {
        id: 'agreeFinancial',
        type: 'agree',
        label:
          "I am willing and able to accept all financial responsibility for the expenses associated with caring for a dog after adoption. This includes but is not limited to preventative healthcare, including annual check-ups, vaccinations, heartworm prevention, and flea and tick prevention. It includes emergency medical care in the event of injury at any time in the dog's life, in addition to the cost of regular care and feeding (food, supplies, medications, equipment, toys, training, and pet sitting and boarding).",
        required: true
      },
      { id: 'agreeContract', type: 'agree', label: 'I acknowledge this application becomes part of my contract.', required: true },
      {
        id: 'virtualVisit',
        type: 'select',
        label: 'For a virtual home visit using your cellphone, which do you have access to?',
        // Changed from RG: Google Duo was folded into Google Meet in 2022
        options: ['FaceTime', 'Zoom', 'Google Meet', 'WhatsApp', 'Facebook Video Chat', 'None of these'],
        required: true
      }
    ]
  }
]
