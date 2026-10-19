import { AdoptionInformationContent } from 'app/(public)/adopt/_components/AdoptionInformationContent'

export default function AdoptionInformation() {
  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        <AdoptionInformationContent />
      </div>
    </main>
  )
}
