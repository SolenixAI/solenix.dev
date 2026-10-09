---
type: Reference
title: "User journeys"
description: "Every person who uses solenix.dev, what they want, and how each step feels today, scored 1 to 5."
tags: [ux, journeys, solenix.dev]
sources:
  - lib/site-nav.ts, lib/site-page.ts (nav and shared page parts)
  - design/home.html (homepage)
  - app/articles/route.ts, articles/ (articles)
  - app/(site)/agents/page.tsx (Agents Marketplace)
  - app/(portal)/app/ and components/portal/ (portal)
  - next.config.ts (/book)
generated: { by: agent:claude-opus-5-5, at: 2026-10-08T18:00-02:30 }
verified: { by: reading the code, at: 2026-10-08T18:00-02:30 }
status: draft
stale_after: 2026-11-08
---

# User journeys

Every page on solenix.dev exists for a person who wants something. Each journey below is that person's story, then every step, scored for how it feels **today**: 1 is bad, 5 is great. A step at 3 or less is the next thing to fix. A step with no value is removed.

`npm run check` fails if a page on the site belongs to no journey (`scripts/journey-check.ts`). Add or change a page: add or change its journey here first.

## The whole map

```mermaid
flowchart LR
  subgraph IN["Arrives from"]
    SOC["A social post"]
    SEA["Search"]
    DIR["A direct link"]
    DEV["GitHub or agent docs"]
    MAIL_IN["An invite or sign-in email"]
  end
  subgraph SITE["Public site"]
    HOME["Homepage"]
    ART["Articles"]
    PAGE["An article"]
    AGT["Agents Marketplace"]
  end
  subgraph PORTAL["Solenix platform"]
    LOG["Sign in"]
    OVR["Overview"]
    WORK["Tech, Projects, Billing"]
    ADM["Clients (operator)"]
  end
  subgraph OUT["Leaves to"]
    BOOK["Book a call"]
    PAY["Pay an invoice"]
    INSTALL["Install a tool"]
  end
  SOC --> PAGE
  SEA --> HOME
  SEA --> PAGE
  DIR --> HOME
  DEV --> AGT
  MAIL_IN --> LOG
  HOME --> ART -->|"the live card grows into the page"| PAGE
  HOME --> AGT
  HOME --> BOOK
  PAGE --> BOOK
  HOME -->|"Solenix platform"| LOG
  LOG --> OVR --> WORK --> PAY
  LOG -->|"operator"| ADM
  AGT --> INSTALL
```

## 1. The curious reader

**As** someone who knows no math and taps a link in a social app on my phone, **I want** to understand what happened and play with one result, **so that** I feel I got it and I remember who made the page.

Pages: /articles/proof-flood

```mermaid
journey
  title The curious reader, today
  section Arrive
    The page opens inside the social app's browser: 4: Reader
    The hero line says what happened in plain words: 4: Reader
  section Orient
    A card tours the grid of 372 squares: 3: Reader
    Wonders where to start, no guided tour yet: 2: Reader
    Taps one tiny square: 2: Reader
    Taps Surprise me instead: 4: Reader
  section Understand
    A panel opens: the question, the answer, a picture: 5: Reader
    Back closes the panel: 5: Reader
    Drags the panel down to close it: 5: Reader
    Next and Previous through discoveries: 4: Reader
  section Explore
    Tries the map of 372 dots: 2: Reader
    Plays with the Erdős or fluid playground: 4: Reader
  section Share and act
    Copies a link to one discovery: 3: Reader
    Scrolls far to find Book a call: 2: Reader
```

What would raise the low steps:
- **Where to start (2):** a short guided tour for someone who knows no math.
- **Tiny square (2):** on a phone each square is about 11 px. Fewer columns on small screens, or tapping the touring card opens its discovery.
- **Tour order (3):** the hero tour and the Start here strip pick "famous" differently. Use one list.
- **Map (2):** 372 dots shrink to a third of their size on a phone. Open on Cards on small screens.
- **Share (3):** a link to one discovery previews the whole article. A page and image per discovery, and the phone's share sheet.
- **Book a call (2):** a quiet line in each discovery panel.

## 2. The business owner

**As** a small-business owner looking at Solenix, **I want** to see what would change in my week and what it costs, **so that** I can decide in a few minutes whether to book a call.

Pages: /, /articles, /book

```mermaid
journey
  title The business owner, today
  section Arrive
    Lands on the three-body hero: 4: Owner
    Reads the line under it and sees Book a call: 4: Owner
  section Understand
    Scrolls as the scene settles: 4: Owner
    Reads talk to one AI, not ten tools: 5: Owner
    Watches the by-hand versus just-ask races: 5: Owner
    Reads the five-step plan and the promises: 5: Owner
  section Trust
    Looks for proof, finds a placeholder photo: 2: Owner
    Looks for a price, finds only fixed price: 2: Owner
    Taps Solenix platform and meets a sign-in page: 2: Owner
  section Browse
    Opens Articles: a heading block, cards below: 2: Owner
    Each card shows its article live: 5: Owner
    A click grows the live page into the article: 5: Owner
  section Act
    Taps Book a call: 4: Owner
    Picks a time on a calendar page outside the site: 3: Owner
```

What would raise the low steps:
- **Proof (2):** a real photo and one real client result.
- **Price (2):** a starting price or a typical range.
- **Solenix platform (2):** the sign-in page's "New here?" should lead to Book a call, not an email.
- **Articles heading (2):** the first screen should be a designed hero, not a block of text.
- **Calendar (3):** the booking page leaves the Solenix look.

## 3. The client

**As** a client, **I want** to see that my site is fine, answer what waits for me and pay an invoice, **so that** I never chase anyone or open seven vendor logins.

Pages: /app/login, /app/auth/confirm, /app/auth/finish, /app/welcome, /app, /app/tech, /app/projects, /app/billing, /app/billing/[invoice]

```mermaid
journey
  title The client, today
  section Sign in
    Opens the platform and meets the sign-in page: 4: Client
    Types an email and gets a link, no password: 4: Client
    Taps the link in the email, then Continue: 3: Client
  section First visit only
    Fills the welcome form, about ten fields: 3: Client
    Start here shows step one already done: 3: Client
  section Check in
    Reads Everything is running: 5: Client
    Sees a live preview of the site: 4: Client
    Finds Waiting on you below three doors: 3: Client
    Taps Looks right: 5: Client
    Taps Ask for a change and a mail app opens: 2: Client
  section Pay
    Sees the amount with a Pay button: 5: Client
    Pays on the payment page: 5: Client
    Downloads the receipt: 4: Client
  section Look around
    Reads Your tech with costs and renewals: 4: Client
    Sees can connect, with nothing to tap: 3: Client
    Reads Projects with the next step: 4: Client
```

What would raise the low steps:
- **Continue (3):** the extra tap stops mail scanners from using the link. Keep it, and say why in one line.
- **Welcome form (3):** fill in what is already known; ask only what is missing.
- **Step one done (3):** remove a step that is always done.
- **Waiting on you (3):** show it first when something waits.
- **Ask for a change (2):** a box on the page that saves the request.
- **Can connect (3):** one tap asks for it.

## 4. The operator

**As** the person who runs Solenix, **I want** to invite clients, see who needs me and update their work, **so that** the platform runs the business and nothing lives in a spreadsheet.

Pages: /app/admin/clients, /app/admin/clients/[id], /app/admin/clients/[id]/manage, /app/admin/clients/[id]/tech, /app/admin/clients/[id]/projects, /app/admin/clients/[id]/billing, /app/admin/clients/[id]/billing/[invoice]

```mermaid
journey
  title The operator, today
  section See who needs me
    Reads one line: sites down, invoices waiting: 5: Operator
    Cannot see which client has not answered: 3: Operator
    Filters clients by typing: 5: Operator
  section Onboard
    Invites a client with three fields: 4: Operator
    Resends an invite to someone not signed in: 4: Operator
  section Run a client
    Sees exactly what the client sees: 5: Operator
    Edits tech, projects and approvals: 4: Operator
    Removes an item with one tap, no undo: 2: Operator
    Raises an invoice outside the platform: 3: Operator
```

What would raise the low steps:
- **Not answered (3):** a "Waiting on client" badge in the list.
- **One-tap remove (2):** an undo, or a confirm.
- **Invoices (3):** raise them from the platform, or link straight to them.

## 5. The developer or AI agent

**As** a developer or an AI agent, **I want** to add the Solenix marketplace and install a tool in one line, **so that** my agent can use it today.

Pages: /agents, /articles/rss.xml

```mermaid
journey
  title The developer or AI agent, today
  section Find it
    Finds Agents Marketplace in the nav or footer: 4: Developer
    Reads tools that install in one line: 5: Developer
  section Set up
    Copies the one sentence that sets everything up: 5: Developer, Agent
    Copies the add-the-marketplace command: 5: Developer, Agent
  section Choose
    Scans tools with stars, last update and licence: 4: Developer
    Copies one install command: 5: Developer, Agent
  section Machine reading
    An agent reads the page as plain HTML: 2: Agent
    An agent follows the RSS feed of articles: 4: Agent
  section Next
    Suggests a tool through a GitHub issue: 4: Developer
    Looks for a way to talk to Solenix: 2: Developer
```

What would raise the low steps:
- **Machine reading (2):** an `/llms.txt` that points to the setup guide and the marketplace file.
- **Talk to Solenix (2):** one line with Book a call.

## 6. The article creator

**As** a person or an agent making an article, **I want** to add one folder and have everything else happen, **so that** a new article is right the first time.

Pages: /articles, /articles/proof-flood

```mermaid
journey
  title The article creator, today
  section Make
    Copies articles/_template into a new folder: 4: Creator
    Draws the hero and the sections, data-nav names them: 4: Creator
  section Check
    npm run check: rules, privacy, no copies, journeys: 5: Creator
    Checks the hero fits every screen by eye: 2: Creator
  section Ship
    Opens a private preview: 5: Creator
    The card, cover, sitemap and feed update themselves: 5: Creator
```

What would raise the low steps:
- **Hero fit (2):** an automatic check that renders the hero at every screen size real visitors use, plus the smallest and largest, and fails on any overflow or clipping.

## First landing on any page: the hero

Every page's first screen is its hero. A hero that does not fit the screen has failed as a hero.

Pages: /, /articles, /articles/proof-flood

```mermaid
journey
  title First landing, designed
  section Any screen, any app
    The hero fills exactly the first screen: 5: Visitor
    In five seconds: what it is and why it matters: 5: Visitor
    The thing itself, live, invites one touch: 5: Visitor
    One clear first step: 5: Visitor
    A scroll cue says there is more: 4: Visitor
  section Everywhere it appears
    The article card shows the same hero, live: 5: Visitor
    A shared link shows the same hero: 5: Visitor
    A click grows the hero into the page: 5: Visitor
```
