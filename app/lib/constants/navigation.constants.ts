import {
  BookOpen,
  Dog,
  DollarSign,
  Gavel,
  Gift,
  Handshake,
  Heart,
  History,
  Home,
  Info,
  LayoutDashboard,
  LucideIcon,
  Mail,
  Newspaper,
  Package,
  PawPrint,
  Receipt,
  Repeat,
  User,
  Users,
  Workflow
} from 'lucide-react'

export interface Link {
  linkKey: string
  linkText: string
}

export interface Section {
  title: string
  icon: LucideIcon
  links?: Link[]
  linkKey?: string
  priority: number
}

type NavItem = {
  label: string
  icon: typeof Home
  href: string
}

type NavGroup = {
  heading: string
  items: NavItem[]
}

export const HIDDEN_PATHS = [
  '/auth',
  '/admin',
  '/my-pack',
  '/checkout',
  '/order-confirmation',
  '/auctions/',
  '/subscriptions',
  '/super',
  '/privacy-policy',
  '/terms',
  '/donate',
  '/adopt/application'
]

export const mainNavigationLinks = (hasActiveFee: boolean): Section[] => {
  const now = new Date()
  const isFeedAFosterAvailable = now.getMonth() === 6
  return [
    {
      title: 'Home',
      icon: Home,
      linkKey: '/',
      priority: 1
    },
    {
      title: 'About',
      icon: Info,
      linkKey: '/about',
      priority: 1
    },
    {
      title: 'Dachshunds',
      icon: Dog,
      links: [
        {
          linkKey: '/dachshunds',
          linkText: 'Available Dachshunds'
        },
        {
          linkKey: '/dachshunds/hold',
          linkText: 'On Hold'
        },
        {
          linkKey: '/dachshunds/surrender',
          linkText: 'Surrender'
        }
      ],
      priority: 1
    },

    {
      title: 'Donate',
      icon: DollarSign,
      links: [
        {
          linkKey: '/donate',
          linkText: 'One-Time'
        },
        ...(isFeedAFosterAvailable
          ? [
              {
                linkKey: '/feed',
                linkText: 'Feed a Foster'
              }
            ]
          : []),
        {
          linkKey: '/welcomewieners',
          linkText: 'Welcome Wieners'
        },
        {
          linkKey: '/shoptohelp',
          linkText: 'Shop To Help'
        }
      ],
      priority: 1
    },
    {
      title: 'Adopt',
      icon: Heart,
      links: [
        {
          linkKey: hasActiveFee ? '/adopt/application?ref=?tab=orders' : '/adopt',
          linkText: 'Application'
        },
        {
          linkKey: '/adopt/senior',
          linkText: 'Adopt a Senior'
        },
        {
          linkKey: '/adopt/info',
          linkText: 'Information'
        },
        {
          linkKey: '/adopt/fees',
          linkText: 'Fees'
        },
        {
          linkKey: '/adopt/faq',
          linkText: 'FAQ'
        }
      ],
      priority: 1
    },
    {
      title: 'Volunteer',
      icon: Handshake,
      links: [
        {
          linkKey: '/volunteer/application',
          linkText: 'Application'
        },
        {
          linkKey: '/volunteer/foster',
          linkText: 'Foster Application'
        },
        {
          linkKey: '/volunteer/transport',
          linkText: 'Transport Application'
        }
      ],
      priority: 1
    },
    {
      title: 'Merch',
      linkKey: '/merch',
      icon: Gift,
      priority: 1
    },

    {
      title: 'Subscriptions',
      linkKey: '/subscriptions',
      icon: Repeat,
      priority: 2
    },
    {
      title: 'Auctions',
      linkKey: '/auctions',
      icon: Gavel,
      priority: 3
    },
    {
      title: 'Newsletters',
      linkKey: '/newsletters',
      icon: Newspaper,
      priority: 4
    }
  ]
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Overview',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' }]
  },
  {
    heading: 'Fundraising',
    items: [
      { label: 'Orders', icon: Receipt, href: '/admin/orders' },
      { label: 'Auctions', icon: Gavel, href: '/admin/auctions' },
      { label: 'Products', icon: Package, href: '/admin/products' },
      { label: 'Welcome Wieners', icon: Dog, href: '/admin/welcome-wieners' }
    ]
  },
  {
    heading: 'Adoptions',
    items: [
      { label: 'Dachshunds', icon: PawPrint, href: '/admin/dachshunds' },
      { label: 'Adoption Fees', icon: DollarSign, href: '/admin/adoption-fees' }
    ]
  },
  {
    heading: 'People',
    items: [
      { label: 'Users', icon: Users, href: '/admin/users' },
      { label: 'Newsletter', icon: Mail, href: '/admin/newsletter' }
    ]
  },
  {
    heading: 'System',
    items: [
      { label: 'Guide', icon: BookOpen, href: '/admin/guide' },
      { label: 'Flows', icon: Workflow, href: '/admin/flows' },
      { label: 'Changelog', icon: History, href: '/admin/changelog' }
    ]
  },
  {
    heading: 'Account',
    items: [{ label: 'My Pack', icon: User, href: '/my-pack' }]
  }
]
