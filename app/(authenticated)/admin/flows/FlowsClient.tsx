'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { FLOWS } from './_components/flowsData'
import { FlowCard } from './_components/FlowCard'

const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'i',
  'me',
  'my',
  'you',
  'your',
  'it',
  'its',
  'to',
  'of',
  'and',
  'or',
  'but',
  'for',
  'on',
  'in',
  'at',
  'do',
  'does',
  'did',
  'if',
  'not',
  'no',
  'so',
  'this',
  'that',
  'have',
  'has',
  'had',
  'with',
  'about',
  'from',
  'will',
  'would',
  'can',
  'could',
  'should',
  'just',
  'like',
  'get',
  'got',
  'hi',
  'hey',
  'hello',
  'need',
  'needed',
  'needs',
  'make',
  'made',
  'want',
  'wanted',
  'know',
  'knew',
  'help',
  'please',
  'thanks',
  'thank',
  'really',
  'actually',
  'also',
  'still',
  'much',
  'many',
  'way',
  'ways',
  'find',
  'see',
  'tell',
  'let',
  'going',
  'go',
  'goes',
  'us',
  'our',
  'we',
  'they',
  'them',
  'she',
  'he',
  'him',
  'her',
  'when',
  'where',
  'why',
  'how',
  'what',
  'who',
  'am',
  'as',
  'im',
  'youre',
  'dont',
  'didnt',
  'wasnt',
  'wont',
  'trying',
  'try',
  'seem',
  'seems',
  'wondering',
  'wonder',
  'wondered',
  'wanting',
  'anything',
  'something',
  'someone',
  'somewhere',
  'never',
  'ever',
  'now',
  'then',
  'last',
  'week',
  'day',
  'days',
  'time',
  'wrong',
  'issue',
  'problem',
  'question',
  'item',
  'account',
  'pay',
  'paid',
  'paying',
  'order',
  'sign',
  'signed',
  'look',
  'looking',
  'looked',
  'around',
  'available'
])

function getQueryWords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

function buildFlowText(flow: (typeof FLOWS)[number]): string {
  return [
    flow.title,
    flow.summary,
    ...flow.steps.flatMap((s) => [s.title, s.caption, s.adminNote ?? '']),
    ...flow.faq.flatMap((f) => [f.question, f.answer])
  ]
    .join(' ')
    .toLowerCase()
}

function scoreAllFlows(words: string[]): Map<string, number> {
  const texts = FLOWS.map((f) => ({ id: f.id, text: buildFlowText(f) }))

  // Rarity weight: words that appear in fewer flows count for more
  const weights = new Map<string, number>()
  for (const w of words) {
    const flowsContaining = texts.filter((t) => t.text.includes(w)).length
    weights.set(w, flowsContaining === 0 ? 0 : 1 / flowsContaining)
  }

  const scores = new Map<string, number>()
  for (const { id, text } of texts) {
    let score = 0
    for (const w of words) {
      if (text.includes(w)) score += weights.get(w) ?? 0
    }
    scores.set(id, score)
  }
  return scores
}

export function FlowsClient() {
  const [query, setQuery] = useState('')

  const queryWords = useMemo(() => getQueryWords(query), [query])
  const isSearching = query.trim().length > 0

  const filtered = useMemo(() => {
    if (!isSearching) return FLOWS.map((f) => ({ flow: f, score: 1 }))

    const scores = scoreAllFlows(queryWords)
    const maxScore = Math.max(...Array.from(scores.values()), 0)
    if (maxScore === 0) return []

    return FLOWS.map((f) => ({ flow: f, score: scores.get(f.id) ?? 0 }))
      .filter((r) => r.score >= maxScore * 0.7)
      .sort((a, b) => b.score - a.score)
  }, [queryWords, isSearching])

  return (
    <div className="w-full px-3.5 sm:px-6 py-4 sm:py-6 max-w-4xl mx-auto">
      <div className="relative mb-5">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-light dark:text-muted-dark"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste a customer question or search a keyword..."
          className="w-full pl-9 pr-9 py-2.5 text-xs font-mono bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark focus:outline-none focus:border-primary-light dark:focus:border-primary-dark transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {isSearching && (
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mb-4 px-1">
          {filtered.length === 0
            ? 'No matches — try pasting a shorter phrase or a few keywords instead of the full email.'
            : `${filtered.length} flow${filtered.length === 1 ? '' : 's'} matched, best match first`}
        </p>
      )}

      <div className="space-y-3 sm:space-y-4">
        {filtered.map(({ flow }) => (
          <FlowCard key={flow.id} {...flow} query={queryWords.join(' ')} forceOpen={isSearching} />
        ))}
      </div>
    </div>
  )
}
