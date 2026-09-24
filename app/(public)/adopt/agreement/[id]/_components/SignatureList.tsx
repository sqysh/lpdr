import { formatDate } from 'lib/utils/date.utils'

const SIGNATURE_LABEL: Record<string, string> = {
  TERMS_ADOPTER: 'Adopter, agreeing to statements 1 through 20',
  FINANCIAL_FIRST_ADOPTER: 'First adopter, financial agreement',
  FINANCIAL_SECOND_ADOPTER: 'Second adopter, financial agreement',
  REPRESENTATIVE: 'Little Paws Dachshund Rescue'
}

export function SignatureList({ signatures }: { signatures: { role: string; typedName: string; signedAt: string | Date }[] }) {
  return (
    <section className="space-y-3">
      <h3 className="text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">Signatures</h3>
      <ul className="border border-border-light dark:border-border-dark divide-y divide-border-light dark:divide-border-dark">
        {signatures.map((s) => (
          <li key={s.role} className="flex items-end justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="font-signature text-2xl text-text-light dark:text-text-dark truncate">{s.typedName}</p>
              <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">{SIGNATURE_LABEL[s.role] ?? s.role}</p>
            </div>
            <p className="shrink-0 text-[10px] font-mono text-muted-light dark:text-muted-dark">{formatDate(s.signedAt, true)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
