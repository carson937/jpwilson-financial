import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import TrustBar from '@/components/TrustBar'
import CarrierLogos from '@/components/CarrierLogos'
import Services from '@/components/Services'
import Proof from '@/components/Proof'
import Testimonials from '@/components/Testimonials'
import HowItWorks from '@/components/HowItWorks'
import FAQ from '@/components/FAQ'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'
import MobileCTA from '@/components/MobileCTA'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <CarrierLogos />
        <Services />
        <Proof />
        <Testimonials />
        <HowItWorks />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <MobileCTA />
    </>
  )
}
