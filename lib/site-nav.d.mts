export type NavLink = { href: string; label: string; wide?: boolean }
export declare const NAV: {
  home: { href: string; label: string; aria: string }
  links: NavLink[]
  platform: { href: string; label: string; short: string; aria: string }
  contact: { href: string; label: string }
}
export declare function markShapes(fill: string): string
export declare function sunGradient(id: string): string
export declare function markSvg(id?: string): string
export declare function pageSections(html: string): { id: string; label: string }[]
export declare function footerLinks(): { href: string; label: string }[]
export declare function siteNav(opts?: { local?: boolean }): string
export declare function localNav(title: string, sections: { id: string; label: string }[]): string
export declare function withSiteNav(html: string): string
