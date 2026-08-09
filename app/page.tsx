import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import TrustBar from '@/components/TrustBar'
import CarrierLogos from '@/components/CarrierLogos'
import Services from '@/components/Services'
import LicensedToServe from '@/components/LicensedToServe'
import AboutPatrick from '@/components/AboutPatrick'
import HowItWorks from '@/components/HowItWorks'
import FAQ from '@/components/FAQ'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'
import MobileCTA from '@/components/MobileCTA'
import Analytics from '@/components/Analytics'

export default function Home() {
  return (
    <>
      <Analytics />
      <Nav />
      <main id="main">
        <Hero />
        <TrustBar />
        <CarrierLogos />
        <Services />
        <LicensedToServe />
        <AboutPatrick />
        <HowItWorks />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <MobileCTA />
    </>
  )
}
