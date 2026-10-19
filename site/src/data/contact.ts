// Central contact + social details for VO2 Bikes.
//
// ⚠️  PLACEHOLDERS: `whatsappNumber` and `instagramUrl` are stand-in values.
//     Replace them with the real details before launch — every WhatsApp enquiry,
//     the "Book a service" link and the footer links all read from here.

/** WhatsApp number in international format, digits only (no "+", spaces or leading zeros). */
export const whatsappNumber = '917276393713'; // TODO: real WhatsApp number

/** Instagram page URL. */
export const instagramUrl = 'https://www.instagram.com/your-handle/'; // TODO: real Instagram page

/** Public contact email. */
export const contactEmail = 'vo2bikes.official@gmail.com';

/** Build a wa.me link that opens WhatsApp with a prefilled message. */
export function whatsappHref(message: string): string {
	return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
