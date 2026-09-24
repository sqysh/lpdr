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
    version: '1.12.0',
    date: '2026-09-23',
    title: 'Adoption agreements',
    changes: [
      {
        type: 'feature',
        text: 'Adoption agreements now happen on the website instead of Jotform. Choose the adopter and the dog, fill in the microchip and medical details, and send it. The adopter signs in, confirms their details, signs the agreement and pays, all in one place'
      },
      {
        type: 'feature',
        text: "The dog's name, age, photo and adoption fee are taken straight from RescueGroups, so they can't be typed in wrong. Dogs that already have an agreement in progress, or have been adopted through the site, are greyed out when choosing"
      },
      {
        type: 'feature',
        text: 'Adopters pay by card on the site, or by Zelle, Venmo or PayPal if they ask. For those, the adopter is emailed the payment details after signing, and payment is recorded from the agreement once it arrives'
      },
      {
        type: 'feature',
        text: "Once the adopter has paid, whoever prepared the agreement gets an email that it's ready to countersign. Countersigning completes the adoption and emails the adopter their copy"
      },
      {
        type: 'feature',
        text: 'An agreement can be cancelled before payment, or marked as returned if the dog comes back. Returns show whether they fall within the two-week trial, and refunds, including partial ones, can be sent from the agreement without opening Stripe'
      },
      {
        type: 'feature',
        text: 'A new Adoption Payments page under Money In lists every adoption payment, however it was paid, with the adoption fee, health certificate and any donation shown separately'
      },
      {
        type: 'feature',
        text: 'Adopters can find their agreements in a new Adoptions tab in My Pack, with a reminder at the top whenever one is waiting for them to sign or pay'
      },
      {
        type: 'improvement',
        text: 'The agreements list highlights anything waiting on Little Paws, like an agreement to countersign, a payment to record or an email that failed to send, and keeps those at the top'
      },
      {
        type: 'improvement',
        text: 'Refunds made directly in Stripe are now recorded on the order automatically, for every kind of payment, not just adoptions'
      },
      {
        type: 'fix',
        text: 'The receipt email for an adoption payment listed the whole amount as a donation. It now shows the adoption fee, health certificate and any additional donation separately'
      }
    ]
  },
  {
    version: '1.11.0',
    date: '2026-09-22',
    title: 'Donor messages and clearer monthly receipts',
    changes: [
      {
        type: 'feature',
        text: 'Donors can leave a message when they give, one-time or monthly, for example when giving in memory of someone. The message shows on the transaction page.'
      },
      {
        type: 'feature',
        text: 'The donate page now links to the monthly giving plans, for anyone who would rather give every month'
      },
      {
        type: 'improvement',
        text: 'The receipt for a monthly or yearly gift now says so plainly: it shows the amount charged today, that it repeats until cancelled, how often, and the date of the next charge'
      },
      {
        type: 'improvement',
        text: 'Donations are no longer capped at $20,000. The only limit now is the one set by the card processor'
      },
      {
        type: 'improvement',
        text: 'The featured auction banner in My Pack fits better on phones, and the tabs at the bottom of My Pack show that they are loading and now look right in dark mode'
      },
      {
        type: 'fix',
        text: 'Monthly gifts showed a subtotal of $0.00 on the receipt. They now show the gift amount'
      },
      {
        type: 'fix',
        text: 'Monthly renewals would have shown the same next charge date every month, and could occasionally have been skipped without being recorded. Each renewal now records its own next charge date, and one that fails to save is retried rather than lost'
      }
    ]
  },
  {
    version: '1.10.0',
    date: '2026-09-18',
    title: 'Donations and subscriptions',
    changes: [
      {
        type: 'feature',
        text: 'A Donations page listing only one-time and recurring donations, from source SITE'
      },
      {
        type: 'feature',
        text: 'A Subscriptions page with one row per monthly donor rather than one row per payment, showing what they give each month, how many payments they have made, how much they have given in total, and the monthly total across every active donor'
      },
      {
        type: 'improvement',
        text: 'The Orders page is now called Transactions and still lists every payment in order. Donations and Subscriptions are narrower views of the same list, so a payment appears in whichever ones apply to it'
      },
      {
        type: 'improvement',
        text: 'The left menu is regrouped. Transactions, Donations, Subscriptions and Adoption Fees sit together under Money In, and Auctions, Products and Welcome Wieners under Programs'
      },
      {
        type: 'improvement',
        text: 'Clicking a row now shows that it is loading, and the link back at the top returns you to the page you came from rather than always to Transactions'
      },
      {
        type: 'fix',
        text: 'The traits listed on a dachshund page did not always match the dog. A dog not suited to a home with cats still read "Good with Cats", and a dog who had never been around children could show a green "Kids OK". Each line now says the actual answer in plain words'
      },
      {
        type: 'fix',
        text: 'Dachshund photos no longer leave a blank space when one fails to load, and the arrows are hidden for a dog with only one photo'
      }
    ]
  },
  {
    version: '1.9.2',
    date: '2026-09-16',
    title: 'Auction anomalies',
    changes: [
      {
        type: 'feature',
        text: 'The auction now records anything that should not be able to happen and emails it. Two things qualify: two bids marked as the top bid on one item, which would bill two people for the same thing, and an auction that ends without winners being worked out, which means nobody has been charged and no payment requests have gone out'
      },
      {
        type: 'improvement',
        text: 'Those emails say what to do about it rather than only that something went wrong, and note that the job retries on its own and nothing needs undoing first'
      },
      {
        type: 'improvement',
        text: 'A winning bidder record now keeps whether automatic payment was attempted and what went wrong if it failed, so a card problem can be told apart from someone who simply does not have automatic payment turned on'
      }
    ]
  },
  {
    version: '1.9.1',
    date: '2026-09-16',
    title: 'Missing payments, refunds and alerts',
    changes: [
      {
        type: 'fix',
        text: 'Five payments went through without being recorded. Stripe was told to notify littlepawsdr.org, which redirects to www, and redirects are not followed for notifications, so nothing arrived. The address is corrected and all five orders and adoption fees have been created'
      },
      {
        type: 'fix',
        text: 'Paying the adoption fee while access is already active is now refused, instead of taking a second payment for the same week'
      },
      {
        type: 'fix',
        text: 'The page now listens for its payment confirmation before the payment is taken. It was listening afterwards, so a fast confirmation could arrive before anyone was listening and the page would sit waiting on a payment that had already gone through'
      },
      {
        type: 'fix',
        text: 'The payment button can no longer be pressed a second time while the first press is still working'
      },
      {
        type: 'fix',
        text: 'Order statuses were all showing in grey, including failed ones, because the colours only matched subscription statuses'
      },
      {
        type: 'feature',
        text: 'Refunded orders now read as refunded: muted in the list, a total of what has been refunded at the top, and a note on the order itself explaining that the amounts shown are what was originally charged'
      },
      {
        type: 'feature',
        text: 'A refunded order has a button to email the supporter. Pick what happened and it sends, no message to write, and the order records that it went so nobody sends it twice'
      },
      {
        type: 'feature',
        text: 'A daily check compares payments taken in Stripe against orders on the site and emails if any are missing.'
      },
      {
        type: 'feature',
        text: 'If an auction ends but winners cannot be worked out, an email now goes out saying so. Nothing is charged and no winner emails go out in that situation, and until now nothing said it had happened'
      },
      {
        type: 'feature',
        text: 'When winners stop being chased for payment, the auction address is emailed with who never paid and how much is outstanding'
      },
      {
        type: 'improvement',
        text: 'Every address the site gives out now uses www, matching where the site actually serves. The sitemap also pointed at an old domain'
      },
      {
        type: 'improvement',
        text: 'A published draft auction now shows its items, so the crew can share a preview before bidding opens'
      },
      {
        type: 'improvement',
        text: 'The auction announcement bar updates when an auction opens or closes without needing a page reload, and no longer appears on auction pages'
      },
      {
        type: 'improvement',
        text: 'Ended auctions can be opened from the auctions list again, which is where winners and fulfilment live'
      },
      {
        type: 'improvement',
        text: 'Filters on the Welcome Wieners page wrap on a phone instead of running off the side of the screen'
      }
    ]
  },
  {
    version: '1.9.0',
    date: '2026-09-15',
    title: 'Auction bidding, winner payments and the end-of-auction run',
    changes: [
      {
        type: 'feature',
        text: 'Bidding now happens on the item page itself instead of in a pop-up. The current bid, the minimum and your own standing all stay on screen and update as other people bid'
      },
      {
        type: 'feature',
        text: 'The page tells you whether you are the top bidder or have been outbid, on both the item page and the grid, so you no longer have to work it out from the numbers'
      },
      {
        type: 'feature',
        text: 'Instant Bid now asks you to tap twice, and shows that a bid is binding and that all sales are final before it is placed'
      },
      {
        type: 'feature',
        text: 'Items can be added to an auction after it has started. Existing items lock their price, quantity and shipping once bidding is open, while the name, description and photos stay editable'
      },
      {
        type: 'fix',
        text: 'A winner who pressed pay twice could be charged twice. Each winner now has one payment that is reused rather than a new one created on every attempt'
      },
      {
        type: 'fix',
        text: 'A payment that went through but lost its confirmation would leave the page spinning with no explanation. It now says the payment may have gone through and to check your email before trying again'
      },
      {
        type: 'fix',
        text: 'Signing in from an emailed payment link sent people to My Pack instead of back to the payment page'
      },
      {
        type: 'fix',
        text: 'Opening a winner payment link while signed in as someone else showed a broken page. It now says which account the link belongs to and offers to switch'
      },
      {
        type: 'improvement',
        text: 'Winner emails now show items and shipping as separate lines, and reminders read as reminders rather than repeating the original congratulations'
      },
      {
        type: 'improvement',
        text: 'Bidder names are now worked out before the page is sent, so full names are no longer included in the auction page for anyone to find. New accounts also show a first name and initial by default instead of bidding anonymously'
      },
      {
        type: 'improvement',
        text: 'The Bidders tab lists every bid a person placed in order, with the item and whether that bid is still leading, instead of grouping them by item'
      },
      {
        type: 'improvement',
        text: 'The auction overview now shows how many new supporters signed up during the auction and how many of them went on to bid'
      },
      {
        type: 'chore',
        text: 'Auction money is now handled as exact decimals from the bid through to the receipt, so totals cannot drift by fractions of a cent'
      }
    ]
  },
  {
    version: '1.8.0',
    date: '2026-09-11',
    title: 'Adoption application access and bypass codes',
    changes: [
      {
        type: 'fix',
        text: 'Access to the adoption application was granted by a browser setting that anyone could change by hand. It now checks the paid fee record and its expiry date'
      },
      {
        type: 'fix',
        text: 'Bypass codes could be used more than once to keep extending access without paying. A code now grants a single week and does nothing while access is already active'
      },
      {
        type: 'fix',
        text: 'Fixed the bypass code rotation running three times a month instead of every two weeks'
      },
      {
        type: 'improvement',
        text: 'Rebuilt the pre-application flow with shared validation, and combined the two-step code check into one so entering a valid code takes you straight to the application'
      },
      {
        type: 'improvement',
        text: 'Dropped the state field from the pre-application form; it was already recorded automatically and nothing used what people typed'
      },
      {
        type: 'fix',
        text: 'Fixed the pre-application page flashing on screen for a moment before redirecting people who already have access'
      },
      {
        type: 'improvement',
        text: 'Dropdown fields now match the rest of the form styling'
      }
    ]
  },
  {
    version: '1.7.0',
    date: '2026-09-11',
    title: 'Checkout form rewrite and instant buy pricing fix',
    changes: [
      {
        type: 'fix',
        text: 'Fixed instant buy taking its price from the browser instead of the database. The amount is now looked up server-side from the item, along with checks that the auction is running, the item is a fixed-price listing, and it has not already sold'
      },
      {
        type: 'fix',
        text: 'Fixed the pay button spinning forever when a card payment came back without either a success or an error, which left people unable to try again'
      },
      {
        type: 'improvement',
        text: 'Rebuilt checkout, contact and newsletter forms on react-hook-form with shared validation rules, so field errors are consistent and the same rules apply in the browser and on the server'
      },
      {
        type: 'improvement',
        text: 'Address saving is now validated properly, including the state field which was never checked'
      },
      {
        type: 'chore',
        text: 'Extracted the checkout step flow, cart totals and Stripe payment handling into shared hooks, cutting the checkout page roughly in half and giving the three payment forms one implementation instead of three'
      }
    ]
  },
  {
    version: '1.6.0',
    date: '2026-09-11',
    title: 'Bot protection on sign-in and draft auction visibility',
    changes: [
      {
        type: 'feature',
        text: 'Added Cloudflare Turnstile to the magic link sign-in form. Sign-in now goes through a server action that verifies the token before sending anything, so posting directly to the auth endpoint no longer works'
      },
      {
        type: 'feature',
        text: 'Draft auctions are hidden from the public site until an admin turns them on, so items can be added and priced before anyone sees them'
      },
      {
        type: 'improvement',
        text: 'Turnstile verification checks the hostname and the form the token was minted for, not just that it passed, so a token from another site or another form cannot be reused'
      },
      {
        type: 'fix',
        text: 'Added the Cloudflare challenge domains to the content security policy'
      },
      {
        type: 'fix',
        text: 'Blocked crafted sign-in redirects that could have sent people to an outside site after logging in'
      },
      {
        type: 'fix',
        text: 'Sign in links no longer break for people on work email. Corporate mail filters open every link in a message to check it is safe, which was using up the link before the recipient clicked it. The email now points at a confirmation page, so only pressing the button signs you in'
      }
    ]
  },
  {
    version: '1.5.0',
    date: '2026-09-03',
    title: 'Server action guards, client bundle leaks, and upcoming auctions',
    changes: [
      {
        type: 'fix',
        text: 'Added missing auth guards to super user and admin dashboard reads (admin users, managed users, user search, audit logs, Pusher events, service health, pulse stats, cron jobs, dashboard data), all of which were reachable without a session'
      },
      {
        type: 'fix',
        text: 'Fixed the Pusher server credentials and Prisma client being bundled into the browser on the super dashboard and product form, caused by a shared channel constant and a log helper crossing the server boundary'
      },
      {
        type: 'fix',
        text: 'Split the public auction item page onto its own action with an explicit select; it was rendering bidder emails and names into the page for anyone to read'
      },
      {
        type: 'fix',
        text: 'Fixed the outbid email link using a mistyped environment variable, which produced broken URLs in every outbid notification'
      },
      {
        type: 'fix',
        text: 'Filtered the public welcome wieners list to live, unarchived entries; unpublished ones were visible'
      },
      {
        type: 'fix',
        text: 'Added an ownership check to email change verification so a token can only be redeemed by the account that requested it'
      },
      {
        type: 'feature',
        text: 'Upcoming auctions now appear on the public auctions page above past auctions, with their own card treatment, detail page state, and no bidding path until the auction opens'
      },
      {
        type: 'feature',
        text: 'Added a layout guard on the super dashboard so non-super users are redirected instead of seeing an empty shell'
      },
      {
        type: 'improvement',
        text: 'Locked the end date and custom link on active auctions in both the settings form and the server action, closing a path that ended an auction without going through the end flow'
      },
      {
        type: 'improvement',
        text: 'Added rate limiting to newsletter signup and email change requests'
      },
      {
        type: 'improvement',
        text: 'Added Zod validation and a slug collision check to auction create and update'
      },
      {
        type: 'chore',
        text: 'Standardized server actions on a single result shape and replaced the per-model serializers with one generic Decimal walker, which also fixed legitimate zero values being converted to null'
      },
      {
        type: 'chore',
        text: 'Consolidated Prisma query args into the types layer and added server-only to the Prisma client, auth guards, Pusher, Resend, and Stripe modules'
      },
      {
        type: 'chore',
        text: 'Removed unused auction anomaly actions left over from the original live auction page'
      }
    ]
  },
  {
    version: '1.4.0',
    date: '2026-08-31',
    title: 'Prisma 7 upgrade, payment security, and migration fixes',
    changes: [
      {
        type: 'chore',
        text: 'Upgraded Prisma from 5 to 7, including the new prisma.config.ts connection setup and Neon driver adapter'
      },
      {
        type: 'fix',
        text: 'Fixed createPaymentIntent trusting a client-supplied userId instead of the verified session, which allowed spoofed anonymous payment attempts'
      },
      {
        type: 'feature',
        text: 'Added rate limiting to payment intent creation (5 attempts per user per 10 minutes) plus a daily cleanup cron for stale attempt records'
      }
    ]
  },
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
