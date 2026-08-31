import { IAuctionBid } from 'types/_auction-bid'
import { IAuctionItem } from 'types/_auction-item'

export type Anomaly = {
  id: string
  type: 'DUPLICATE_BID_AMOUNT' | 'BID_BELOW_CURRENT' | 'RAPID_BIDDING' | 'BID_ON_INSTANT_ITEM'
  itemId: string
  itemName: string
  message: string
  bids: IAuctionBid[]
  createdAt: Date
  dismissed: boolean
}

export type LiveBidEvent = {
  bidId: string
  confirmedBidAmount: number
  totalBids: number
  topBidder: string
  currentBid: number
  minimumBid: number
  status: string
  createdAt: string
  auctionItemId: string
  userId?: string
  userEmail?: string
}

export const ANOMALY_COLORS: Record<Anomaly['type'], string> = {
  DUPLICATE_BID_AMOUNT: 'text-red-500 dark:text-red-400',
  BID_BELOW_CURRENT: 'text-orange-500 dark:text-orange-400',
  RAPID_BIDDING: 'text-yellow-500 dark:text-yellow-400',
  BID_ON_INSTANT_ITEM: 'text-red-500 dark:text-red-400'
}

export const ANOMALY_LABELS: Record<Anomaly['type'], string> = {
  DUPLICATE_BID_AMOUNT: 'Duplicate Bid Amount',
  BID_BELOW_CURRENT: 'Bid Below Current Price',
  RAPID_BIDDING: 'Rapid Bidding Detected',
  BID_ON_INSTANT_ITEM: 'Bid on Instant Buy Item'
}

export const MOCK_ITEMS: IAuctionItem[] = [
  {
    id: 'mock-item-1',
    auctionId: 'mock-auction',
    name: 'Dachshund Oil Painting',
    sellingFormat: 'AUCTION',
    currentBid: 120,
    currentPrice: 120,
    startingPrice: 50,
    buyNowPrice: null,
    minimumBid: 121,
    soldPrice: null,
    totalBids: 8,
    totalQuantity: null,
    requiresShipping: true,
    shippingCosts: 15,
    topBidder: 'Bidder #4',
    status: 'UNSOLD',
    itemBtnText: null,
    isAuction: true,
    isFixed: false,
    retailValue: '$200',
    description: 'A beautiful oil painting of a dachshund.',
    auctionWinningBidderId: null,
    photos: [],
    bids: [
      {
        id: 'mock-bid-1',
        auctionId: 'mock-auction',
        auctionItemId: 'mock-item-1',
        userId: 'user-1',
        bidderId: 'bidder-1',
        bidAmount: 120,
        bidderName: 'Bidder #4',
        email: 'bidder4@test.com',
        status: 'TOP_BID',
        sentWinnerEmail: false,
        emailCount: 0,
        createdAt: new Date(Date.now() - 30000),
        updatedAt: new Date(),
        user: { id: 'user-1', email: 'bidder4@test.com' }
      },
      {
        id: 'mock-bid-2',
        auctionId: 'mock-auction',
        auctionItemId: 'mock-item-1',
        userId: 'user-2',
        bidderId: 'bidder-2',
        bidAmount: 110,
        bidderName: 'Bidder #2',
        email: 'bidder2@test.com',
        status: 'OUTBID',
        sentWinnerEmail: false,
        emailCount: 0,
        createdAt: new Date(Date.now() - 90000),
        updatedAt: new Date(),
        user: { id: 'user-2', email: 'bidder2@test.com' }
      },
      {
        id: 'mock-bid-3',
        auctionId: 'mock-auction',
        auctionItemId: 'mock-item-1',
        userId: 'user-3',
        bidderId: 'bidder-3',
        bidAmount: 110,
        bidderName: 'Bidder #7',
        email: 'bidder7@test.com',
        status: 'OUTBID',
        sentWinnerEmail: false,
        emailCount: 0,
        createdAt: new Date(Date.now() - 89000),
        updatedAt: new Date(),
        user: { id: 'user-3', email: 'bidder7@test.com' }
      }
    ] as unknown as IAuctionBid[],
    instantBuyers: []
  },
  {
    id: 'mock-item-2',
    auctionId: 'mock-auction',
    name: 'LPDR Merch Bundle',
    sellingFormat: 'FIXED',
    currentBid: null,
    currentPrice: 75,
    startingPrice: 75,
    buyNowPrice: 75,
    minimumBid: null,
    soldPrice: null,
    totalBids: 0,
    totalQuantity: 5,
    requiresShipping: true,
    shippingCosts: 10,
    topBidder: null,
    status: 'UNSOLD',
    itemBtnText: null,
    isAuction: false,
    isFixed: true,
    retailValue: '$100',
    description: 'Bundle of LPDR branded merchandise.',
    auctionWinningBidderId: null,
    photos: [],
    bids: [],
    instantBuyers: [
      {
        id: 'mock-buyer-1',
        auctionId: 'mock-auction',
        auctionItemId: 'mock-item-2',
        userId: 'user-4',
        name: 'Jane Smith',
        email: 'jane@test.com',
        totalPrice: 85,
        paymentStatus: 'PAID',
        shippingStatus: 'PENDING_FULFILLMENT',
        createdAt: new Date(Date.now() - 120000),
        updatedAt: new Date(),
        user: { id: 'user-4', email: 'jane@test.com' }
      }
    ]
  },
  {
    id: 'mock-item-3',
    auctionId: 'mock-auction',
    name: 'Handmade Dachshund Quilt',
    sellingFormat: 'AUCTION',
    currentBid: 85,
    currentPrice: 85,
    startingPrice: 40,
    buyNowPrice: null,
    minimumBid: 86,
    soldPrice: null,
    totalBids: 5,
    totalQuantity: null,
    requiresShipping: true,
    shippingCosts: 20,
    topBidder: 'Bidder #1',
    status: 'UNSOLD',
    itemBtnText: null,
    isAuction: true,
    isFixed: false,
    retailValue: '$150',
    description: 'A handmade quilt featuring dachshund patterns.',
    auctionWinningBidderId: null,
    photos: [],
    bids: [
      {
        id: 'mock-bid-4',
        auctionId: 'mock-auction',
        auctionItemId: 'mock-item-3',
        userId: 'user-5',
        bidderId: 'bidder-5',
        bidAmount: 85,
        bidderName: 'Bidder #1',
        email: 'bidder1@test.com',
        status: 'TOP_BID',
        sentWinnerEmail: false,
        emailCount: 0,
        createdAt: new Date(Date.now() - 15000),
        updatedAt: new Date(),
        user: { id: 'user-5', email: 'bidder1@test.com' }
      }
    ] as unknown as IAuctionBid[],
    instantBuyers: []
  }
] as unknown as IAuctionItem[]

export const MOCK_AUCTION = {
  id: 'mock-auction',
  title: 'LPDR Spring Auction 2026',
  status: 'ACTIVE',
  goal: 5000,
  totalAuctionRevenue: 0,
  supporters: 0,
  supporterEmails: [],
  customAuctionLink: 'spring-2026',
  anonymousBidding: true,
  startDate: new Date(),
  endDate: new Date(Date.now() + 86400000),
  createdAt: new Date(),
  updatedAt: new Date(),
  items: MOCK_ITEMS,
  bidders: [
    { id: 'bidder-1', userId: 'user-1', user: { email: 'bidder4@test.com' } },
    { id: 'bidder-2', userId: 'user-2', user: { email: 'bidder2@test.com' } },
    { id: 'bidder-3', userId: 'user-3', user: { email: 'bidder7@test.com' } },
    { id: 'bidder-5', userId: 'user-5', user: { email: 'bidder1@test.com' } }
  ],
  bids: [],
  instantBuyers: [],
  winningBidders: [],
  anomalies: []
}

export const MOCK_ANOMALIES: Anomaly[] = [
  {
    id: 'anomaly-1',
    type: 'DUPLICATE_BID_AMOUNT',

    itemId: 'mock-item-1',
    itemName: 'Dachshund Oil Painting',
    message: '2 bids at $110 on "Dachshund Oil Painting"',
    bids: [
      {
        id: 'mock-bid-2',
        auctionItemId: 'mock-item-1',
        bidAmount: 110,
        bidderName: 'Bidder #2',
        status: 'OUTBID',
        createdAt: new Date(Date.now() - 90000),
        user: { id: 'user-2', email: 'bidder2@test.com' }
      },
      {
        id: 'mock-bid-3',
        auctionItemId: 'mock-item-1',
        bidAmount: 110,
        bidderName: 'Bidder #7',
        status: 'OUTBID',
        createdAt: new Date(Date.now() - 89000),
        user: { id: 'user-3', email: 'bidder7@test.com' }
      }
    ] as unknown as IAuctionBid[],
    createdAt: new Date(Date.now() - 89000),
    dismissed: false
  },
  {
    id: 'anomaly-2',
    type: 'BID_BELOW_CURRENT',

    itemId: 'mock-item-3',
    itemName: 'Handmade Dachshund Quilt',
    message: 'Bid of $80 went through below current price of $85 on "Handmade Dachshund Quilt"',
    bids: [
      {
        id: 'mock-bid-5',
        auctionItemId: 'mock-item-3',
        bidAmount: 80,
        bidderName: 'Bidder #3',
        status: 'TOP_BID',
        createdAt: new Date(Date.now() - 45000),
        user: { id: 'user-6', email: 'bidder3@test.com' }
      }
    ] as unknown as IAuctionBid[],
    createdAt: new Date(Date.now() - 45000),
    dismissed: false
  },
  {
    id: 'anomaly-3',
    type: 'RAPID_BIDDING',

    itemId: 'mock-item-1',
    itemName: 'Multiple Items',
    message: 'User bidder4@test.com placed 4 bids in under 10 seconds',
    bids: [
      {
        id: 'mock-bid-6',
        auctionItemId: 'mock-item-1',
        bidAmount: 105,
        bidderName: 'Bidder #4',
        status: 'OUTBID',
        createdAt: new Date(Date.now() - 12000),
        user: { id: 'user-1', email: 'bidder4@test.com' }
      },
      {
        id: 'mock-bid-7',
        auctionItemId: 'mock-item-1',
        bidAmount: 108,
        bidderName: 'Bidder #4',
        status: 'OUTBID',
        createdAt: new Date(Date.now() - 10000),
        user: { id: 'user-1', email: 'bidder4@test.com' }
      },
      {
        id: 'mock-bid-8',
        auctionItemId: 'mock-item-1',
        bidAmount: 115,
        bidderName: 'Bidder #4',
        status: 'OUTBID',
        createdAt: new Date(Date.now() - 8000),
        user: { id: 'user-1', email: 'bidder4@test.com' }
      },
      {
        id: 'mock-bid-1',
        auctionItemId: 'mock-item-1',
        bidAmount: 120,
        bidderName: 'Bidder #4',
        status: 'TOP_BID',
        createdAt: new Date(Date.now() - 30000),
        user: { id: 'user-1', email: 'bidder4@test.com' }
      }
    ] as unknown as IAuctionBid[],
    createdAt: new Date(Date.now() - 8000),
    dismissed: false
  },
  {
    id: 'anomaly-4',
    type: 'BID_ON_INSTANT_ITEM',

    itemId: 'mock-item-2',
    itemName: 'LPDR Merch Bundle',
    message: 'A bid went through on "LPDR Merch Bundle" which is an instant buy item',
    bids: [
      {
        id: 'mock-bid-9',
        auctionItemId: 'mock-item-2',
        bidAmount: 75,
        bidderName: 'Bidder #9',
        status: 'TOP_BID',
        createdAt: new Date(Date.now() - 5000),
        user: { id: 'user-7', email: 'bidder9@test.com' }
      }
    ] as unknown as IAuctionBid[],
    createdAt: new Date(Date.now() - 5000),
    dismissed: false
  }
]

export const MOCK_LIVE_FEED: LiveBidEvent[] = [
  {
    bidId: 'mock-bid-1',
    confirmedBidAmount: 120,
    totalBids: 8,
    topBidder: 'Bidder #4',
    currentBid: 120,
    minimumBid: 121,
    status: 'TOP_BID',
    createdAt: new Date(Date.now() - 30000).toISOString(),
    auctionItemId: 'mock-item-1',
    userId: 'user-1',
    userEmail: 'bidder4@test.com'
  },
  {
    bidId: 'mock-bid-4',
    confirmedBidAmount: 85,
    totalBids: 5,
    topBidder: 'Bidder #1',
    currentBid: 85,
    minimumBid: 86,
    status: 'TOP_BID',
    createdAt: new Date(Date.now() - 15000).toISOString(),
    auctionItemId: 'mock-item-3',
    userId: 'user-5',
    userEmail: 'bidder1@test.com'
  },
  {
    bidId: 'mock-bid-2',
    confirmedBidAmount: 110,
    totalBids: 7,
    topBidder: 'Bidder #2',
    currentBid: 110,
    minimumBid: 111,
    status: 'OUTBID',
    createdAt: new Date(Date.now() - 90000).toISOString(),
    auctionItemId: 'mock-item-1',
    userId: 'user-2',
    userEmail: 'bidder2@test.com'
  }
]
