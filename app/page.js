import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Suites from "@/components/Suites";
import Marquee from "@/components/Marquee";
import Experience from "@/components/Experience";
import Reels from "@/components/Reels";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <>
      <Preloader />
      <Hero />
      <Manifesto />
      <Suites />
      <Marquee />
      <Experience />
      <Reels />
      <CallToAction />
    </>
  );
}
