import { SectionHeading } from './SectionHeading'

export function DachshundDescription({ a }) {
  const cleanHtml = (a?.descriptionText ?? a?.descriptionHtml)
    ?.replace(/<img[^>]*tracker\.rescuegroups\.org[^>]*>/gi, '')
    ?.replace(/\sstyle="[^"]*"/gi, '')
    ?.replace(/\sstyle='[^']*'/gi, '')

  const KNOWN_SECTIONS = [
    'Overview',
    'Environment',
    'Pets & People',
    'Pets and People',
    'Location',
    'Health',
    'Personality'
  ]

  function splitIntoSections(text: string): { heading: string | null; body: string }[] {
    const decoded = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, '’')
      .replace(/&ldquo;/g, '“')
      .replace(/&rdquo;/g, '”')
      .replace(/\n{2,}/g, '\n\n')
      .trim()

    // Build a regex that matches any known section label at the start of a "word boundary"
    const pattern = new RegExp(`(${KNOWN_SECTIONS.join('|')})\\s`, 'g')

    const matches = [...decoded.matchAll(pattern)]

    if (matches.length === 0) {
      // No known section labels found — treat as plain prose, single section
      return [{ heading: null, body: decoded }]
    }

    const sections: { heading: string | null; body: string }[] = []

    // Everything before the first match is intro/overview text with no heading
    const firstIndex = matches[0].index ?? 0
    if (firstIndex > 0) {
      const intro = decoded.slice(0, firstIndex).trim()
      if (intro) sections.push({ heading: null, body: intro })
    }

    for (let i = 0; i < matches.length; i++) {
      const heading = matches[i][1]
      const start = (matches[i].index ?? 0) + matches[i][0].length
      const end = i + 1 < matches.length ? matches[i + 1].index : decoded.length
      const body = decoded.slice(start, end).trim()
      sections.push({ heading, body })
    }

    return sections
  }

  type RequirementPill = { label: string; value: string }

  function extractRequirementPills(text: string): { pills: RequirementPill[]; remainder: string } {
    const lines = text.split('\n')

    const pillPattern = /^([A-Za-z][A-Za-z\s]{1,20}):\s*(.+)$/
    const pills: RequirementPill[] = []
    const remainderLines: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      const match = trimmed.match(pillPattern)
      if (match) {
        pills.push({ label: match[1].trim(), value: match[2].trim() })
      } else {
        // Keep the line as-is (including blank lines) so paragraph breaks survive
        remainderLines.push(line)
      }
    }

    return { pills, remainder: remainderLines.join('\n') }
  }

  function processDescription(raw: string) {
    const decoded = raw
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, '’')
      .replace(/&ldquo;/g, '“')
      .replace(/&rdquo;/g, '”')
      .replace(/\n{2,}/g, '\n\n')
      .trim()

    const { pills, remainder } = extractRequirementPills(decoded)
    const sections = splitIntoSections(remainder)

    return { pills, sections }
  }
  return (
    <div>
      <SectionHeading>About {a?.name}</SectionHeading>

      {(() => {
        const { pills, sections } = processDescription(cleanHtml ?? '')

        return (
          <>
            {pills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {pills.map((pill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-xs font-mono"
                  >
                    <span className="text-muted-light dark:text-muted-dark uppercase tracking-wide text-[10px]">
                      {pill.label}
                    </span>
                    <span className="text-text-light dark:text-text-dark font-semibold">
                      {pill.value}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {sections.map((section, i) => (
              <div
                key={i}
                className={
                  section.heading
                    ? 'border-l-2 border-primary-light dark:border-primary-dark pl-4 mb-6'
                    : 'mb-6'
                }
              >
                {section.heading && (
                  <h3 className="font-quicksand font-black text-lg text-primary-light dark:text-primary-dark mb-2">
                    {section.heading}
                  </h3>
                )}
                {section.body.split('\n\n').map((para, j) => (
                  <p
                    key={j}
                    className="text-sm text-text-light dark:text-text-dark leading-relaxed mb-3"
                  >
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </>
        )
      })()}
    </div>
  )
}
