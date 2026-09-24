import { formatDate } from 'lib/utils/date.utils'
import { AgreementData } from '../AdoptionAgreementClient'
import { Fact } from './AgreementPrimitives'
import { agreementDate } from 'lib/utils/adoption-agreement.utils'

const withDuration = (date: string | Date | null, duration: string | null) =>
  date ? `${formatDate(date)}${duration ? ` · ${duration}` : ''}` : null

export function AgreementDocument({ data }: { data: AgreementData }) {
  const a = data.agreement
  const terms = data.terms
  const adopter = [a.firstName, a.lastName].filter(Boolean).join(' ')
  // Today while signing; once signed, always the day they signed
  const signedOn = a.signatures.find((s) => s.role === 'TERMS_ADOPTER')?.signedAt
  const date = signedOn ? new Date(signedOn) : new Date()

  return (
    <article className="space-y-8">
      <div className="space-y-4 text-sm leading-relaxed text-text-light dark:text-text-dark">
        <p>
          This adoption agreement is entered into this {agreementDate(date)} by and between Little Paws Dachshund Rescue, a Connecticut
          non-profit corporation, and <strong>{adopter}</strong>, resident of the state of <strong>{a.state}</strong> (Adopter(s)).
        </p>
        {terms && <p>{terms.intro}</p>}
      </div>

      <section className="space-y-3">
        <h3 className="text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">The dachshund</h3>
        <div className="flex items-center gap-4">
          {a.dogPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.dogPhoto} alt="" className="w-20 h-20 object-cover shrink-0" />
          )}
          <div>
            <p className="font-quicksand font-bold text-xl text-text-light dark:text-text-dark">{a.dogName}</p>
            <p className="text-xs font-mono text-muted-light dark:text-muted-dark">LPDR Rescue ID #{a.dogRescueId}</p>
          </div>
        </div>
        <dl>
          <Fact label="Sex" value={a.dogSex} />
          <Fact label="Age" value={a.dogAge} />
          <Fact label="Color & markings" value={a.dogColorMarkings} />
          <Fact label="Microchip" value={a.microchipNumber} />
          <Fact label="Microchip company" value={a.microchipManufacturer} />
        </dl>
        {a.microchipRegistration && (
          <p className="text-sm text-muted-light dark:text-muted-dark whitespace-pre-wrap">{a.microchipRegistration}</p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">Medical</h3>
        <dl>
          <Fact label="Rabies" value={withDuration(a.rabiesDate, a.rabiesDuration)} />
          <Fact label="Bordetella" value={withDuration(a.bordetellaDate, a.bordetellaDuration)} />
          <Fact label="Distemper" value={withDuration(a.distemperDate, null)} />
          <Fact label="Spay / neuter" value={withDuration(a.spayNeuterDate, null)} />
          <Fact label="Heartworm test" value={a.heartwormTest} />
          <Fact label="Fecal test" value={a.fecalTest} />
          <Fact label="Heartworm prevention" value={withDuration(a.heartwormPreventionDate, null)} />
          <Fact label="Flea / tick prevention" value={withDuration(a.fleaTickPreventionDate, null)} />
        </dl>
        {a.knownIssues && (
          <div className="p-4 border-l-2 border-primary-light dark:border-primary-dark bg-surface-light dark:bg-surface-dark">
            <p className="text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark mb-1">
              Known health or behavioral issues
            </p>
            <p className="text-sm text-text-light dark:text-text-dark whitespace-pre-wrap">{a.knownIssues}</p>
          </div>
        )}
      </section>

      {terms && (
        <section className="space-y-4">
          <h3 className="font-quicksand font-bold text-xl text-text-light dark:text-text-dark">Terms and Conditions</h3>
          <ol className="space-y-5 text-sm leading-relaxed text-text-light dark:text-text-dark">
            {terms.clauses.map((clause, i) => (
              <li key={i} className="space-y-2">
                {clause.map((block, j) =>
                  Array.isArray(block) ? (
                    <ul key={j} className="list-disc pl-5 space-y-1">
                      {block.map((item, k) => (
                        <li key={k}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>
                      {j === 0 && <span className="font-bold">{i + 1}. </span>}
                      {block}
                    </p>
                  )
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  )
}
