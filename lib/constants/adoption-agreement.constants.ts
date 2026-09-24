import type { AdoptionPaymentMethod } from '@prisma/client'

// A paragraph is a string; a bulleted list is an array of strings
type TermsBlock = string | string[]

type AdoptionTerms = {
  intro: string
  clauses: TermsBlock[][]
  financial: string
}

/**
 * Every signed agreement stores the version it was signed under, so revising the terms never changes
 * what an earlier adopter agreed to. To revise: add a new dated entry, point the current version at it,
 * and leave every earlier entry exactly as it was.
 */
export const ADOPTION_TERMS_VERSION = '2026-09-22'

export const ADOPTION_TERMS: Record<string, AdoptionTerms> = {
  '2026-09-22': {
    intro:
      'Little Paws Dachshund Rescue, LPDR, is a Connecticut nonprofit corporation whose sole purpose is to ensure that each dachshund in its care is placed in a home that will lovingly care for and make the dachshund a permanent member of the family. LPDR is run exclusively by volunteers and does not profit financially from adoption fees or donations. LPDR wishes to give the dachshund described below to the Adopter(s), and Adopter(s) wishes to adopt the dachshund and provide it a permanent and loving home.',

    clauses: [
      // 1
      [
        'I/We agree that the Dachshund will be kept exclusively as an indoor pet and will not be used in any way detrimental to the dog (i.e.) medical research, abuse, neglect, etc.) and not maintained as a yard dog (kept inside). The primary function of the Dachshund will be that of a companion.'
      ],
      // 2
      [
        'I/We agree that we will not transfer, sell, give, trade, or in any way change custody of the Dachshund from us to any other person or entity, including, without limitation, any laboratory or other rescue or humane group. The Dachshund will not be sold or given away. It can only be returned to Little Paws Dachshund Rescue. If the Adopter(s) no longer want or cannot keep the Dachshund, they acknowledge that they are required to return the dog to Little Paws Dachshund Rescue and if the Adopter(s) are more than 50 miles further away from the place of adoption, they assume sole responsibility and expense for returning the dog promptly and safely to Little Paws Dachshund Rescue. Adopter(s) shall immediately notify Little Paws Dachshund Rescue of their intent, in writing, to give up the dog. Further, in the event of any material dispute concerning the ownership or care or condition of the Dachshund, Little Paws Dachshund Rescue may, at its option, reclaim the dog.'
      ],
      // 3
      [
        'This Dachshund will only be euthanized in the case of terminal illness or injury, aggressive behavior that is dangerous to people (including children, elderly, and the disabled) dangerous to other household pets, recommended by the local authorities, or old age accompanied by unreasonable pain and suffering. Euthanasia must be performed by a licensed veterinarian.'
      ],
      // 4
      [
        "I/We will keep the microchip tag on the dog at all times. I/We understand that all dogs adopted through Little Paws Dachshund Rescue are microchipped under the rescue's name at the time of adoption. I/We agree to have the microchip registration transferred to our name and contact information within thirty (30) days of adoption.",
        'This transfer may be completed in one of two ways:',
        [
          'I/We may contact AKC Reunite at 800-252-7894 to complete the ownership transfer directly, which may involve a fee and require rescue authorization.',
          "I/We may request that the rescue's microchip coordinator complete the transfer at no cost by emailing chips@littlepawsdr.org within thirty (30) days of the dog going home. After thirty (30) days, the adopter must complete the transfer independently through the microchip company."
        ],
        "Any changes to the adopter's contact information (including address or phone number) must also be reported to the rescue within thirty (30) days. The dog has also been outfitted with an LPDR ID tag, which must remain on the dog for their lifetime. In the event the dog is lost, stolen, or escapes, any expenses incurred are the sole responsibility of the adopter."
      ],
      // 5
      [
        'I/We will notify my LPDR representative immediately if this Dachshund is lost or stolen and will make every effort to locate the dog. I/We will notify the animal recovery company that monitors if the dog is lost or stolen (they hold the ID tag info) and make them aware as soon as possible that the dog is lost or stolen. I/We will also promptly notify LPDR if the Dachshund dies or sustains a serious injury requiring other than routine care. Any and all expenses incurred is Adopter(s) sole expense.'
      ],
      // 6
      [
        'I/We will have the Dachshund seen by a veterinarian within thirty (30) days of adoption and placed on the appropriate vaccination and veterinary health program as advised by such veterinarian. I/We agree to provide proper food, fresh water, indoor shelter, protection, kind treatment and medical care for the life of the Dachshund at Adopter(s) sole expense.'
      ],
      // 7
      [
        "I/We will keep the Dachshund on a leash at all times when not in a safe, enclosed and fenced area. I/We will not tie the Dachshund outside at any time nor will we leave the Dachshund outdoors while we are away from home. If, in the event of an escape from a leash, outdoor, secure area, or any other circumstance, Adopter(s) accept total responsibility for Dachshund. I/We agree to defend, indemnify and hold harmless LPDR, its trustees, officers, employees, agents, successors, assignees, all members of Little Paws Dachshund Rescue from and against any and all demands, claims, causes of action, or judgments, and any and all expenses (including, without limitation, reasonable attorney's fees) incurred in connection with this Agreement, including, without limitation, claims of any third party for injury to person, loss of life, or damage to property if anything arises. LPDR shall be entitled to choose its own attorney's. Any and all expenses are sole responsibility of Adopter(s)."
      ],
      // 8
      [
        'I/We will provide the Dachshund with regular veterinary care including required vaccines, dental care and parasite checks, along with any and all medical issues that arise at Adopter(s) sole expense.'
      ],
      // 9
      ['I/We will never transport the Dachshund in an open vehicle or in any other way that will endanger the Dachshund during transport.'],
      // 10
      [
        'I/We agree to a two-week trial period. LPDR will allow return of the Dachshund within two weeks of receiving the dog if the adopter is unsatisfied with the Dachshund. We agree to contact LPDR, via email, to applications@littlepawsdr.org immediately upon the decision to return said dog and allow LPDR two weeks (2) to make arrangements for the dogs return transportation. All expenses incurred by the Adopter(s) will be non-refundable; however, all adoption fees paid will be fully refundable if LPDR is contacted within the fourteen (14) day period. Adopter(s) may arrange for the return of the Dachshund to LPDR without penalty at any time before the expiration of the Trial Period.'
      ],
      // 11
      [
        'I/We understand that LPDR reserves the right to repossess the Dachshund (at Adopter(s) expense) should any portion of this contract be breached by Adopter(s) or should LPDR determine, in its reasonable discretion, that Adopter(s) have neglected or mistreated this dog.'
      ],
      // 12
      ['I/We agree to allow LPDR to periodically check on the dog, at reasonable times, to be assured compliance with the above terms.'],
      // 13
      [
        "In consideration of LPDR's transfer of the adopted dog to Adopter(s), as the Adopter(s), Adopter(s) agree that LPDR, its trustees, officers, employees, agents, successors and assignees, shall have no liability to us for any damages for breach of duty or contractual obligation or any other claim of any kind, at law or equity, in connection with the Dachshund whether presently existing or arising in the future. If, for any reason, the Dachshund is returned to LPDR, or if this Agreement is terminated for any reason, LPDR shall have no obligation to pay Adopter(s) any refund, reimbursement or any other amount or fee."
      ],
      // 14
      [
        "I/We agree to DEFEND, INDEMNIFY and HOLD HARMLESS LPDR, its trustees, officers, employees, agents, successors, assignees, and all members of LPDR from and against any and all demands, claims, causes of action, or judgments, and any and all expenses (including, without limitation, reasonable attorneys' fees and costs) incurred in connection with this agreement, including, without limitation, (i) any third party claim for injury to person, loss of life, or damage to property, and (ii) any claim of fault or negligence, whether whole or partial, by LPDR, its trustees, officers, employees, agents, successors, assignees, and all members of LPDR. LPDR shall be entitled to choose its own attorney's."
      ],
      // 15
      [
        "Disclaimer of Uniform Commercial Code warranties THE ADOPTED DOG IS FURNISHED TO THE ADOPTER 'AS IS' WITH ALL FAULTS, AND WITHOUT ANY REPRESENTATION, GUARANTEE OR WARRANTY CONCERNING ITS PERFORMANCE OR CONDITION. ANY WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED BY LPDR AND WAIVED BY THE ADOPTER(S)."
      ],
      // 16
      [
        'Confidentiality/Non-Disclosure. The phrases and circumstances of this Agreement are completely confidential between the parties and shall not be disclosed to any other party(ies) which includes via letter, e-mail, social media, chat, verbal or any other communicative way that is derogatory or defamatory towards/against LPDR. Any disclosure in violation shall be deemed a breach of this Agreement. Any breach by Adopter(s) of any of Adopter(s) obligations under this Agreement will result in irreparable inquiry to LPDR for which damages and other legal remedies will be inadequate. In seeking enforcement of any of these obligations, LPDR will be entitled (in addition to other remedies) to preliminary and permanent injunctive and other equitable relief to prevent, discontinue and/or restrain the breach of this Agreement.'
      ],
      // 17
      [
        'This agreement constitutes the final, complete and exclusive statement between the parties to this Agreement and supersedes all prior or contemporaneous understandings or agreements of the parties and is binding on and inures to the benefit of their respective heirs, representatives, successors and assigns. Neither party has been induced to enter into this Agreement by, nor is either party relying on any representation or warranty outside those expressly set forth in this Agreement. Any agreement made after the date of this Agreement is ineffective to modify, waive, or terminate this Agreement, in whole or in part, unless that agreement is in writing, is signed by a duly authorized representative of LPDR and the Adopter, and specifically states that agreement modifies this Agreement.'
      ],
      // 18
      [
        "If any party commences litigation against any other party for the specific performance of this Agreement, or for damages for the breach of the Agreement or otherwise for enforcement of any remedy under this Agreement, the parties waive any right to a trial by jury and, in the event of any commencement of litigation, the substantially prevailing party shall be entitled to all costs and reasonable attorney's fees in any action or proceeding arising out of this Agreement and/or in any action or proceeding to enforce a judgment based on a cause of action arising out of this agreement. All litigation shall be filed and prosecuted in the state in which the dog was housed by LPDR before adoption."
      ],
      // 19
      [
        'This Agreement shall be governed by and construed in accordance with laws of the state LPDR was housed in before placement. If any term or provision of this Agreement is, to any extent, held to be invalid or unenforceable, the remainder of this Agreement shall not be affected, and each term or provision of this Agreement shall be valid and be enforced to the fullest extent permitted by law. If the application of that term or provision to persons or circumstances other than those as to which is held invalid or unenforceable, shall not be affected, and each term or provision of this Agreement shall be valid and be enforced to the fullest extent permitted by law. This Agreement is fully binding in a court of law. This Agreement is considered final when all parties have signed and accepted by LPDR.'
      ],
      // 20
      [
        'I/We understand that this Agreement involves important legal rights and obligations, and we acknowledge that we have had an opportunity to consult with an independent legal advisor of my choosing. I /We further acknowledge that we have voluntarily, knowingly and willingly signed this Agreement, in full recognition of the nature of the undertakings that I/We have assumed under this Agreement.'
      ]
    ],

    financial:
      "LPDR's adoption fees are based on the dog's age. A schedule of adoption fees is found on our website (www.LittlePawsDR.org). Other charges such as Health Certificate Fee, which is mandated by various states when crossing state lines, and the New England fee which covers state-mandated quarantine requirements, are additional fees charged by LPDR to recoup some of the costs incurred to transport the adopted dog to the adopter's locale. The adoption fees we collect do not cover the vetting and medical costs of the animals we take in. We engage in various fundraising events throughout the year to cover medical costs and sustain our organization's mission. If you are interested in making a donation to LPDR's fund, over and above the adoption fee, it's greatly appreciated. Donations help support the dogs in LPDR's care, allows us to save more dogs that are abandoned, neglected or homeless and contributes to a solution to the problem of the overpopulation of pets. LPDR is a 100% volunteer run, 501(c)(3) non-profit organization and all donations are tax deductible."
  }
}

export const getAdoptionTerms = (version: string) => ADOPTION_TERMS[version] ?? null

// Card is paid on the site, so it has no instructions
export const OFFLINE_PAYMENT_INSTRUCTIONS: Record<Exclude<AdoptionPaymentMethod, 'CARD'>, { label: string; instruction: string }> = {
  ZELLE: { label: 'Zelle', instruction: 'Send payment by Zelle to lpdrbills@littlepawsdr.org' },
  VENMO: { label: 'Venmo', instruction: 'Send payment by Venmo to @littlepawsdr' },
  PAYPAL: { label: 'PayPal', instruction: 'Send payment by PayPal to lpdrbills@littlepawsdr.org' }
}

export const AGREEMENT_FILTERS = ['ALL', 'DRAFT', 'SENT', 'SIGNED', 'PAID', 'COMPLETE', 'VOID', 'RETURNED'] as const
export type AgreementFilter = (typeof AGREEMENT_FILTERS)[number]

export const AGREEMENT_FILTER_LABELS: Record<AgreementFilter, string> = {
  ALL: 'All',
  DRAFT: 'Draft',
  SENT: 'Sent',
  SIGNED: 'Signed',
  PAID: 'Paid',
  COMPLETE: 'Complete',
  VOID: 'Void',
  RETURNED: 'Returned'
}

// What each status is waiting on, in the crew's terms rather than the database's
export const AGREEMENT_STATUS_HINT: Record<Exclude<AgreementFilter, 'ALL'>, string> = {
  DRAFT: 'Not sent yet',
  SENT: 'Waiting for adopter to sign',
  SIGNED: 'Waiting for payment',
  PAID: 'Waiting for countersignature',
  COMPLETE: 'Done',
  VOID: 'Cancelled',
  RETURNED: 'Dog came back'
}
