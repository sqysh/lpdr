export type ChangeType = 'feature' | 'fix' | 'improvement' | 'chore'

export interface ChangelogChange {
  type: ChangeType
  text: string
}

export interface ChangelogEntry {
  version: string
  date: string // ISO date string
  title: string
  changes: ChangelogChange[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.1',
    date: '2026-07-24',
    title: 'Dachshund fetch error tracing',
    changes: [
      {
        type: 'improvement',
        text: 'Added a source tag to every getDachshundsByStatus call so recurring RescueGroups fetch failures can be traced back to the exact page that triggered them'
      },
      {
        type: 'improvement',
        text: 'Parallelized independent dachshund and welcome wiener fetches with Promise.all on the home and admin dachshunds pages'
      }
    ]
  },
  {
    version: '1.3.0',
    date: '2026-07-24',
    title: 'Changelog page and codebase cleanup',
    changes: [
      { type: 'feature', text: 'Added admin changelog page' },
      { type: 'feature', text: 'Added Changelog link to admin navigation' },
      {
        type: 'chore',
        text: 'Reorganized globals.css into grouped sections (tokens, base, utilities, keyframes) and removed a duplicate keyframe definition'
      },
      {
        type: 'improvement',
        text: 'Renamed "Incoming Dachshunds" to "On Hold Dachshunds" and moved the route from /dachshunds/incoming to /dachshunds/hold'
      }
    ]
  },
  {
    version: '1.2.0',
    date: '2026-07-23',
    title: 'Admin tooling, migration diagnostics, and adoption fee tracking',
    changes: [
      {
        type: 'feature',
        text: 'Added /super/logs page — full-bleed log viewer with level filtering, search, and pagination'
      },
      {
        type: 'feature',
        text: 'Added structured application logging (createLog) across auth, migration, and payment flows'
      },
      {
        type: 'feature',
        text: 'Added manual migration re-trigger and troubleshooting panel on user detail page'
      },
      {
        type: 'fix',
        text: 'Fixed Mongo→Postgres migration for users with no staging user record but orphaned related data'
      },
      {
        type: 'fix',
        text: 'Fixed adoption fee migration silently skipping records due to a field name mismatch'
      },
      {
        type: 'fix',
        text: 'Fixed address migration failing due to missing required relation connect and null name field'
      },
      { type: 'feature', text: 'Added Logs link to super dashboard topbar' },
      {
        type: 'feature',
        text: "Added State column to admin adoption fees table, sourced from the linked order's geo data"
      },
      {
        type: 'feature',
        text: 'Added orderId relation on AdoptionFee, linking each fee to its originating order'
      },
      {
        type: 'improvement',
        text: 'Redesigned role editor on user detail page — role cards now show a description and clearly mark the current role'
      },
      {
        type: 'feature',
        text: 'Added Payment column to admin users table showing saved payment method count'
      },
      { type: 'feature', text: 'Added payment methods section to user detail page' },
      {
        type: 'improvement',
        text: 'Reorganized user detail page into tabbed Role / Merge Accounts panel to reduce page length'
      },
      {
        type: 'fix',
        text: 'Fixed migrateAdoptionFees to correctly resolve orphaned adoption fee records with no linked mongo user'
      },
      { type: 'improvement', text: 'Added granular error logging to migration transaction steps' },
      {
        type: 'chore',
        text: 'Recolored favicon, app icons, and OG image to match brand primary color'
      }
    ]
  },
  {
    version: '1.1.0',
    date: '2026-07-22',
    title: 'Post-launch bug fixes',
    changes: [
      {
        type: 'fix',
        text: 'Fixed magic link email delivery to @littlepawsdr.org addresses — restored missing Google Workspace MX records lost during DNS migration'
      },
      {
        type: 'fix',
        text: 'Fixed missing SPF/DKIM/DMARC records for email authentication after nameserver migration'
      },
      {
        type: 'fix',
        text: 'Changed transactional email sender from a no-reply address to reduce spam filtering'
      },
      {
        type: 'fix',
        text: 'Fixed theme flash on page refresh caused by a regression in the dark-mode init script'
      },
      { type: 'fix', text: 'Fixed cookie consent banner hydration mismatch' },
      {
        type: 'fix',
        text: 'Corrected privacy policy link path in all transactional email templates'
      },
      {
        type: 'improvement',
        text: 'Updated privacy policy to reflect database session strategy and added Facebook/magic link auth disclosure'
      },
      {
        type: 'feature',
        text: 'Added animated donate tab (desktop edge-tab and mobile floating button)'
      },
      {
        type: 'feature',
        text: 'Added product delete action with protection against deleting products with existing orders'
      },
      {
        type: 'improvement',
        text: 'Split historical adoption fee total from live site total in admin stats, with labeled breakdown'
      },
      {
        type: 'fix',
        text: 'Fixed dashboard product stats being polluted by historical migrated orders'
      },
      {
        type: 'feature',
        text: 'Set up Google Postmaster Tools monitoring for domain email reputation'
      }
    ]
  },
  {
    version: '1.0.0',
    date: '2026-07-21',
    title: 'Public launch',
    changes: [
      { type: 'chore', text: 'Switched Stripe to live keys and redeployed' },
      {
        type: 'chore',
        text: 'Migrated DNS from GoDaddy to Vercel with full nameserver delegation'
      },
      {
        type: 'fix',
        text: 'Fixed Google and Facebook OAuth redirect URI mismatches for the production domain'
      },
      {
        type: 'feature',
        text: 'Completed full smoke test: Google, Facebook, and magic link sign-in; live donation, subscription, and card save flows'
      },
      { type: 'chore', text: 'Sent launch announcement to admin team' }
    ]
  }
]
