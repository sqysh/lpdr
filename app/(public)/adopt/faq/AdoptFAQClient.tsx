'use client'

import Picture from 'components/_common/Picture'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { IDachshund } from 'types/rescue-groups.types'

type FAQItem = {
  q: { bold: string; light: string }
  a: (string | { highlight: string })[]
}
export const faq: FAQItem[] = [
  {
    q: { bold: 'Why', light: 'should I rescue instead of buying?' },
    a: [
      "Rescue saves lives — plain and simple. Most dogs in shelters aren't there because they're bad dogs. They're there because their owner moved, had a baby, or just wasn't ready for a pet. Some come from ",
      { highlight: 'puppy mills' },
      ' — dogs that were bred for profit and then abandoned. The lucky ones end up with rescues like us.'
    ]
  },
  {
    q: { bold: 'Why', light: "aren't rescue dogs free?" },
    a: [
      'Because every dog costs us money before they ever meet you. We pay ',
      { highlight: 'vet bills' },
      ', ',
      { highlight: 'vaccinations' },
      ', ',
      { highlight: 'heartworm tests' },
      ', and ',
      { highlight: 'spay or neuter surgery' },
      " for every single dog. We're an all-volunteer nonprofit — nobody here gets paid. The adoption fee just helps us cover what we already spent on your dog."
    ]
  },
  {
    q: { bold: 'I saw a dog I like.', light: 'How do I learn more about them?' },
    a: [
      "Submit an adoption application and we'll connect you with the dog's ",
      { highlight: 'foster family' },
      ". They know the dog best — their personality, quirks, and what kind of home they'd thrive in. We want the match to be right for everyone."
    ]
  },
  {
    q: { bold: 'I applied for a dog', light: "but didn't get them. Why?" },
    a: [
      'Popular dogs get a lot of applications. We work through them ',
      { highlight: 'in the order they come in' },
      ". The first applicant who passes all the checks — application, references, vet history, home visit — gets the dog. If someone applied before you, we'll let you know. Our goal is always to find the ",
      { highlight: 'best possible home' },
      ', not just the fastest one.'
    ]
  },
  {
    q: { bold: 'Are there', light: 'any fees beyond the adoption fee?' },
    a: [
      "If your dog is crossing state lines, you'll need a ",
      { highlight: 'health certificate' },
      ' — a USDA requirement showing a vet cleared them for travel. A small number of states also require a ',
      { highlight: '48-hour quarantine' },
      " on arrival. We'll let you know if either applies to your adoption."
    ]
  },
  {
    q: { bold: 'What if the dog', light: "isn't a good fit for my home?" },
    a: [
      "It happens, and that's okay. Our adoption contract actually ",
      { highlight: 'requires you to return the dog to us' },
      " if things don't work out — rather than rehome them yourself. We'd rather take them back and find a better match than have a dog bounced around to strangers."
    ]
  },
  {
    q: { bold: 'I rent my home.', light: 'Can I still adopt or foster?' },
    a: [
      "Yes! Renting doesn't disqualify you. You'll just need to provide ",
      { highlight: 'written permission from your landlord' },
      ' confirming that pets are allowed. A quick email or note from them is all we need.'
    ]
  },
  {
    q: { bold: 'The dog is listed as a mix.', light: 'What are they mixed with?' },
    a: [
      "Honestly? Sometimes we don't know. We can usually make an ",
      { highlight: 'educated guess' },
      " based on how they look, but we can't always be certain — especially with litters where multiple dogs may have been the father. If knowing the exact mix matters to you, a ",
      { highlight: 'DNA test' },
      ' is always an option after adoption.'
    ]
  },
  {
    q: { bold: 'How long does', light: 'the adoption process take?' },
    a: [
      "We move as fast as we can — our dogs need homes and we want to get them there. Once your application is submitted, someone from our team will reach out to you. The timeline depends on how quickly we can complete reference checks and a home visit, but we don't drag our feet. The dogs are ",
      { highlight: 'always the priority' },
      '.'
    ]
  },
  {
    q: { bold: 'Do you adopt', light: 'outside your local area?' },
    a: [
      'Yes! We adopt all the way down the ',
      { highlight: 'East Coast' },
      ". If your dog is crossing state lines, you'll just need a health certificate — see the fees question above for details."
    ]
  },
  {
    q: { bold: 'Can I adopt if I have', light: 'kids or other pets?' },
    a: [
      "Absolutely. Every dog's profile shows exactly what they're comfortable with — ",
      { highlight: 'good with kids' },
      ', ',
      { highlight: 'good with dogs' },
      ', ',
      { highlight: 'good with cats' },
      ", and more. Check the dog's page before applying and make sure it's a match for your household."
    ]
  },
  {
    q: { bold: 'What happens after', light: 'I submit my application?' },
    a: [
      'Your application goes to our team and ',
      { highlight: 'someone will reach out to you' },
      '. We review every application and nobody gets left in the dark. Just make sure to check your email after submitting.'
    ]
  },
  {
    q: { bold: 'Is the dog', light: 'housetrained?' },
    a: [
      'Every dog is different — check their ',
      { highlight: 'individual profile page' },
      ' for details on their personality, habits, and training. Our foster families know each dog personally and that information comes straight from them.'
    ]
  },
  {
    q: { bold: 'What does the', light: '$15 application fee cover?' },
    a: [
      'The $15 gives you ',
      { highlight: '7 days of access' },
      " to complete your application. The form is detailed and has to be done in one sitting — there's no saving mid-way through. Once you close out, any unsaved progress is lost, so ",
      { highlight: 'set aside a solid chunk of time' },
      ' before you begin. Within your 7-day window you can always get back to your application by clicking ',
      { highlight: 'Adopt' },
      ' in the navigation — it automatically detects your active application and takes you straight to it. You can also access it anytime from your ',
      { highlight: 'Member' },
      ' or by clicking ',
      { highlight: 'Launch App' },
      ' in the header.'
    ]
  }
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, easing: [0.25, 0.46, 0.45, 0.94], delay: i * 0.06 }
  })
}

function renderAnswer(a: FAQItem['a']) {
  return a.map((chunk, i) =>
    typeof chunk === 'string' ? (
      <span key={i}>{chunk}</span>
    ) : (
      <mark
        key={i}
        className="bg-primary-light/30 dark:bg-primary-dark/30 text-text-light dark:text-text-dark px-0.5"
        style={{ borderRadius: 0 }}
      >
        {chunk.highlight}
      </mark>
    )
  )
}

export default function AdoptFAQClient({ dachshunds }) {
  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              FAQ
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-4">
            Frequently Asked <span className="font-light text-muted-light dark:text-muted-dark">Questions</span>
          </h1>
          <p className="text-base text-muted-light dark:text-muted-dark leading-relaxed">
            Everything you need to know about adopting through Little Paws Dachshund Rescue.
          </p>
        </motion.div>

        {/* FAQ list */}
        <dl className="flex flex-col">
          {faq.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              custom={i % 5}
              className="mb-10 sm:mb-12"
            >
              <dt className="mb-3">
                <h2 className="font-quicksand text-xl sm:text-2xl text-text-light dark:text-text-dark leading-snug">
                  <span className="font-bold uppercase">{item.q.bold} </span>
                  <span className="font-light uppercase">{item.q.light}</span>
                </h2>
              </dt>
              <dd>
                <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
                  {renderAnswer(item.a)}
                </p>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>

      {/* Full bleed gallery */}
      {dachshunds.length > 0 && (
        <section aria-label="Available dachshunds" className="border-t border-border-light dark:border-border-dark">
          <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                Available now
              </p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-px scrollbar-none">
            {dachshunds.map((dog: IDachshund) => {
              const { name, photos, isAdoptionPending } = dog.attributes
              const photo = photos?.[0]
              if (!photo) return null

              return (
                <Link
                  key={dog.id}
                  href={`/dachshunds/${dog.id}`}
                  className="relative shrink-0 w-48 sm:w-56 aspect-square overflow-hidden group"
                  aria-label={`Meet ${name}${isAdoptionPending ? ', adoption pending' : ''}`}
                >
                  <Picture
                    src={photo}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                  {isAdoptionPending && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60">
                      <p className="text-white text-[9px] font-mono tracking-[0.15em] uppercase">Pending</p>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-mono tracking-[0.15em] uppercase truncate">{name}</p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
            <Link
              href="/dachshunds"
              className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors"
            >
              View all dachshunds
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="square"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
