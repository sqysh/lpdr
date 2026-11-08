import { AboutBlock } from 'app/(public)/(home)/_components/AboutBlock'
import { ApplicationsBlock } from 'app/(public)/(home)/_components/ApplicationsBlock'
import { AvailableDogsBlock } from 'app/(public)/(home)/_components/AvailableDogsCarousel'
import { DogGalleryBlock } from 'app/(public)/(home)/_components/DogGalleryBlock'
import { Hero, HeroAuction } from 'app/(public)/(home)/_components/hero/Hero'
import InstagramBlock from 'app/(public)/(home)/_components/InstagramBlock'
import { LPDRLogo } from 'app/(public)/(home)/_components/LPDRLogo'
import { WaysToHelpBlock } from 'app/(public)/(home)/_components/WaysToHelpBlock'
import { WelcomeWienersBlock } from 'app/(public)/(home)/_components/WelcomeWienersBlock'
import { AuctionDonationsBanner } from './_components/AuctionDonationBanner'

export const HomeClient = ({
  dachshunds,
  welcomeWieners,
  auction,
  memorialsEnabled
}: {
  dachshunds: any
  welcomeWieners: any
  auction: HeroAuction | null
  memorialsEnabled: boolean
}) => {
  return (
    <>
      <Hero auction={auction} showRainbowBridge={memorialsEnabled} />
      <AboutBlock />
      <AvailableDogsBlock data={dachshunds?.data?.data} />
      <AuctionDonationsBanner />
      <LPDRLogo />
      <DogGalleryBlock />
      <WaysToHelpBlock />
      <ApplicationsBlock />
      <WelcomeWienersBlock data={welcomeWieners?.data} />
      <InstagramBlock />
    </>
  )
}
