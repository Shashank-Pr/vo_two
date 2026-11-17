// Central contact + social details for VO2 Bikes.
//
// ⚠️  PLACEHOLDERS: `whatsappNumber`, `instagramUrl` and `facebookUrl` are
//     stand-in values. Replace them with the real details before launch — every
//     WhatsApp enquiry, the "Book a service" link and the footer links all read
//     from here.

/** WhatsApp number in international format, digits only (no "+", spaces or leading zeros). */
export const whatsappNumber = '919370343713'; // TODO: real WhatsApp number

/** Instagram page URL. */
export const instagramUrl = 'https://www.instagram.com/vo2bikes/'; // TODO: real Instagram page

/** Facebook page URL. */
export const facebookUrl = 'https://www.facebook.com/share/19RrCYiHSx/?mibextid=wwXIfr'; // TODO: real Facebook page

/** Public contact email. */
export const contactEmail = 'vo2bikes.official@gmail.com';

/** Phone number shown in the contact menu (same line as WhatsApp). */
export const contactPhoneDisplay = '+91 93703 43713'; // TODO: real phone number

/** Opens the phone dialler with the WhatsApp number on mobile. */
export const callHref = `tel:+${whatsappNumber}`;

/** Build a wa.me link that opens WhatsApp with a prefilled message. */
export function whatsappHref(message: string): string {
	return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
