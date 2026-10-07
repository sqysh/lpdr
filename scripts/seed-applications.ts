import prisma from 'prisma/client'
import { ApplicationStatus, ApplicationType } from '@prisma/client'
import { ADOPTION_APPLICATION, ADOPTION_APPLICATION_VERSION, type Question } from 'lib/constants/adoption-application.constants'
import { CLOSED_STATUSES } from 'lib/application/application.constants'

const SEED_DOMAIN = 'seed.lpdr.test'

function refuseProd() {
  const reasons: string[] = []
  if (!process.env.DATABASE_URL) reasons.push('DATABASE_URL is not set')
  if (process.env.NODE_ENV === 'production') reasons.push('NODE_ENV is production')
  if (process.env.VERCEL_ENV === 'production') reasons.push('VERCEL_ENV is production')
  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')) reasons.push('Stripe key is live')
  if (reasons.length) {
    console.error(`Refusing to seed: ${reasons.join(', ')}`)
    process.exit(1)
  }
  console.log(`Database: ${new URL(process.env.DATABASE_URL!).host}`)
}

refuseProd()

const PEOPLE = [
  ['Megan', 'Hollis', 'Raleigh', 'NC'],
  ['David', 'Okafor', 'Columbus', 'OH'],
  ['Sarah', 'Lindqvist', 'Richmond', 'VA'],
  ['Tom', 'Becker', 'Pittsburgh', 'PA'],
  ['Alicia', 'Moreno', 'Charlotte', 'NC'],
  ['Jen', 'Park', 'Baltimore', 'MD'],
  ['Robert', 'Ashby', 'Knoxville', 'TN'],
  ['Kelly', 'Duarte', 'Cincinnati', 'OH'],
  ['Brian', 'Walsh', 'Harrisburg', 'PA'],
  ['Laura', 'Nguyen', 'Norfolk', 'VA']
] as const

const DOGS = ['Biscuit', 'Frankie', 'Penny', 'Oscar', 'Lulu', 'Hank']

// [type, status, days ago submitted, assigned]
const PLAN: [ApplicationType, ApplicationStatus, number, boolean][] = [
  ['ADOPTION', 'SUBMITTED', 0, false],
  ['ADOPTION', 'SUBMITTED', 1, false],
  ['ADOPTION', 'SUBMITTED', 3, true],
  ['ADOPTION', 'REQUESTED_MORE_INFO', 5, true],
  ['ADOPTION', 'REFERENCE_CHECK', 8, true],
  ['ADOPTION', 'WAITING_HOME_VISIT', 12, true],
  ['ADOPTION', 'HOME_VISIT_DONE', 15, true],
  ['ADOPTION', 'APPROVED_WAITING', 40, true],
  ['ADOPTION', 'ADOPTED', 60, true],
  ['ADOPTION', 'CANCELLED', 30, true],
  ['FOSTER', 'SUBMITTED', 2, false],
  ['FOSTER', 'APPROVED', 20, true]
]

const pick = <T>(list: readonly T[], i: number) => list[i % list.length]

function shown(q: Question, answers: Record<string, string>) {
  if (!q.showIf) return true
  const want = q.showIf.equals
  const have = answers[q.showIf.id]
  return Array.isArray(want) ? want.includes(have) : have === want
}

function buildAnswers(i: number, person: (typeof PEOPLE)[number], email: string, dogName: string) {
  const [firstName, lastName, city, state] = person
  const known: Record<string, string> = {
    firstName,
    lastName,
    email,
    city,
    state,
    address: `${100 + i * 7} Maple St`,
    zip: String(20000 + i * 311),
    cellPhone: `555-01${String(i).padStart(2, '0')}`,
    employer: pick(['County schools', 'Self employed', 'Regional hospital', 'Retired'], i),
    dogOfInterest: dogName,
    reference1: `Pat Reed, pat${i}@example.com`,
    reference2: `Chris Lane, chris${i}@example.com`,
    reference3: `Sam Ortiz, sam${i}@example.com`
  }
  const answers: Record<string, string> = {}
  for (const section of ADOPTION_APPLICATION) {
    for (const q of section.questions) {
      if (q.type === 'content' || !shown(q, answers)) continue
      if (known[q.id]) answers[q.id] = known[q.id]
      else if (q.type === 'agree') answers[q.id] = 'Agreed'
      else if (q.options?.length) answers[q.id] = pick(q.options, i + q.id.length)
      else if (q.type === 'textarea') answers[q.id] = `Sample answer for "${q.label}" from ${firstName}.`
      else if (q.required) answers[q.id] = 'Sample answer'
    }
  }
  return answers
}

async function clean() {
  const users = await prisma.user.findMany({ where: { email: { endsWith: `@${SEED_DOMAIN}` } }, select: { id: true } })
  const userIds = users.map((u) => u.id)
  const apps = await prisma.application.findMany({ where: { userId: { in: userIds } }, select: { id: true } })
  const appIds = apps.map((a) => a.id)
  await prisma.$transaction([
    prisma.applicationEvent.deleteMany({ where: { applicationId: { in: appIds } } }),
    prisma.application.deleteMany({ where: { id: { in: appIds } } }),
    prisma.user.deleteMany({ where: { id: { in: userIds } } })
  ])
  console.log(`Removed ${appIds.length} applications and ${userIds.length} users`)
}

async function seed() {
  const reviewers = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_USER'] } },
    select: { id: true, firstName: true }
  })
  if (!reviewers.length) console.log('No admins found, everything will be unassigned')

  let created = 0
  for (const [i, [type, status, daysAgo, assigned]] of PLAN.entries()) {
    // Two people apply twice so the "other applications" panel has something in it
    const person = PEOPLE[i % PEOPLE.length]
    const email = `${person[0]}.${person[1]}@${SEED_DOMAIN}`.toLowerCase()
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, firstName: person[0], lastName: person[1], nameConfirmedAt: new Date() }
    })

    const dogName = pick(DOGS, i)
    const submittedAt = new Date(Date.now() - daysAgo * 86_400_000 - i * 3_600_000)
    const reviewer = assigned && reviewers.length ? pick(reviewers, i) : null
    const closed = CLOSED_STATUSES.includes(status)

    await prisma.application.create({
      data: {
        type,
        status,
        userId: user.id,
        assignedToId: reviewer?.id ?? null,
        dogName: type === 'ADOPTION' ? dogName : null,
        answers: buildAnswers(i, person, email, dogName),
        formVersion: ADOPTION_APPLICATION_VERSION,
        submittedAt,
        approvedAt: ['APPROVED', 'APPROVED_WAITING', 'ADOPTED'].includes(status) ? submittedAt : null,
        closedAt: closed ? new Date() : null,
        events: {
          create: [
            { kind: 'SUBMITTED', createdAt: submittedAt },
            ...(reviewer ? [{ kind: 'ASSIGNED' as const, actor: { connect: { id: reviewer.id } } }] : [])
          ]
        }
      }
    })
    created++
  }
  console.log(`Created ${created} applications`)
}

;(process.argv.includes('--clean') ? clean() : seed())
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
