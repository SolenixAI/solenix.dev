import { test } from "node:test"
import assert from "node:assert/strict"
import { securityTxt } from "./security-txt.ts"
import { NAV } from "./site-nav.ts"

// security.txt is read as lines of "Field: value". The contact is the address the footer shows (NAV.contact); the file
// expires one year after it was written, on 2026-10-11.
const fields = (text: string) => Object.fromEntries(text.trim().split("\n").map((line) => {
  const at = line.indexOf(": ")
  return [line.slice(0, at), line.slice(at + 2)]
}))

test("security.txt names the contact address the footer shows", () => {
  assert.equal(fields(securityTxt()).Contact, NAV.contact.href)
})

test("security.txt expires one year after 2026-10-11", () => {
  const expires = fields(securityTxt()).Expires
  assert.equal(Date.parse(expires), Date.UTC(2027, 9, 11))
  assert.equal(Date.parse(expires) - Date.UTC(2026, 9, 11), 365 * 24 * 60 * 60 * 1000)
})
