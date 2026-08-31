import {
  Heart,
  ShoppingCart,
  RefreshCw,
  Gavel,
  Truck,
  MousePointerClick,
  CreditCard,
  CheckCircle,
  Mail,
  Package,
  Calendar,
  Trophy,
  Bell,
  FileText,
  Send,
  User
} from 'lucide-react'

export const ICON_MAP = {
  Heart,
  ShoppingCart,
  RefreshCw,
  Gavel,
  Truck,
  MousePointerClick,
  CreditCard,
  CheckCircle,
  Mail,
  Package,
  Calendar,
  Trophy,
  Bell,
  FileText,
  Send,
  User
} as const

export type IconKey = keyof typeof ICON_MAP
