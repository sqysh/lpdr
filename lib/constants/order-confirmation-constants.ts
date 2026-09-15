import { OrderType } from '@prisma/client'

export const ORDER_TYPE_EMAIL_CONFIG: Record<OrderType, { heading: string; body: string }> = {
  ONE_TIME_DONATION: {
    heading: 'Thank you for your donation!',
    body: 'Your one-time donation has been received. Every dollar goes directly toward the dogs in our care.'
  },
  RECURRING_DONATION: {
    heading: 'Your recurring gift is active!',
    body: "Your recurring donation has been set up successfully. Your ongoing support means the world to the dogs in our care — you'll be charged automatically until you choose to cancel."
  },
  ADOPTION_FEE: {
    heading: 'Your adoption fee is received!',
    body: "We've received your adoption fee payment. Our team will be in touch shortly with next steps."
  },
  PURCHASE: {
    heading: 'Your order is confirmed!',
    body: "Thank you for your purchase. You're helping support Little Paws with every order."
  },
  ECARD: {
    heading: 'Your ecard is on its way!',
    body: 'Thank you for your ecard purchase. Your recipient will receive it at the scheduled time.'
  },
  AUCTION_PURCHASE: {
    heading: 'Your auction payment is confirmed!',
    body: 'Thank you for your purchase. Your payment has been received and your item will be on its way soon.'
  }
}

export const ORDER_CONFIRMATION_EMAIL_COLOR = {
  heading: '#09090b',
  body: '#3f3f46',
  accent: '#155e75',
  footer: '#52525b',
  border: '#d4d4d8',
  bgMuted: '#f4f4f5'
}

export const COLOR = ORDER_CONFIRMATION_EMAIL_COLOR
