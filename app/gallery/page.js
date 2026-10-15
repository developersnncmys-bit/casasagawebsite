import Link from "next/link";
import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/GalleryGrid";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moments in"
        accent="light"
        sub="A look inside the suites and the little setups we prepare for birthdays, anniversaries and special evenings."
        img="/images/gallery-hero.jpg"
      />
      <GalleryGrid />
      <Reveal className="inline-cta">
        <h2>
          Seen enough to <em>fall in love?</em>
        </h2>
        <Link href="/booking" className="btn btn-gold btn-lg">Book your suite</Link>
      </Reveal>
    </>
  );
}
