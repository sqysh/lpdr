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
  User,
  PenLine
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
  User,
  PenLine
} as const

export type IconKey = keyof typeof ICON_MAP
