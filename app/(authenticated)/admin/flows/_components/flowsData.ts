import { FlowStepData } from './FlowDiagram'
import { IconKey } from './iconMap'

export type FlowData = {
  id: string
  icon: IconKey
  title: string
  summary: string
  steps: FlowStepData[]
  faq: { question: string; answer: string }[]
}

export const FLOWS: FlowData[] = [
  {
    id: 'auth',
    icon: 'MousePointerClick',
    title: 'Signing in',
    summary: 'Required before any payment, three ways to do it',
    steps: [
      {
        icon: 'MousePointerClick',
        title: 'Tries to pay for something',
        caption: 'Checkout, donation, adoption fee, or an auction bid.'
      },
      {
        icon: 'CheckCircle',
        title: 'Prompted to sign in',
        caption: 'Google, Facebook, or a magic link sent to their email.'
      },
      {
        icon: 'Mail',
        title: 'Confirms their identity',
        caption: 'Google and Facebook are instant. Magic link needs an email click.'
      },
      {
        icon: 'CheckCircle',
        title: 'Returns to what they were doing',
        caption: 'Picks up exactly where they left off, no lost progress.'
      }
    ],
    faq: [
      {
        question: 'Can someone browse the site without an account?',
        answer:
          'Yes. Browsing dachshunds, the auction, merch, and everything else on the site does not require an account. Sign in is only required the moment someone tries to spend money — checkout, a donation, an adoption fee, or placing a bid.'
      },
      {
        question: 'What are the three sign-in options?',
        answer:
          'Google, Facebook, or a magic link. A magic link is a one-time sign-in link sent to their email — they click it and are signed in automatically, no password needed.'
      },
      {
        question: 'Does someone need to create a separate password for the site?',
        answer:
          'No. There are no passwords anywhere on the site. Every sign-in method either uses an existing Google or Facebook account, or a magic link emailed to them.'
      },
      {
        question: 'What happens if they close the tab before clicking the magic link?',
        answer:
          'The link is still valid and waiting in their email as long as they have not clicked it yet. Each magic link only works once — after it is clicked it cannot be reused, so if they need to sign in again later they will need a fresh link.'
      },
      {
        question: 'Where do I see which sign-in method someone used?',
        answer: 'On the Users page, open their profile to see their linked account details.'
      }
    ]
  },
  {
    id: 'my-pack',
    icon: 'User',
    title: 'My Pack — the member dashboard',
    summary: 'Where signed-in users manage everything themselves',
    steps: [
      { icon: 'User', title: 'Account tab', caption: 'Name, email, saved payment methods, shipping address.' },
      { icon: 'Package', title: 'Orders tab', caption: 'Merch, Welcome Wiener, and Feed a Foster purchase history.' },
      {
        icon: 'Heart',
        title: 'Giving tab',
        caption: 'Recurring donation subscriptions and one-time donation history.'
      },
      { icon: 'Gavel', title: 'Auctions tab', caption: 'Bids placed, items won, and auction purchase history.' },
      { icon: 'CheckCircle', title: 'Settings tab', caption: 'Anonymous bidding and auto-pay toggles.' }
    ],
    faq: [
      {
        question: 'Can a user cancel their own recurring donation?',
        answer: 'Yes, from the Giving tab. You do not need to cancel it for them.'
      },
      {
        question: 'Can a user update their own shipping address or payment method?',
        answer:
          'Yes, from the Account tab. They can add or remove saved cards and update their shipping address at any time.'
      },
      {
        question: 'Where does a user turn on auto-pay for auctions?',
        answer:
          'The Settings tab. Auto-pay requires a saved payment method and a saved address first — if either is missing, the site walks them to the Account tab to add it before the toggle will turn on.'
      },
      {
        question: 'What is anonymous bidding?',
        answer:
          "A setting in the Settings tab that hides a user's name from other bidders when they place a bid. It does not affect anything on your side — you still see their name in the admin."
      },
      {
        question: 'Can a user see their full order history in one place?',
        answer:
          'Not in a single list — it is split by type. Orders tab covers merch, Wiener, and Foster purchases. Giving tab covers donations. Auctions tab covers bids and wins. This mirrors how the admin Orders page separates things too.'
      },
      {
        question: 'What if a user wants to change their email address?',
        answer:
          'They can request an email change from the Account tab. A verification link is sent to the new address, and they need to click it to confirm before the change takes effect.'
      }
    ]
  },
  {
    id: 'adoption',
    icon: 'Heart',
    title: 'Adoption application',
    summary: 'Applicant signs in, pays a fee, fills out a form, you review it',
    steps: [
      { icon: 'MousePointerClick', title: 'Visits Adopt page', caption: 'Reads terms and agrees to continue.' },
      {
        icon: 'MousePointerClick',
        title: 'Signs in',
        caption: 'Google, Facebook, or a magic link email. Required before paying.'
      },
      {
        icon: 'CreditCard',
        title: 'Pays $15 fee',
        caption: 'Or enters a bypass code to skip the fee.',
        adminNote: 'Shows in Orders as Adoption fee'
      },
      { icon: 'FileText', title: 'Fills out application', caption: 'The application form is embedded on the site.' },
      {
        icon: 'CheckCircle',
        title: 'You review it',
        caption: 'Application goes to RescueGroups for review.',
        adminNote: 'Review happens in RescueGroups, not here'
      }
    ],
    faq: [
      {
        question: 'Does the applicant need an account?',
        answer:
          'Yes. Everyone must sign in through Google, Facebook, or a magic link email before they can pay the fee. There is no guest checkout.'
      },
      {
        question: 'Where do I actually review the application?',
        answer:
          'In RescueGroups, not on this site. The Little Paws site only handles the fee payment and gates access to the application form. The application content itself lives in RescueGroups where you already review it.'
      },
      {
        question: 'How do I see who paid the fee?',
        answer: 'Go to Orders and filter by Adoption fee. Each row is one applicant who paid.'
      },
      {
        question: 'What is a bypass code?',
        answer:
          'A rotating code that lets an applicant skip the $15 fee. Useful for waiving the fee for certain applicants. It rotates automatically on a schedule.'
      },
      {
        question: 'Does someone need an account just to look at the dogs available for adoption?',
        answer:
          'No. Browsing the dachshunds available for adoption is open to everyone. An account is only required when they are ready to pay the $15 application fee and submit an application.'
      }
    ]
  },
  {
    id: 'checkout',
    icon: 'ShoppingCart',
    title: 'Checkout — merch, Welcome Wiener, Feed a Foster',
    summary: 'Customer signs in, adds items to cart, and pays',
    steps: [
      {
        icon: 'ShoppingCart',
        title: 'Adds to cart',
        caption: 'Merch, a Welcome Wiener sponsorship, or a Feed a Foster item.'
      },
      {
        icon: 'MousePointerClick',
        title: 'Signs in',
        caption: 'Google, Facebook, or a magic link email. Required before checkout.'
      },
      { icon: 'CreditCard', title: 'Pays at checkout', caption: 'One payment for the whole cart.' },
      {
        icon: 'CheckCircle',
        title: 'Order is created',
        caption: 'One order can contain a mix of item types.',
        adminNote: 'Shows in Orders as Purchase'
      },
      { icon: 'Mail', title: 'Confirmation email sent', caption: 'Customer gets an automatic receipt.' },
      {
        icon: 'Package',
        title: 'Ships if physical',
        caption: 'Merch needs shipping. Wiener and Foster do not.',
        adminNote: 'Flagged amber in Orders until marked shipped'
      }
    ],
    faq: [
      {
        question: 'Does someone need an account to buy something?',
        answer:
          'Yes. Every purchase requires signing in first, through Google, Facebook, or a magic link sent to their email. There is no guest checkout.'
      },
      {
        question: 'How do I know if an order needs shipping?',
        answer:
          'Orders that contain a physical merch item are flagged amber in the Orders list with a truck icon. Welcome Wiener and Feed a Foster items never need shipping.'
      },
      {
        question: 'A customer bought three different types of items in one order — is that normal?',
        answer:
          'Yes. A single checkout can contain any mix of merch, Welcome Wiener sponsorships, and Feed a Foster items. They all appear as line items inside one order.'
      },
      {
        question: 'How do I mark something as shipped?',
        answer:
          'Open the order, find the Fulfillment section, and click Mark as Shipped. The customer gets an automatic email when you do this.'
      }
    ]
  },
  {
    id: 'recurring',
    icon: 'RefreshCw',
    title: 'Recurring donation',
    summary: 'Donor picks a tier, signs in, and it renews automatically',
    steps: [
      { icon: 'Trophy', title: 'Picks a tier', caption: 'Bronze through Elite, monthly or yearly toggle.' },
      {
        icon: 'MousePointerClick',
        title: 'Signs in',
        caption: 'Google, Facebook, or a magic link email. Required before paying.'
      },
      { icon: 'CreditCard', title: 'Saves a card', caption: 'Card is saved securely for future charges.' },
      {
        icon: 'Calendar',
        title: 'Renews automatically',
        caption: 'Charged on the same date every period, no action needed.',
        adminNote: 'Shows in Orders as one row with lifetime value — click it to see every renewal'
      },
      {
        icon: 'Bell',
        title: 'If a renewal fails',
        caption: 'Donor gets an automatic email to update their card.',
        adminNote: 'Order shows red in Orders list'
      }
    ],
    faq: [
      {
        question: 'What are the subscription tiers?',
        answer:
          'Sixteen tiers from $10 to $500 a month, grouped into four ranks — Bronze, Silver, Gold, and Elite. Each tier has a themed name like Tail Wagger or Pack Champion. The donor toggles between Monthly and Yearly at the top of the page — Yearly shows the same 16 tiers at 10x the monthly price, billed once a year instead of monthly.'
      },
      {
        question: 'Does a donor need an account to donate one time too?',
        answer:
          'Yes. Every payment on the site, one-time or recurring, requires signing in first through Google, Facebook, or a magic link email.'
      },
      {
        question: 'Why does a subscription only show as one row in Orders, even though it has renewed many times?',
        answer:
          'Each subscription is grouped into a single row showing the lifetime total, so the Orders list does not get cluttered with a new row every time it renews. Click that row to open the order detail page, which lists every individual renewal underneath it. Every other order type — adoption fees, merch, auctions — still shows as its own separate row.'
      },
      {
        question: 'A renewal failed — do I need to do anything?',
        answer:
          'No. The donor already received an automatic email telling them their card failed and asking them to update it. You can see the failure reason on the order if you want to follow up personally, but it is not required.'
      },
      {
        question: 'Can a donor cancel their own recurring donation?',
        answer: 'Yes, from their My Pack account under Giving. You do not need to cancel it for them.'
      },
      {
        question: 'Does the tier name show up anywhere in the admin?',
        answer:
          'Yes — the tier name is stored on the order and visible on the order detail page and in My Pack, so you can see exactly which level a donor is on.'
      }
    ]
  },
  {
    id: 'auction',
    icon: 'Gavel',
    title: 'Auction bidding and payment',
    summary: 'Anyone can browse, signing in is required to bid or buy',
    steps: [
      { icon: 'Gavel', title: 'Browses the auction', caption: 'Anyone can view items and details without signing in.' },
      {
        icon: 'MousePointerClick',
        title: 'Signs in to bid',
        caption: 'Clicking Bid or Buy Now prompts sign in first, then continues automatically.'
      },
      {
        icon: 'Gavel',
        title: 'Places a bid or buys instantly',
        caption: 'Auction-format items get bids, fixed-price items use Buy Now.'
      },
      {
        icon: 'Bell',
        title: 'Gets outbid',
        caption: 'Previous top bidder gets an automatic email.',
        adminNote: 'Only applies to auction-format items, not Buy Now'
      },
      {
        icon: 'Trophy',
        title: 'Auction ends',
        caption: 'Highest bidder wins, or instant buyers already have their item.'
      },
      {
        icon: 'CreditCard',
        title: 'Winner pays',
        caption: 'Auto-pay charges automatically if set up, otherwise winner pays manually.'
      },
      { icon: 'Truck', title: 'Item ships', caption: 'If the item requires shipping.' }
    ],
    faq: [
      {
        question: 'Does someone need an account just to look around?',
        answer:
          'No. Anyone can browse the auction and view item details without signing in. Sign in is only required the moment they click Bid or Buy Now — once they sign in, they land right back where they were and can continue.'
      },
      {
        question: 'What is auto-pay?',
        answer:
          'A setting a bidder can turn on in their account so their saved card is charged automatically the moment the auction ends, no manual payment step needed.'
      },
      {
        question: 'Why did auto-pay not charge a winner?',
        answer:
          'Auto-pay only works if the bidder has both a saved payment method and a saved address on file. If either is missing, auto-pay cannot run and the winner instead receives an automatic email asking them to pay manually.'
      },
      {
        question: 'What is the difference between winning a bid and Buy Now?',
        answer:
          'Winning a bid means the item went to auction and they had the highest bid when it closed. Buy Now means they paid the fixed price instantly without any bidding. Both end up as a paid order, just through different paths.'
      },
      {
        question: 'Does the outbid email send automatically?',
        answer: 'Yes, every time someone is outbid on an active auction item. No action needed from you.'
      }
    ]
  },
  {
    id: 'shipping',
    icon: 'Truck',
    title: 'Order shipping',
    summary: 'What needs to physically go in the mail',
    steps: [
      {
        icon: 'CheckCircle',
        title: 'Order confirmed',
        caption: 'Payment succeeded, order appears in your Orders list.'
      },
      {
        icon: 'Package',
        title: 'Flagged if physical',
        caption: 'Amber highlight with a truck icon means it needs shipping.'
      },
      { icon: 'Send', title: 'You ship it', caption: 'Package and ship directly, there is no warehouse.' },
      {
        icon: 'Mail',
        title: 'Mark as shipped',
        caption: 'Click the button on the order, customer is notified automatically.'
      }
    ],
    faq: [
      {
        question: 'How do I find everything that needs shipping?',
        answer:
          'Any order flagged amber with a truck icon in the Orders list needs shipping. These are always physical merch items — donations and digital items never need this.'
      },
      {
        question: 'What happens after I click Mark as Shipped?',
        answer:
          'The order updates immediately and the customer receives an automatic shipping confirmation email. You do not need to send anything yourself.'
      },
      {
        question: 'Where do items ship from?',
        answer: 'Directly from your home. There is no separate fulfillment center or warehouse.'
      }
    ]
  }
]
