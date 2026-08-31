import {
  BookOpen,
  Package,
  Gavel,
  Dog,
  Heart,
  Users,
  DollarSign,
  ShoppingBag,
  ClipboardList,
  Settings,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle,
  KeyRound,
  Database,
  RefreshCw,
  AlertCircle,
  Mail,
  UserPlus
} from 'lucide-react'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
  { id: 'signing-in', label: 'Signing In', icon: KeyRound },
  { id: 'data-migration', label: 'Data Migration', icon: Database },
  { id: 'admin-access', label: 'Admin Access', icon: UserPlus },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
  { id: 'auctions', label: 'Auctions', icon: Gavel },
  { id: 'dachshunds', label: 'Dachshunds', icon: Dog },
  { id: 'welcome-wieners', label: 'Welcome Wieners', icon: Heart },
  { id: 'pack-members', label: 'Pack Members', icon: Users },
  { id: 'donations', label: 'Donations', icon: DollarSign },
  { id: 'products', label: 'Products & Merch', icon: ShoppingBag },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
  { id: 'adoptions', label: 'Adoption Applications', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings }
]

function SectionHeader({
  id,
  icon: Icon,
  title
}: {
  id: string
  icon: React.ElementType
  title: string
}) {
  return (
    <div id={id} className="flex items-center gap-3 mb-6 pt-2">
      <Icon
        className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0"
        aria-hidden="true"
      />
      <h2 className="font-mono text-sm tracking-[0.2em] uppercase text-text-light dark:text-text-dark">
        {title}
      </h2>
    </div>
  )
}

function Note({
  type = 'info',
  children
}: {
  type?: 'info' | 'warning' | 'success' | 'error'
  children: React.ReactNode
}) {
  const styles = {
    info: 'border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/5 dark:bg-primary-dark/5 text-primary-light dark:text-primary-dark',
    warning: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400',
    success: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    error: 'border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400'
  }
  const icons = { info: Info, warning: AlertTriangle, success: CheckCircle, error: AlertCircle }
  const Icon = icons[type]

  return (
    <div className={`flex items-start gap-3 border px-4 py-3 mb-4 ${styles[type]}`}>
      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
      <p className="font-mono text-[11px] leading-relaxed">{children}</p>
    </div>
  )
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <span className="shrink-0 w-5 h-5 flex items-center justify-center border border-border-light dark:border-border-dark font-mono text-[9px] text-muted-light dark:text-muted-dark mt-0.5">
        {number}
      </span>
      <p className="font-mono text-xs text-text-light dark:text-text-dark leading-relaxed">
        {children}
      </p>
    </div>
  )
}

function Q({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border-light dark:border-border-dark pb-5 mb-5 last:border-b-0 last:mb-0 last:pb-0">
      <p className="font-mono text-xs font-bold text-text-light dark:text-text-dark mb-2">
        {question}
      </p>
      <div className="font-mono text-xs text-muted-light dark:text-muted-dark leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}

export default function AdminGuideClient() {
  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Guide" />

      <div className="w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-8 items-start">
          {/* Sticky sidebar nav */}
          <nav
            aria-label="Guide sections"
            className="xl:sticky xl:top-16 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
          >
            <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                Sections
              </p>
            </div>
            <ul>
              {sections.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border-light dark:border-border-dark last:border-b-0 font-mono text-[10px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors group"
                  >
                    <Icon
                      className="w-3 h-3 shrink-0 group-hover:text-primary-light dark:group-hover:text-primary-dark"
                      aria-hidden="true"
                    />
                    {label}
                    <ChevronRight
                      className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="space-y-16 max-w-3xl">
            {/* Getting Started */}
            <section>
              <SectionHeader id="getting-started" icon={BookOpen} title="Getting Started" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Q question="What is the admin panel?">
                  <p>
                    The admin panel is the control center for most things on the Little Paws site —
                    orders, auctions, pack members, donations, and more. Dachshund profiles are the
                    one exception — those are managed entirely in RescueGroups, not here. Only users
                    with the ADMIN role can access the admin panel.
                  </p>
                </Q>
                <Q question="How do I navigate?">
                  <p>
                    Use the left sidebar to navigate between sections. The breadcrumb at the top of
                    each page shows where you are. Most pages have a header with a count and any
                    relevant actions.
                  </p>
                </Q>
                <Q question="Something looks wrong or broken — what do I do?">
                  <Step number={1}>
                    Refresh the page. Most display issues resolve on their own.
                  </Step>
                  <Step number={2}>
                    Try the same action on a different page or a different browser to see if the
                    issue follows you.
                  </Step>
                  <Step number={3}>
                    Check the Flows page to confirm you are looking in the expected place.
                  </Step>
                  <Step number={4}>
                    If it still looks wrong after that, reach out to Sqysh at greg@sqysh.com.
                    Include a screenshot and a description of what you were doing when it happened.
                  </Step>
                </Q>
              </div>
            </section>

            {/* Signing In */}
            <section>
              <SectionHeader id="signing-in" icon={KeyRound} title="Signing In" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Note type="info">
                  This site does not use passwords. There is no account creation form. Pack members
                  sign in using Google, Facebook, or a magic link sent to their email. This is by
                  design — it is simpler and more secure.
                </Note>
                <Note type="success">
                  When a pack member signs in for the first time, their full history from the
                  previous Little Paws site is automatically restored — orders, donations, auction
                  bids, and purchases. They will see a welcome message confirming their data is
                  ready. No action is needed from you.
                </Note>
                <Q question="How does signing in work?">
                  <p>There are three ways to sign in:</p>
                  <p>
                    <strong>Google</strong> — click Sign in with Google on the login page. If the
                    member has a Google account (Gmail, Google Workspace, etc.), they click once and
                    they are in. No password required.
                  </p>
                  <p>
                    <strong>Facebook</strong> — click Sign in with Facebook on the login page. If
                    the member has a Facebook account, they click once and they are in. No password
                    required.
                  </p>
                  <p>
                    <strong>Magic Link</strong> — the member enters their email address and clicks
                    Send Link. They receive an email with a button that signs them in automatically
                    when clicked. The link expires after a short time for security, and only works
                    once.
                  </p>
                </Q>
                <Q question="Why no passwords?">
                  <p>
                    Passwords are the most common cause of account problems — people forget them,
                    reuse them, or get phished. Magic links, Google sign-in, and Facebook sign-in
                    are all more secure and easier to use. There is nothing to remember and nothing
                    to reset.
                  </p>
                </Q>
                <Q question="A member says they cannot sign in — what do I tell them?">
                  <p>
                    First, confirm which method they are using. Then walk them through the relevant
                    steps below.
                  </p>
                  <p>
                    <strong>If using Google or Facebook:</strong> Make sure they are clicking the
                    correct sign-in button and selecting the correct account. If they have multiple
                    Google or Facebook accounts, they may be choosing the wrong one.
                  </p>
                  <p>
                    <strong>If using magic link:</strong> Ask them to check their spam or junk
                    folder — the email sometimes lands there. The link expires quickly and only
                    works once, so they may need to request a new one. Make sure they are opening
                    the link on the same device and browser they requested it from.
                  </p>
                </Q>
                <Q question="A member says they have two accounts — what happened?">
                  <p>
                    This can happen if someone signed in with Google, Facebook, or a magic link
                    using different email addresses at different times. If they used the same email
                    every time, the system will have linked them automatically regardless of which
                    method they used, so this only comes up when two different emails were used.
                  </p>
                  <Note type="warning">
                    Merging accounts is permanent and cannot be undone. One account is deleted and
                    all of its history is moved into the other. Only do this if the member clearly
                    confirms they want both accounts&apos; history combined into one. If you have
                    any doubt about which account should be the primary one, or whether they
                    actually want to merge at all, contact Sqysh before using the Merge Account
                    tool.
                  </Note>
                  <p>
                    If the member does want to proceed, use the Merge Account tool on their profile
                    page to combine them.
                  </p>
                </Q>
                <Q question="Can a pack member change their email address?">
                  <p>
                    Yes — pack members can change their email directly from My Pack. They click the
                    edit icon next to their email address, enter the new one, and a verification
                    link is sent to the new address. Once verified the change takes effect
                    immediately.
                  </p>
                </Q>
                <Q question="A pack member says the magic link email never arrived — what do I tell them?">
                  <p>Ask them to:</p>
                  <Step number={1}>Check their spam, junk, and promotions folders.</Step>
                  <Step number={2}>
                    Make sure they typed their email address correctly on the login page.
                  </Step>
                  <Step number={3}>
                    Wait one to two minutes and check again — delivery can be slightly delayed.
                  </Step>
                  <Step number={4}>Try requesting a new link.</Step>
                  <p>
                    If none of that works, they can try signing in with Google or Facebook instead
                    if they have an account on the same email address.
                  </p>
                </Q>
                <Q question="Can I create an account for someone?">
                  <p>
                    No — accounts are created automatically the first time someone signs in. There
                    is no manual account creation. Just tell the member to go to the sign in page
                    and use Google, Facebook, or a magic link.
                  </p>
                </Q>
                <Q question="Is the site safe to use on a phone?">
                  <p>
                    Yes — the site works on any device including phones and tablets. The sign in
                    process is the same. For magic links, make sure the member opens the link on the
                    same device they requested it from, or the sign in may not complete.
                  </p>
                </Q>
                <Q question="How do I sign out?">
                  <p>
                    Click Sign Out in the sidebar on any admin page, or from the top bar in My Pack.
                    Signing out ends your session immediately — you will need to sign in again the
                    next time you visit.
                  </p>
                </Q>
              </div>
            </section>

            {/* Data Migration */}
            <section>
              <SectionHeader id="data-migration" icon={Database} title="Data Migration" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Note type="info">
                  When a pack member signs in for the first time, their data from the previous site
                  is automatically migrated into this one. This happens in the background and takes
                  only a few seconds.
                </Note>
                <Q question="What data is migrated?">
                  <p>The following is restored automatically on first login:</p>
                  <p>
                    <strong>Orders</strong> — product purchases, welcome wiener orders, and ecard
                    orders.
                  </p>
                  <p>
                    <strong>Donations</strong> — one-time donations made through the previous site.
                  </p>
                  <p>
                    <strong>Adoption fees</strong> — application fees paid on the previous site.
                  </p>
                  <p>
                    <strong>Auction history</strong> — bids placed, items won, and instant buy
                    purchases across all past auctions.
                  </p>
                  <p>
                    <strong>Shipping address</strong> — the address on file from the previous site.
                  </p>
                </Q>
                <Q question="What is NOT migrated?">
                  <p>
                    <strong>Recurring donations</strong> — these were processed entirely through
                    PayPal and were never stored on the Little Paws platform.
                  </p>
                  <p>
                    <strong>Passwords</strong> — this site is passwordless. Members sign in with
                    Google or a magic link.
                  </p>
                  <p>
                    <strong>Account settings</strong> — preferences like anonymous bidding are reset
                    to defaults.
                  </p>
                </Q>
                <Q question="A pack member signed in but their history did not appear — what do I do?">
                  <Step number={1}>
                    Confirm they are signing in with the exact same email they used on the previous
                    site. A different email will not find their old history, even if it belongs to
                    the same person.
                  </Step>
                  <Step number={2}>
                    Ask them to sign out completely and sign back in. The restore only runs on a
                    genuine first sign-in for that account.
                  </Step>
                  <Step number={3}>
                    Check their My Pack Orders, Giving, and Auctions tabs individually — history is
                    split by type, so something might be visible in one tab and not another.
                  </Step>
                  <Step number={4}>
                    Check the Users page for their profile. If an account already exists for their
                    email, open it and see whether any history is attached at all, even if it is not
                    showing correctly on their end.
                  </Step>
                  <Step number={5}>
                    If it still does not appear after all of the above, contact Sqysh with their
                    email address and roughly when they tried signing in. He can check whether the
                    migration ran and why it may have failed.
                  </Step>
                </Q>
                <Q question="Will migration run more than once?">
                  <p>
                    No — once a pack member has been successfully migrated their staging data is
                    deleted. The migration will not run again on future logins.
                  </p>
                </Q>
                <Q question="Does migration affect the admin dashboard stats?">
                  <p>
                    No — migrated orders and donations are tagged as historical data and are
                    excluded from the admin dashboard revenue totals and order counts. Only activity
                    from this site is included in the stats.
                  </p>
                </Q>
              </div>
            </section>

            {/* Admin Access */}
            <section>
              <SectionHeader id="admin-access" icon={UserPlus} title="Admin Access" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Q question="How do I make someone an admin?">
                  <Step number={1}>Go to Users in the sidebar.</Step>
                  <Step number={2}>Click Grant Admin Access at the top of the page.</Step>
                  <Step number={3}>
                    Search for their name or email. If they already have an account, click their
                    name and confirm.
                  </Step>
                  <Step number={4}>
                    If they do not have an account yet, type their full email address instead. You
                    will see an option to grant access for that email — click it.
                  </Step>
                </Q>
                <Q question="What happens if I grant access to someone who has not signed up yet?">
                  <p>
                    Nothing happens right away. Their admin access is saved and waiting. The moment
                    they sign in for the first time using that exact email — through Google,
                    Facebook, or a magic link — they automatically become an admin. There is nothing
                    else you or they need to do.
                  </p>
                </Q>
                <Q question="How do I know who is still waiting to sign in?">
                  <p>
                    The Users page shows a Waiting to Sign In list whenever someone has been granted
                    access but has not logged in yet. You can revoke access from that list at any
                    time before they sign in.
                  </p>
                </Q>
                <Q question="Does the email have to match exactly?">
                  <p>
                    Yes. Admin access is tied to the exact email address you enter. If they sign in
                    with a different email, even if it belongs to the same person, they will not
                    receive admin access automatically.
                  </p>
                </Q>
                <Q question="Can I make someone an admin if they already have an account?">
                  <p>
                    Yes — this takes effect immediately, no sign-in required. Search for them by
                    name or email, click their result, and confirm.
                  </p>
                </Q>
              </div>
            </section>

            {/* Orders */}
            <section>
              <SectionHeader id="orders" icon={Package} title="Orders" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Note type="warning">
                  Orders highlighted in amber need to be physically shipped. These are your action
                  items.
                </Note>
                <Note type="error">
                  Orders highlighted in red are failed payments. The customer has automatically been
                  sent a failure email with instructions to update their payment method.
                </Note>
                <Q question="How do I mark an order as shipped?">
                  <Step number={1}>Click the order in the orders list.</Step>
                  <Step number={2}>On the order detail page, find the Fulfillment section.</Step>
                  <Step number={3}>
                    Click Mark as Shipped. The customer will automatically receive a shipping
                    confirmation email.
                  </Step>
                </Q>
                <Q question="What do the order statuses mean?">
                  <p>
                    <strong>PENDING</strong> — payment is being processed.
                  </p>
                  <p>
                    <strong>CONFIRMED</strong> — payment succeeded and the order is active.
                  </p>
                  <p>
                    <strong>FAILED</strong> — payment failed. The customer was not charged and has
                    been notified automatically by email.
                  </p>
                </Q>
                <Q question="What should I do when I see a failed order?">
                  <p>
                    Nothing is required — the customer has already received an automated email
                    directing them to update their payment method in My Pack. You can verify the
                    failure reason and when the email was sent in the Payment section of the order
                    detail page.
                  </p>
                </Q>
                <Q question="What do the shipping statuses mean?">
                  <p>
                    <strong>Needs shipping</strong> — item needs to be packaged and sent.
                  </p>
                  <p>
                    <strong>Shipped</strong> — you have marked it as shipped and the customer has
                    been notified.
                  </p>
                  <p>
                    A dash means the order does not require shipping (e.g. donations, auction wins
                    handled separately).
                  </p>
                </Q>
                <Q question="Where do I ship from?">
                  <p>
                    Items ship directly from your home. There is no warehouse or fulfillment center.
                  </p>
                </Q>
              </div>
            </section>

            {/* Subscriptions */}
            <section>
              <SectionHeader id="subscriptions" icon={RefreshCw} title="Subscriptions" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Note type="info">
                  Subscriptions are recurring donations that pack members set up directly on the
                  site. They are processed automatically by Stripe on a monthly or yearly basis — no
                  action is needed from you.
                </Note>
                <Q question="Where do I see subscriptions?">
                  <p>
                    Go to Orders in the sidebar and filter by Recurring. Each row represents one
                    active or past recurring donation. You can click into any order to see the full
                    details including billing history and status.
                  </p>
                </Q>
                <Q question="Can a pack member have more than one subscription?">
                  <p>
                    Yes — pack members can subscribe to multiple tiers at the same time, and can mix
                    monthly and yearly billing. For example, they might be a Den Leader monthly and
                    also a Tail Wagger yearly. Each subscription shows up as a separate row in the
                    orders list. There are 16 tiers ranging from $10 to $500 per month.
                  </p>
                </Q>
                <Q question="Can a pack member cancel their subscription?">
                  <p>
                    Yes — pack members can cancel any subscription at any time directly from My
                    Pack. There are no penalties or fees. The cancellation takes effect immediately
                    and they will not be charged again.
                  </p>
                </Q>
                <Q question="What happens when a recurring payment fails?">
                  <p>
                    Stripe will automatically retry the payment over the following days. If it
                    continues to fail, the subscription will be marked as past due. The pack member
                    will receive an automated email from Stripe prompting them to update their
                    payment method. You do not need to do anything unless they contact you directly.
                  </p>
                </Q>
                <Q question="Can I cancel a subscription on behalf of a pack member?">
                  <p>
                    Not directly from the admin panel currently. If a pack member needs their
                    subscription cancelled and cannot do it themselves, contact Sqysh.
                  </p>
                </Q>
              </div>
            </section>

            {/* Auctions */}
            <section>
              <SectionHeader id="auctions" icon={Gavel} title="Auctions" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Note type="warning">
                  Only one auction can be active at a time. Make sure the previous auction has fully
                  ended before the next one is scheduled to begin.
                </Note>
                <Note type="warning">
                  Auctions are checked once every hour, between 6 AM and 10 PM. Set your start and
                  end time to any full hour within that window — for example 9:00 AM or 7:00 PM. A
                  time outside that window, or a time that is not on the hour, will not take effect
                  until the next hourly check inside the window.
                </Note>
                <Note type="info">
                  Auctions normally start and end automatically based on the dates you set. You do
                  not need to manually start or stop a real auction — the system handles it for you.
                </Note>
                <Note type="info">
                  Want to try out how bidding works before the site goes live? Create an auction and
                  add a few items just like normal. Right now you will see Start, End, and Revert to
                  Draft buttons on the auction — these are temporary, available only during this
                  testing period, and let you manually control an auction instead of waiting for the
                  hourly check. Once the site goes live for real, these buttons will be removed and
                  every auction will run automatically based on its dates, exactly as described
                  below.
                </Note>

                <Q question="How do I create an auction?">
                  <Step number={1}>Go to Auctions in the sidebar.</Step>
                  <Step number={2}>
                    Click New Auction and fill in the title, goal, start date, and end date.
                  </Step>
                  <Step number={3}>
                    Set the start and end time to a full hour between 6 AM and 10 PM — for example
                    9:00 AM or 7:00 PM. Times outside that window or not on the hour will be delayed
                    until the next valid check.
                  </Step>
                  <Step number={4}>
                    Add items under the Items tab. Each item needs a name, starting price, and at
                    least one photo.
                  </Step>
                  <Step number={5}>
                    Double check everything before the start date — once the auction goes live, most
                    settings are locked.
                  </Step>
                </Q>
                <Q question="What do the Start, End, and Revert to Draft buttons do?">
                  <p>
                    These are temporary and only available during this testing period. They let you
                    manually move an auction between states instead of waiting for the automatic
                    hourly check — Start makes it go live immediately, End closes it right away and
                    runs the same winner and payment process a normal ending would, and Revert to
                    Draft sends it back to draft if you started it by mistake. Once the site is live
                    for real, these buttons go away and every auction runs automatically based on
                    its start and end dates.
                  </p>
                </Q>
                <Q question="How does the auction start?">
                  <p>
                    Automatically at the start date and time you set, once the hourly check catches
                    it. (During this testing period only, you can also click Start to make it go
                    live immediately.) A popup notification appears on the site for every visitor,
                    not just pack members — anyone browsing at that moment sees it, whether they are
                    signed in or not. Anyone can browse the auction and view items without an
                    account. Signing in is only required the moment someone tries to bid or use Buy
                    Now.
                  </p>
                </Q>
                <Q question="How does the auction end?">
                  <p>
                    Automatically at the end date and time you set, once the hourly check catches
                    it. (During this testing period only, you can also click End to close it
                    immediately.) A popup notification appears on the site for every visitor at that
                    moment, the same as when it starts. The system identifies winners for each item
                    and sends payment request emails. Winners with auto-pay enabled are charged
                    immediately.
                  </p>
                </Q>
                <Q question="What is auto-pay?">
                  <p>
                    Pack members can enable auto-pay in My Pack. It only works if they have both a
                    saved payment method and a saved address on file. When an auction ends, if they
                    won an item and both are on file, they are charged automatically. If either is
                    missing, auto-pay cannot run and they instead receive the same payment request
                    email as everyone else. No action is needed from you.
                  </p>
                </Q>
                <Q question="What happens if a winner does not pay?">
                  <p>
                    They receive an automated payment request email with a link to the winner
                    payment page. If they still have not paid 24 hours after the auction ends, they
                    receive a daily reminder email for up to 5 days. You can see unpaid winners from
                    the auction Winners tab. Follow up directly with the pack member if it has been
                    longer than that.
                  </p>
                </Q>
                <Q question="Can I edit an auction while it is live?">
                  <p>
                    You can still add brand new items to a live auction at any time — new items
                    always start fresh with no bids, so there is nothing to protect. For items
                    already in the auction, only the name, description, and photos can be changed
                    while it is active. Prices, quantities, and shipping settings on existing items
                    are locked once bidding has started.
                  </p>
                </Q>
                <Q question="What if something goes wrong during the auction?">
                  <p>Contact Sqysh immediately at greg@sqysh.com.</p>
                </Q>
              </div>
            </section>

            {/* Dachshunds */}
            <section>
              <SectionHeader id="dachshunds" icon={Dog} title="Dachshunds" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Q question="Where do dachshund profiles come from?">
                  <p>
                    All dachshund profiles, photos, and statuses come from RescueGroups. The site
                    does not have its own dachshund editor — it pulls the data directly from
                    RescueGroups and displays it.
                  </p>
                </Q>
                <Q question="How do I add a new dachshund or change a status?">
                  <p>
                    Make the change in RescueGroups as you normally do — add the profile, upload
                    photos, and set the status there. The site will pick up the update
                    automatically. There is nothing to do on this site.
                  </p>
                </Q>
                <Q question="A dog I marked as adopted in RescueGroups still shows as available on the site — what do I do?">
                  <p>
                    Give it a little time to sync. If it is still showing incorrectly after a while,
                    contact Sqysh with the dog&apos;s name so he can check the connection to
                    RescueGroups.
                  </p>
                </Q>
              </div>
            </section>

            {/* Welcome Wieners */}
            <section>
              <SectionHeader id="welcome-wieners" icon={Heart} title="Welcome Wieners" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Q question="What is a Welcome Wiener?">
                  <p>
                    Welcome Wieners are dogs in your care that you add profiles for. Each dog can
                    have several specific sponsorship items attached to it, like a leash, a medical
                    bill, or a vet visit. A visitor browses to the Welcome Wieners page, picks any
                    dog, and adds one or more of that dog&lsquo;s items to their cart. There is no
                    limit on how many they can add and nothing ever runs out — every item stays
                    available no matter how many people sponsor it.
                  </p>
                </Q>
                <Q question="How do I add a Welcome Wiener?">
                  <Step number={1}>Go to Welcome Wieners in the sidebar.</Step>
                  <Step number={2}>
                    Click New Welcome Wiener and fill in the dog&apos;s details and story.
                  </Step>
                  <Step number={3}>Upload a photo of the dog.</Step>
                  <Step number={4}>
                    Add the specific sponsorship items for that dog, each with its own name and
                    price.
                  </Step>
                  <Step number={5}>Publish when ready.</Step>
                </Q>
                <Q question="Can a visitor sponsor more than one dog, or more than one item?">
                  <p>
                    Yes. A visitor can add items from as many different dogs as they want into a
                    single cart, mix and match freely, and check out once for everything. There is
                    no limit on quantity and every item can be sponsored any number of times.
                  </p>
                </Q>
                <Q question="How do I see who sponsored a specific item?">
                  <p>
                    Open the order in Orders and check the line items — each one shows which dog and
                    item it was for.
                  </p>
                </Q>
              </div>
            </section>

            {/* Pack Members */}
            <section>
              <SectionHeader id="pack-members" icon={Users} title="Pack Members" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Q question="How do I find a pack member?">
                  <p>
                    Go to Users in the sidebar. Search by name or email. Click a user to see their
                    full profile including order history and total spent.
                  </p>
                </Q>
                <Q question="How do I change a pack member role?">
                  <p>
                    Open the user profile and use the role selector to switch between Pack Member
                    and ADMIN. Click Save role to apply. The change takes effect the next time the
                    user refreshes the page — they do not need to sign out and back in. Be careful —
                    ADMIN gives full access to the admin panel.
                  </p>
                </Q>
                <Q question="Can I delete a pack member?">
                  <p>
                    No — pack member deletion is not available in the admin panel. If a pack member
                    needs to be removed, contact Sqysh.
                  </p>
                </Q>
                <Q question="A pack member says their old orders or history are missing — what do I tell them?">
                  <p>
                    History restores automatically the first time they sign in with the same email
                    they used on the old site. It does not matter whether they use Google, Facebook,
                    or a magic link — any of the three will find and restore their account as long
                    as the email matches.
                  </p>
                  <Step number={1}>
                    Confirm they are signing in with the exact same email they used before. A
                    different email will not find their old history, even if it belongs to the same
                    person.
                  </Step>
                  <Step number={2}>
                    Ask them to sign out completely and sign back in. The restore only runs on a
                    genuine first sign-in for that account.
                  </Step>
                  <Step number={3}>
                    Check their My Pack Orders, Giving, and Auctions tabs individually — history is
                    split by type, so something might be visible in one tab and not another.
                  </Step>
                  <Step number={4}>
                    If it still does not appear after signing out and back in with the correct
                    email, contact Sqysh with their email address and roughly when they tried
                    signing in. He can check whether the migration ran and why it may have failed.
                  </Step>
                </Q>
                <Q question="A pack member says their recurring donation is missing — what do I tell them?">
                  <p>
                    Recurring donations on the previous site were handled entirely by PayPal.
                    Members were redirected away from the site to set up their subscription, and
                    that data was never stored on the Little Paws platform. There is nothing to
                    migrate. Let them know they can set up a new recurring donation directly on this
                    site and it will appear in their history going forward.
                  </p>
                </Q>
              </div>
            </section>

            {/* Donations */}
            <section>
              <SectionHeader id="donations" icon={DollarSign} title="Donations" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Note type="info">
                  Recurring donations from the previous site were processed entirely through PayPal.
                  Members were taken off-site to PayPal to set up their subscription. Those
                  subscriptions were never stored on the Little Paws site and cannot be migrated. If
                  a pack member asks why their recurring donation is not showing, this is why. They
                  are welcome to set up a new recurring donation directly on this site.
                </Note>
                <Q question="Where do I see donations?">
                  <p>
                    All donations appear in the Orders list filtered by type — One-time or
                    Recurring. The Dashboard shows total revenue and a breakdown by source including
                    donations.
                  </p>
                </Q>
                <Q question="What is a bypass code?">
                  <p>
                    The bypass code lets someone skip the $15 adoption application fee. When a pack
                    member enters a valid code on the application page, the fee is waived and they
                    proceed directly to the form. The code rotates automatically on a schedule shown
                    in the Dashboard.
                  </p>
                </Q>
                <Q question="How do I share the bypass code?">
                  <p>
                    The current bypass code is shown at the top of the Dashboard. Click it to copy
                    it to your clipboard, then share it directly with the person who needs it.
                  </p>
                </Q>
              </div>
            </section>

            {/* Products */}
            <section>
              <SectionHeader id="products" icon={ShoppingBag} title="Products & Merch" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Q question="How do I add a new product?">
                  <Step number={1}>Go to Products in the sidebar.</Step>
                  <Step number={2}>
                    Click New Product and fill in the details including name, description, and
                    price.
                  </Step>
                  <Step number={3}>Upload photos and publish when ready.</Step>
                </Q>
                <Q question="How do I fulfill a product order?">
                  <p>
                    Product orders appear in the Orders list with a Needs shipping flag. Package the
                    item and ship it directly to the customer, then mark it as shipped from the
                    order detail page. The customer will receive a confirmation email automatically.
                  </p>
                </Q>
                <Q question="Do I need to do anything for digital products?">
                  <p>
                    If the product does not require shipping, no action is needed after the order is
                    placed. In the orders list, digital-only orders show a dash under Shipping
                    instead of a status, since there is nothing to ship.
                  </p>
                </Q>
              </div>
            </section>

            {/* Newsletter */}
            <section>
              <SectionHeader id="newsletter" icon={Mail} title="Newsletter" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Note type="info">
                  Newsletter has two parts — Subscribers and Issues. They work differently and are
                  not connected to each other automatically.
                </Note>
                <Q question="What are Subscribers?">
                  <p>
                    Anyone who has submitted their email through the newsletter signup form on the
                    site. This list grows automatically as people sign up — there is nothing for you
                    to add manually.
                  </p>
                </Q>
                <Q question="What are Issues?">
                  <p>
                    A record of each newsletter you publish. You create an issue entry with the
                    month, year, and a link to the newsletter PDF or page. This is not the
                    newsletter itself — it is a reference so visitors can browse past issues on the
                    site.
                  </p>
                </Q>
                <Q question="How do I publish a new newsletter issue?">
                  <Step number={1}>Go to Newsletter in the sidebar and open the Issues tab.</Step>
                  <Step number={2}>Click New Issue and select the month and year.</Step>
                  <Step number={3}>Upload or link the newsletter PDF.</Step>
                  <Step number={4}>
                    Send Sqysh the link once it is created so he can build and send the actual email
                    newsletter to subscribers at the right time.
                  </Step>
                  <Step number={5}>
                    Set the issue to live once it is ready to appear on the site.
                  </Step>
                </Q>
                <Q question="Does adding an issue automatically send the newsletter?">
                  <p>
                    No. Adding an issue only creates the record shown on the site for people to
                    browse. The actual email newsletter sent to subscribers is built and sent
                    separately by Sqysh using the link you provide.
                  </p>
                </Q>
                <Q question="How do I see who is subscribed?">
                  <p>
                    Go to Newsletter in the sidebar and open the Subscribers tab to see the full
                    list of emails.
                  </p>
                </Q>
              </div>
            </section>

            {/* Adoptions */}
            <section>
              <SectionHeader id="adoptions" icon={ClipboardList} title="Adoption Applications" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Q question="How does the adoption application process work?">
                  <Step number={1}>
                    An applicant visits the Adopt page. If they are not signed in, they are prompted
                    to sign in first through Google, Facebook, or a magic link email. If they are
                    already signed in, this step is skipped.
                  </Step>
                  <Step number={2}>They agree to the terms.</Step>
                  <Step number={3}>
                    They pay the $15 application fee (or use a bypass code to skip it).
                  </Step>
                  <Step number={4}>
                    They fill out the RescueGroups application form embedded on the site.
                  </Step>
                  <Step number={5}>You review submissions in RescueGroups as normal.</Step>
                </Q>
                <Q question="Where do I review applications?">
                  <p>
                    Applications are submitted through RescueGroups and reviewed there. The LPDR
                    site handles the fee collection and access gate — the actual application review
                    happens in your RescueGroups dashboard.
                  </p>
                </Q>
                <Q question="How do I see who paid the application fee?">
                  <p>
                    Go to Orders and filter by Adoption Fee. Each row represents one applicant who
                    paid the fee.
                  </p>
                </Q>
              </div>
            </section>

            {/* Settings */}
            <section>
              <SectionHeader id="settings" icon={Settings} title="Settings" />
              <div className="border border-border-light dark:border-border-dark p-6 space-y-6">
                <Q question="What can I configure in auction settings?">
                  <p>
                    From the auction Settings tab you can set the start date, end date, goal amount,
                    and toggle visibility.
                  </p>
                </Q>
                <Note type="info">
                  Auctions start and end automatically based on the dates you set. There is nothing
                  to click to make an auction go live or close it.
                </Note>
                <Q question="Does anything run automatically?">
                  <p>
                    Yes — auctions go live and close automatically based on their start and end
                    dates, the bypass code rotates on a schedule, auction auto-pay runs when an
                    auction ends, and outbid notification emails send automatically when a higher
                    bid is placed. No action is needed for these.
                  </p>
                </Q>
                <Q question="Who do I contact for technical issues?">
                  <p>
                    Sqysh at greg@sqysh.com. Include a screenshot and description of what happened
                    and what you were trying to do.
                  </p>
                </Q>
                <Q question="Does the site have a light/dark mode toggle?">
                  <p>
                    No manual toggle — the site automatically matches whichever mode the
                    visitor&apos;s device is set to. If someone&apos;s phone or computer is in dark
                    mode, the site shows dark automatically. If it is in light mode, the site shows
                    light. There is nothing for a visitor or an admin to switch.
                  </p>
                </Q>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
