/** Public venue details for marketing site, contact, and footer. */
export const VENUE = {
  legalName: "Baba Jani Fast Food & Family Restaurant",
  /** Short name for logo / tight layouts */
  shortName: "Baba Jani",
  addressLines: [
    "First Floor, Awami Shopping Center",
    "Haider Road, Oghi",
  ],
  hours: "Daily 8:00 AM – 11:00 PM",
  phones: [
    { label: "Cell", numbers: ["0312-7887705", "0347-0404466"] },
    { label: "Rider", numbers: ["0340-4097901"] },
  ],
  /** WhatsApp (digits only, with country code for wa.me) */
  whatsappDigits: "923459461423",
  whatsappDisplay: "0345-9461423",
  services: [
    "Family restaurant",
    "Free Wi‑Fi",
    "Dine in",
    "Take away",
    "Home delivery",
  ],
} as const;

export function whatsappHref(): string {
  return `https://wa.me/${VENUE.whatsappDigits}`;
}

/** Pakistan mobile on menu: 03xx → +923xx for tel: links */
export function toTelHref(localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "");
  if (digits.startsWith("0")) return `tel:+92${digits.slice(1)}`;
  return `tel:+${digits}`;
}
