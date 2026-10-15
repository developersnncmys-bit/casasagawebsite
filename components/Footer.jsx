import Link from "next/link";
import { nav } from "./data";
import { waLinkFor } from "./content-helpers";
import { getContent } from "@/lib/content";

export default async function Footer() {
  const { contact } = await getContent();
  const waLink = waLinkFor(contact);
  return (
    <footer id="contact-footer" className="footer">
      <div className="footer-grid">
        <div>
          <h4>The house</h4>
          <p>
            A sanctuary for lovers in the heart of Bangalore — themed suites,
            private water rituals and unhurried evenings for two.
          </p>
          <Link href="/booking" className="btn btn-gold footer-btn">Book your stay</Link>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
            ))}
            <li><Link href="/booking">Booking</Link></li>
          </ul>
        </div>
        <div>
          <h4>Find us</h4>
          <address>
            {contact.address.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </address>
          <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="link-line footer-map">
            Get directions
          </a>
        </div>
        <div>
          <h4>Talk to us</h4>
          <a className="footer-phone" href={`tel:${contact.tel}`}>{contact.phone}</a>
          <a
            className="link-line footer-map"
            href={waLink("Hi CasaSaga, I'd like to know more about a stay.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="footer-base">
        <span>© {new Date().getFullYear()} CasaSaga</span>
        <span>Crafted with love in Bangalore</span>
      </div>
    </footer>
  );
}
