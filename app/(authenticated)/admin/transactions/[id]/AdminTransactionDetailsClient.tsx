'use client'

import { IOrder, ISubscriptionOrder } from 'types/order.types'
import { TransactionTopbar } from './_components/TransactionTopbar'
import { TransactionFailureBanner } from './_components/TransactionFailureBanner'
import { TransactionRefundBanner } from './_components/TransactionRefundBanner'
import { TransactionItemsSection } from './_components/TransactionItemsSection'
import { TransactionSubscriptionHistory } from './_components/TransactionSubscriptionHistory'
import { TransactionFulfillmentSection } from './_components/TransactionFulfillmentSection'
import { TransactionCustomerSection } from './_components/TransactionCustomerSection'
import { TransactionPaymentSection } from './_components/TransactionPaymentSection'
import { TransactionAnomalyBanner } from './_components/TransactionAnomalyBanner'
import { TransactionRefundEmailPanel } from './_components/TransactionRefundEmailPanel'
import { TransactionDonorMessage } from './_components/TransactionDonorMessage'

type Props = {
  order: IOrder
  subscriptionOrders: ISubscriptionOrder[]
}

export function AdminTransactionDetailsClient({ order, subscriptionOrders }: Props) {
  const isRefunded = order.status === 'REFUNDED'
  const hasPhysical = order.items.some((i) => i.isPhysical)
  const hasSubscriptionHistory = subscriptionOrders?.length > 1

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <TransactionTopbar order={order} />
      <TransactionAnomalyBanner order={order} />
      <TransactionFailureBanner order={order} />
      <TransactionRefundBanner order={order} />

      <div className="w-full max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left */}
        <div className="space-y-6 min-w-0">
          {order.donorMessage && <TransactionDonorMessage message={order.donorMessage} />}
          <TransactionItemsSection order={order} />
          {hasSubscriptionHistory && <TransactionSubscriptionHistory orders={subscriptionOrders} currentOrderId={order.id} />}
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* A refunded order is not going anywhere, so the fulfilment panel would be telling
              Nadine to post something that has been paid back. */}
          {hasPhysical && !isRefunded && <TransactionFulfillmentSection order={order} />}
          <TransactionRefundEmailPanel order={order} />
          <TransactionCustomerSection order={order} />
          <TransactionPaymentSection order={order} />
        </div>
      </div>
    </main>
  )
}
