import { NAV } from "./site-nav.ts"

// security.txt (RFC 9116, https://securitytxt.org): where to report a security problem, and until when this file is
// current. The contact is the address the footer shows (NAV.contact). The file expires one year after 2026-10-11.
export function securityTxt(): string {
  return `Contact: ${NAV.contact.href}\nExpires: 2027-10-11T00:00:00.000Z\n`
}
