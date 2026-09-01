'use client'

import { useSession } from 'next-auth/react'
import { useAppDispatch } from 'lib/store/store'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MemberClientProps, MyPackTab } from 'types/_my-pack.types'
import { showToast } from 'lib/store/slices/toastSlice'
import { updateUserName } from 'lib/actions/my-pack/updateUserName'
import { pusherClient } from 'lib/pusher/pusher-client'
import { Header } from 'app/(authenticated)/my-pack/_components/Header'
import { ShippingAddress } from 'app/(authenticated)/my-pack/_components/ShippingAddress'
import { PaymentMethods } from 'app/(authenticated)/my-pack/_components/PaymentMethods'
import { ShippedCelebration } from 'app/(authenticated)/my-pack/_components/ShippedCelebration'
import { setDefaultPaymentMethod } from 'lib/actions/_stripe/setDefaultPaymentMethod'
import { deletePaymentMethod } from 'lib/actions/_stripe/deletePaymentMethod'
import { TopBar } from 'app/(authenticated)/my-pack/_components/TopBar'
import { MyPackNav } from 'app/(authenticated)/my-pack/_components/MyPackNav'
import { Settings } from 'app/(authenticated)/my-pack/_components/Settings'
import { StatsStrip } from 'app/(authenticated)/my-pack/_components/StatsStrip'
import { SectionShell } from 'app/(authenticated)/my-pack/_components/SectionShell'
import { Dog, Gavel, Gift, Package, Pencil, Plus, Repeat } from 'lucide-react'
import { setOpenAddPaymentMethodModal } from 'lib/store/slices/uiSlice'
import { addCardStyles } from 'lib/constants/my-pack.constants'
import Link from 'next/link'
import AddPaymentMethodModal from 'app/(authenticated)/my-pack/_components/AddPaymentMethodModal'
import { toggleAnonymousBidding } from 'lib/actions/user/auction/toggleAnonymousBidding'
import { toggleAutoPay } from 'lib/actions/user/auction/toggleAutoPay'
import { toggleAutoPayCoverFees } from 'lib/actions/user/auction/toggleAutoPayCoverFees'
import { MigrationBanner } from './_components/MigrationBanner'
import { MultiItemOrders } from './_components/MultiItemOrders'
import { AdoptionFees } from './_components/AdoptionFees'
import { Subscriptions } from './_components/Subscriptions'
import { OneTimeDonations } from './_components/OneTimeDonations'
import { Auctions } from './_components/Auctions'

export default function MyPackClient({
  user,
  donations,
  subscriptions,
  auctionParticipation,
  paymentMethods,
  adoptionFees,
  multiItemOrders,
  auctionPurchases,
  hasPendingMigration
}: MemberClientProps) {
  const router = useRouter()
  const session = useSession()
  const dispatch = useAppDispatch()

  const [shippedOrderId, setShippedOrderId] = useState<string | null>(null)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [setDefaultSuccess, setSetDefaultSuccess] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<Record<string, string>>({})
  const [editingName, setEditingName] = useState(false)
  const [firstNameInput, setFirstNameInput] = useState(user.firstName ?? '')
  const [lastNameInput, setLastNameInput] = useState(user.lastName ?? '')
  const [nameLoading, setNameLoading] = useState(false)
  const [anonymousBidding, setAnonymousBidding] = useState(user.anonymousBidding)
  const [autoPay, setAutoPay] = useState(user.autoPay)
  const [autoPayCoverFees, setAutoPayCoverFees] = useState(user.autoPayCoverFees)
  const [autoPayError, setAutoPayError] = useState('')
  const [highlightPaymentMethod, setHighlightPaymentMethod] = useState(false)
  const [highlightAddress, setHighlightAddress] = useState(false)

  const isAuthed = session.status === 'authenticated'

  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') as MyPackTab) ?? 'account'

  const totalGiven = [
    ...(donations ?? []).map((d) => Number(d.amount) || 0),
    ...(subscriptions ?? []).map((s) => Number(s.amount) || 0),
    ...(auctionParticipation ?? []).flatMap((a) =>
      a.items.filter((i) => i.isWinner).map((i) => Number(i.myHighestBid) || 0)
    ),
    ...(adoptionFees ?? []).map((a) => Number(a.feeAmount) || 0),
    ...(multiItemOrders ?? []).map((o) => Number(o.totalAmount) || 0),
    ...(auctionPurchases ?? []).map((o) => Number(o.totalAmount) || 0)
  ].reduce((sum, n) => sum + n, 0)

  const handleSetDefaultPaymentMethod = async (id: string) => {
    const result = await setDefaultPaymentMethod(id)
    if (result.success) {
      setSetDefaultSuccess(id)
      router.refresh()
      setTimeout(() => setSetDefaultSuccess(null), 2000)
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    const result = await deletePaymentMethod(id)
    if (!result.success) {
      setDeleteError((prev) => ({ ...prev, [id]: result.error ?? 'Failed to delete card' }))
    } else {
      router.refresh()
    }
  }

  const handleUpdateName = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setNameLoading(true)
    try {
      const result = await updateUserName({
        firstName: firstNameInput.trim(),
        lastName: lastNameInput.trim()
      })

      if (!result.success) throw new Error(result.error ?? 'Failed to update name')
      dispatch(
        showToast({
          message: 'Name updated',
          description: `Your name is now ${firstNameInput.trim()} ${lastNameInput.trim()}.`,
          type: 'success'
        })
      )
      setEditingName(false)
      router.refresh()
    } catch (err) {
      dispatch(
        showToast({
          message: 'Failed to update name',
          description:
            err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          type: 'error'
        })
      )
    } finally {
      setNameLoading(false)
    }
  }

  const handleToggleAnonymousBidding = async () => {
    const prev = anonymousBidding
    setAnonymousBidding(!prev) // optimistic
    const result = await toggleAnonymousBidding()
    if (!result.success) {
      setAnonymousBidding(prev) // revert on failure
      dispatch(
        showToast({
          message: 'Failed to update setting',
          description: result.error ?? 'Something went wrong.'
        })
      )
    }
  }

  const handleToggleAutoPay = async () => {
    if (!autoPay) {
      if (!paymentMethods?.length) {
        setAutoPayError('A saved payment method is required to enable auto-pay.')
        setTimeout(() => {
          router.push(`/my-pack?tab=account`, { scroll: false })
          setTimeout(() => {
            setHighlightPaymentMethod(true)
          }, 750)
          setTimeout(() => {
            dispatch(setOpenAddPaymentMethodModal())
            setHighlightPaymentMethod(false)
          }, 1500)
        }, 1750)
        return
      }
      if (!user?.address?.addressLine1) {
        setAutoPayError('A shipping address is required to enable auto-pay.')
        setTimeout(() => {
          router.push(`/my-pack?tab=account`, { scroll: false })
          setTimeout(() => {
            setHighlightAddress(true)
          }, 750)
          setTimeout(() => {
            setAddressModalOpen(true)
            setHighlightAddress(false)
          }, 1500)
        }, 1750)
        return
      }
      setAutoPayError(null)
    }

    const prev = autoPay
    setAutoPay(!prev)
    const result = await toggleAutoPay()
    if (!result.success) {
      setAutoPay(prev)
      dispatch(
        showToast({
          type: 'error',
          message: 'Failed to update setting',
          description: result.error ?? 'Something went wrong.'
        })
      )
    }
  }
  const handleToggleAutoPayCoverFees = async () => {
    const prev = autoPayCoverFees
    setAutoPayCoverFees(!prev)
    const result = await toggleAutoPayCoverFees()
    if (!result.success) {
      setAutoPayCoverFees(prev)
      dispatch(
        showToast({
          message: 'Failed to update setting',
          description: result.error ?? 'Something went wrong.'
        })
      )
    }
  }

  useEffect(() => {
    if (!isAuthed || !session.data?.user?.id) return

    const channel = pusherClient.subscribe(`user-${session.data.user.id}`)

    channel.bind('order-shipped', (data: { orderId: string }) => {
      setShippedOrderId(data.orderId)
      router.refresh()
    })

    return () => {
      channel.unbind('order-shipped')
      pusherClient.unsubscribe(`user-${session.data.user.id}`)
    }
  }, [isAuthed, router, session.data?.user?.id])

  return (
    <>
      {shippedOrderId && (
        <ShippedCelebration
          key={shippedOrderId}
          orderId={shippedOrderId}
          onClose={() => setShippedOrderId(null)}
        />
      )}

      <AddPaymentMethodModal />

      <main
        id="main-content"
        className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
      >
        <TopBar />

        <MigrationBanner initiallyPending={hasPendingMigration} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
          <Header
            editingName={editingName}
            firstNameInput={firstNameInput}
            handleUpdateName={handleUpdateName}
            lastNameInput={lastNameInput}
            nameLoading={nameLoading}
            setEditingName={setEditingName}
            setFirstNameInput={setFirstNameInput}
            setLastNameInput={setLastNameInput}
            user={user}
          />

          <div className="mt-6">
            <StatsStrip
              totalGiven={totalGiven}
              subscriptions={subscriptions}
              multiItemOrders={multiItemOrders}
              auctionParticipation={auctionParticipation}
              auctionPurchases={auctionPurchases}
            />
          </div>

          <div className="mt-2">
            <MyPackNav active={activeTab} />
          </div>

          <div className="mt-8 pb-32 lg:pb-16">
            {activeTab === 'account' && (
              <div className="flex flex-col gap-12">
                <SectionShell
                  heading="Saved Payment Methods"
                  action={
                    <button
                      type="button"
                      onClick={() => dispatch(setOpenAddPaymentMethodModal())}
                      className={`${addCardStyles} ${highlightPaymentMethod ? 'border-primary-light dark:border-primary-dark' : ''}`}
                    >
                      <Plus className="w-3 h-3 shrink-0" aria-hidden="true" />
                      Add Card
                    </button>
                  }
                >
                  <PaymentMethods
                    deleteError={deleteError}
                    handleDeletePaymentMethod={handleDeletePaymentMethod}
                    handleSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
                    paymentMethods={paymentMethods}
                    setDefaultSuccess={setDefaultSuccess}
                  />
                </SectionShell>

                <SectionShell
                  heading="Shipping Address"
                  action={
                    <button
                      type="button"
                      onClick={() => setAddressModalOpen(true)}
                      className={`${addCardStyles} ${highlightAddress ? 'border-primary-light dark:border-primary-dark' : ''}`}
                      aria-label={user?.address ? 'Edit shipping address' : 'Add shipping address'}
                    >
                      <Pencil className="w-3 h-3 shrink-0" aria-hidden="true" />
                      {user?.address ? 'Edit' : 'Add'}
                    </button>
                  }
                >
                  <ShippingAddress
                    addressModalOpen={addressModalOpen}
                    setAddressModalOpen={setAddressModalOpen}
                    user={user}
                  />
                </SectionShell>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="flex flex-col gap-12">
                <SectionShell
                  heading="Merch, Wieners & Foster"
                  action={
                    <Link
                      href="/merch"
                      className={addCardStyles}
                      aria-label="Shop merch or sponsor a dog"
                    >
                      <Package className="w-3 h-3 shrink-0" aria-hidden="true" />
                      Shop
                    </Link>
                  }
                >
                  <MultiItemOrders multiItemOrders={multiItemOrders} />
                </SectionShell>

                <SectionShell
                  heading="Adoption Fees"
                  action={
                    <Link href="/adopt" className={addCardStyles}>
                      <Dog className="w-3 h-3 shrink-0" aria-hidden="true" />
                      Adopt
                    </Link>
                  }
                >
                  <AdoptionFees adoptionFees={adoptionFees} />
                </SectionShell>
              </div>
            )}

            {activeTab === 'giving' && (
              <div className="flex flex-col gap-12">
                <SectionShell
                  heading="Subscriptions"
                  action={
                    <Link href="/subscriptions" className={addCardStyles}>
                      <Repeat className="w-3 h-3 shrink-0" aria-hidden="true" />
                      Subscribe
                    </Link>
                  }
                >
                  <Subscriptions subscriptions={subscriptions} />
                </SectionShell>

                <SectionShell
                  heading="One-time Donations"
                  action={
                    <Link href="/donate" className={addCardStyles}>
                      <Gift className="w-3 h-3 shrink-0" aria-hidden="true" />
                      Donate
                    </Link>
                  }
                >
                  <OneTimeDonations donations={donations} />
                </SectionShell>
              </div>
            )}

            {activeTab === 'auctions' && (
              <SectionShell
                heading="Auctions"
                action={
                  <Link href="/auctions" className={addCardStyles}>
                    <Gavel className="w-3 h-3 shrink-0" aria-hidden="true" />
                    Bid
                  </Link>
                }
              >
                <Auctions
                  auctionParticipation={auctionParticipation}
                  auctionPurchases={auctionPurchases}
                />
              </SectionShell>
            )}

            {activeTab === 'settings' && (
              <SectionShell heading="Settings">
                <Settings
                  anonymousBidding={anonymousBidding}
                  onToggleAnonymousBidding={handleToggleAnonymousBidding}
                  autoPay={autoPay}
                  onToggleAutoPay={handleToggleAutoPay}
                  autoPayCoverFees={autoPayCoverFees}
                  onToggleAutoPayCoverFees={handleToggleAutoPayCoverFees}
                  autoPayError={autoPayError}
                />
              </SectionShell>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
