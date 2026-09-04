'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Heart, Home, Shield, Users, ArrowRight, Dog, Star } from 'lucide-react'
import Link from 'next/link'
import { SectionLabel } from 'components/_primitives'

// ─── Fade up animation helper ─────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-48px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Stat ─────────────────────────────────────────────────────────────────────
function Stat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-32px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-bg-light dark:bg-bg-dark px-6 py-6 border-r border-border-light dark:border-border-dark last:border-r-0"
    >
      <p className="font-quicksand font-black text-3xl xs:text-4xl text-primary-light dark:text-primary-dark leading-none mb-1.5 tabular-nums">
        {value}
      </p>
      <p className="text-[10px] font-mono tracking-[0.18em] uppercase text-muted-light dark:text-muted-dark">{label}</p>
    </motion.div>
  )
}

// ─── Value card ───────────────────────────────────────────────────────────────
function ValueCard({
  icon: Icon,
  title,
  description,
  color,
  bg,
  delay
}: {
  icon: React.ElementType
  title: string
  description: string
  color: string
  bg: string
  delay: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-32px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-bg-light dark:bg-bg-dark p-6 border border-border-light dark:border-border-dark"
    >
      <div className={`w-10 h-10 flex items-center justify-center mb-4 ${bg}`}>
        <Icon size={18} className={color} aria-hidden="true" />
      </div>
      <h3 className="font-quicksand font-black text-base text-text-light dark:text-text-dark mb-2">{title}</h3>
      <p className="text-sm font-nunito text-muted-light dark:text-muted-dark leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ─── Team member ──────────────────────────────────────────────────────────────
function TeamMember({ name, role, delay }: { name: string; role: string; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-24px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-center gap-4 py-4 border-b border-border-light dark:border-border-dark last:border-0"
    >
      <div className="w-10 h-10 shrink-0 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 flex items-center justify-center">
        <span className="text-xs font-black font-mono text-primary-light dark:text-primary-dark">
          {name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-quicksand font-black text-text-light dark:text-text-dark truncate">{name}</p>
        <p className="text-[10px] font-mono tracking-[0.12em] uppercase text-muted-light dark:text-muted-dark mt-0.5">{role}</p>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <main id="main-content" className="bg-bg-light dark:bg-bg-dark min-h-screen">
      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        aria-labelledby="hero-heading"
        className="relative border-b border-border-light dark:border-border-dark overflow-hidden"
      >
        {/* Accent corner */}
        <div className="absolute top-0 right-0 w-px h-full bg-border-light dark:bg-border-dark" aria-hidden="true" />
        <div className="absolute top-0 left-0 w-1 h-24 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />

        <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              <SectionLabel className="mb-4">Our Story</SectionLabel>
            </motion.div>

            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="font-quicksand font-black text-4xl xs:text-5xl sm:text-6xl lg:text-7xl text-text-light dark:text-text-dark leading-[1.02] mb-6 tracking-tight"
            >
              Every dog deserves a second&nbsp;chance.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-base xs:text-lg font-nunito text-muted-light dark:text-muted-dark leading-relaxed max-w-2xl mb-10"
            >
              Little Paws Dachshund Rescue is a volunteer-run, 501(c)(3) nonprofit dedicated to rescuing, rehabilitating, and
              rehoming dachshunds and dachshund mixes in need. Since 2008, we&apos;ve placed thousands of dogs into loving forever
              homes across the eastern United States.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href="/dachshunds"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-primary-light dark:bg-primary-dark text-white text-[10px] font-mono tracking-[0.2em] uppercase hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
              >
                Meet the Dogs
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark text-[10px] font-mono tracking-[0.2em] uppercase hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
              >
                <Heart size={12} aria-hidden="true" /> Support Us
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════ */}
      <section aria-label="Impact statistics" className="border-b border-border-light dark:border-border-dark">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-light dark:bg-border-dark border-x border-border-light dark:border-border-dark">
            <Stat value="3,200+" label="Dogs Rescued" delay={0} />
            <Stat value="16+" label="Years of Service" delay={0.06} />
            <Stat value="200+" label="Active Volunteers" delay={0.12} />
            <Stat value="100%" label="Volunteer Run" delay={0.18} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MISSION
      ══════════════════════════════════════════════ */}
      <section aria-labelledby="mission-heading" className="border-b border-border-light dark:border-border-dark">
        <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <FadeUp>
              <SectionLabel className="mb-4">Our Mission</SectionLabel>
              <h2
                id="mission-heading"
                className="font-quicksand font-black text-3xl xs:text-4xl text-text-light dark:text-text-dark leading-tight mb-6"
              >
                Rescue. Rehabilitate. Rehome.
              </h2>
              <div className="space-y-4 font-nunito text-base text-muted-light dark:text-muted-dark leading-relaxed">
                <p>
                  We pull dachshunds from overcrowded shelters, owner surrenders, and neglect situations across the eastern United
                  States. Every dog in our care receives a full veterinary evaluation, necessary medical treatment, and a loving
                  foster home while they wait for their forever family.
                </p>
                <p>
                  Our rigorous adoption process ensures each dog is matched with a family that fits their personality, energy
                  level, and medical needs — because the right match means a lifelong bond.
                </p>
                <p>
                  As a foster-based rescue, we have no physical shelter. Every dog in our program lives in a real home, learning
                  what it means to be loved.
                </p>
              </div>
            </FadeUp>

            <div className="space-y-px">
              {[
                { label: 'Founded', value: '2008' },
                { label: 'Organization', value: '501(c)(3) Nonprofit' },
                { label: 'Structure', value: '100% Volunteer Run' },
                { label: 'Model', value: 'Foster-Based Rescue' },
                { label: 'Coverage', value: 'Eastern United States' },
                { label: 'Dogs Rescued', value: '3,200+' }
              ].map(({ label, value }, i) => (
                <FadeUp key={label} delay={i * 0.05}>
                  <div className="flex items-center justify-between px-5 py-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
                    <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                      {label}
                    </span>
                    <span className="text-xs font-mono font-black text-text-light dark:text-text-dark">{value}</span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          VALUES
      ══════════════════════════════════════════════ */}
      <section
        aria-labelledby="values-heading"
        className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
      >
        <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 py-16 sm:py-20">
          <FadeUp className="mb-10">
            <SectionLabel className="mb-4">What We Stand For</SectionLabel>
            <h2
              id="values-heading"
              className="font-quicksand font-black text-3xl xs:text-4xl text-text-light dark:text-text-dark leading-tight"
            >
              Our Core Values
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
            <ValueCard
              icon={Heart}
              title="Compassion First"
              description="Every decision we make is guided by what's best for the dog — medically, emotionally, and socially."
              color="text-pink-500"
              bg="bg-pink-500/10"
              delay={0}
            />
            <ValueCard
              icon={Shield}
              title="No Kill Promise"
              description="We never euthanize for time or space. Every dog in our care has a place to stay until the right home is found."
              color="text-emerald-500"
              bg="bg-emerald-500/10"
              delay={0.06}
            />
            <ValueCard
              icon={Home}
              title="Foster-Based Care"
              description="Dogs thrive in homes, not kennels. Our foster network gives every dog a real family experience while they wait."
              color="text-primary-light dark:text-primary-dark"
              bg="bg-primary-light/10 dark:bg-primary-dark/10"
              delay={0.12}
            />
            <ValueCard
              icon={Users}
              title="Community Driven"
              description="We are entirely volunteer-powered. Every foster, transporter, and coordinator gives their time out of love for dachshunds."
              color="text-violet-500"
              bg="bg-violet-500/10"
              delay={0.18}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PROCESS
      ══════════════════════════════════════════════ */}
      <section aria-labelledby="process-heading" className="border-b border-border-light dark:border-border-dark">
        <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 py-16 sm:py-20">
          <FadeUp className="mb-10">
            <SectionLabel className="mb-4">How We Work</SectionLabel>
            <h2
              id="process-heading"
              className="font-quicksand font-black text-3xl xs:text-4xl text-text-light dark:text-text-dark leading-tight"
            >
              From Rescue to Forever Home
            </h2>
          </FadeUp>

          <ol className="space-y-px" aria-label="Rescue process steps">
            {[
              {
                step: '01',
                title: 'Intake',
                description:
                  'We pull dogs from shelters and owner surrenders, conducting a thorough intake assessment to understand their health, temperament, and history.'
              },
              {
                step: '02',
                title: 'Veterinary Care',
                description:
                  'Every dog receives a full vet exam, vaccinations, spay/neuter, dental care, and any necessary medical treatment before entering foster care.'
              },
              {
                step: '03',
                title: 'Foster Placement',
                description:
                  "Dogs are matched with foster families who provide a safe, loving home environment and help us understand the dog's personality and needs."
              },
              {
                step: '04',
                title: 'Adoption Matching',
                description:
                  "We carefully screen adoption applications to find the perfect match — considering lifestyle, experience, home environment, and the dog's specific needs."
              },
              {
                step: '05',
                title: 'Forever Home',
                description:
                  'After a successful meet and greet, the dog goes home with their new family. We remain a resource for adopters for the lifetime of the dog.'
              }
            ].map(({ step, title, description }, i) => (
              <FadeUp key={step} delay={i * 0.07}>
                <div className="grid grid-cols-[48px_1fr] xs:grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr] gap-0 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark">
                  <div className="flex items-center justify-center border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark py-6">
                    <span className="text-[10px] font-mono font-black text-primary-light dark:text-primary-dark tracking-widest">
                      {step}
                    </span>
                  </div>
                  <div className="px-5 xs:px-6 py-5 xs:py-6">
                    <h3 className="font-quicksand font-black text-base text-text-light dark:text-text-dark mb-1.5">{title}</h3>
                    <p className="text-sm font-nunito text-muted-light dark:text-muted-dark leading-relaxed">{description}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TEAM
      ══════════════════════════════════════════════ */}
      <section
        aria-labelledby="team-heading"
        className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
      >
        <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <FadeUp>
              <SectionLabel className="mb-4">The People Behind LPDR</SectionLabel>
              <h2
                id="team-heading"
                className="font-quicksand font-black text-3xl xs:text-4xl text-text-light dark:text-text-dark leading-tight mb-4"
              >
                Our Leadership Team
              </h2>
              <p className="text-sm xs:text-base font-nunito text-muted-light dark:text-muted-dark leading-relaxed mb-8">
                Little Paws is run entirely by passionate volunteers who give their time, expertise, and love to ensure every
                dachshund finds their perfect home. Our board and coordinators bring decades of rescue experience to this work.
              </p>

              <div className="flex items-center gap-3 p-4 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark">
                <div className="w-8 h-8 flex items-center justify-center bg-primary-light/10 dark:bg-primary-dark/10 shrink-0">
                  <Star size={14} className="text-primary-light dark:text-primary-dark" aria-hidden="true" />
                </div>
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark leading-relaxed">
                  Interested in joining our volunteer team? We&apos;re always looking for fosters, transporters, and coordinators.{' '}
                  <Link
                    href="/volunteer"
                    className="text-primary-light dark:text-primary-dark hover:underline focus:outline-none focus-visible:underline"
                  >
                    Apply here →
                  </Link>
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark divide-y divide-border-light dark:divide-border-dark">
                <div className="px-5 py-3.5 bg-surface-light dark:bg-surface-dark">
                  <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                    Board & Coordinators
                  </p>
                </div>
                <div className="px-5">
                  {[
                    { name: 'Julie', role: 'President' },
                    { name: 'Cathy', role: 'Treasurer' },
                    { name: 'Tina', role: 'Secretary' },
                    { name: 'Annie', role: 'Vice President' },
                    { name: 'Nadine', role: 'Director' }
                  ].map(({ name, role }, i) => (
                    <TeamMember key={name} name={name} role={role} delay={i * 0.05} />
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════ */}
      <section aria-labelledby="cta-heading" className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          aria-hidden="true"
        />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />

        <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <FadeUp>
              <SectionLabel className="mb-4">Get Involved</SectionLabel>
              <h2
                id="cta-heading"
                className="font-quicksand font-black text-3xl xs:text-4xl sm:text-5xl text-text-light dark:text-text-dark leading-tight mb-6"
              >
                Ready to make a difference?
              </h2>
              <p className="text-base font-nunito text-muted-light dark:text-muted-dark leading-relaxed mb-8">
                Whether you&apos;re looking to adopt, foster, volunteer, or donate — there&apos;s a place for you in the Little
                Paws family. Every contribution, big or small, saves lives.
              </p>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
                {[
                  { href: '/adopt', icon: Dog, label: 'Adopt a Dog', description: 'Find your perfect match' },
                  { href: '/foster', icon: Home, label: 'Become a Foster', description: 'Open your home temporarily' },
                  { href: '/volunteer', icon: Users, label: 'Volunteer', description: 'Give your time and skills' },
                  { href: '/donate', icon: Heart, label: 'Donate', description: 'Fund medical care & rescue' }
                ].map(({ href, icon: Icon, label, description }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-4 bg-bg-light dark:bg-bg-dark px-5 py-5 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-primary-light/10 dark:bg-primary-dark/10 group-hover:bg-primary-light dark:group-hover:bg-primary-dark transition-colors duration-150">
                      <Icon
                        size={15}
                        className="text-primary-light dark:text-primary-dark group-hover:text-white transition-colors duration-150"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-quicksand font-black text-text-light dark:text-text-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                        {label}
                      </p>
                      <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">{description}</p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="ml-auto text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark group-hover:translate-x-0.5 transition-all duration-150 shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </main>
  )
}
