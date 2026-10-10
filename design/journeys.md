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
  - app/(site)/app/page.tsx (Solenix platform: being rebuilt)
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
  end
  subgraph SITE["Public site"]
    HOME["Homepage"]
    ART["Articles"]
    PAGE["An article"]
    AGT["Agents Marketplace"]
  end
  subgraph PLAT["Solenix platform"]
    REB["Being rebuilt"]
  end
  subgraph OUT["Leaves to"]
    BOOK["Book a call"]
    INSTALL["Install a tool"]
  end
  SOC --> PAGE
  SEA --> HOME
  SEA --> PAGE
  DIR --> HOME
  DEV --> AGT
  HOME --> ART -->|"the live card grows into the page"| PAGE
  HOME --> AGT
  HOME --> BOOK
  PAGE --> BOOK
  HOME -->|"Solenix platform"| REB --> BOOK
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

Pages: /, /articles, /app, /book

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
    Taps Solenix platform: being rebuilt, Book a call: 3: Owner
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
- **Solenix platform (3):** being rebuilt; it opens again with the new platform.
- **Articles heading (2):** the first screen should be a designed hero, not a block of text.
- **Calendar (3):** the booking page leaves the Solenix look.

## 3. The client

The old portal was removed on 2026-10-09. This journey returns with the new Solenix platform.

## 4. The operator

The old portal was removed on 2026-10-09. This journey returns with the new Solenix platform.

## 5. Anyone setting up their AI (and the AI itself)

**As** someone who uses AI, developer or not, **I want** to set up a tool the way its makers intended with one copy-paste, **so that** my AI can do real work with it today, without me learning what a skill, connector or CLI is.

Pages: /agents, /articles/rss.xml

Three people use this surface. Each one has a diagram, scored for how it feels **today**, from screenshots at 1440 and 390 wide taken 2026-10-09. Plus the agent-facing files: /llms.txt and /agents/worlds.json.

### 5a. The small-business owner, in ChatGPT or Claude

```mermaid
journey
  title Owner in ChatGPT or Claude, today
  section Find it
    Sees Agents Marketplace in the top bar on a phone: 2: Owner
    Finds Agents Marketplace in the footer: 3: Owner
    Reads the hero line about the makers way: 3: Owner
    Sees the orbit of Vercel and Skills: 3: Owner
  section Pick a world
    Sees counts like 3.9M per week and 16.4K: 2: Owner
    Opens Vercel and the card grows out of its orbit: 4: Owner
    Reads what Vercel does for them in plain words: 5: Owner
    Reads the orbit labels API, Command line and Connector: 2: Owner
  section Set up
    Sees the main button Copy for your AI: 4: Owner
    Reads the sentence with npx skills add in it: 2: Owner
    Pastes it into a chat window with no terminal: 1: Owner, AI
    Pastes it into an AI that has a terminal: 3: Owner, AI
    Signs in once and sees the AI prove it works: 3: Owner, AI
  section Next
    Looks for a way to talk to Solenix: 2: Owner
    Suggests a world through the Suggest a world link: 3: Owner
```

Lowest steps to raise:
- **Pasting into a chat with no terminal (1):** the sentence in the Vercel world card runs `npx skills add`. ChatGPT and Claude chat cannot run it. Under the sentence, add one plain line: "Chat only? Book a call and we set it up." The line links to Book a call.
- **Top bar on a phone (2):** the header at 390 px shows Articles and Platform only. Keep Agents Marketplace in the top bar at phone width.
- **Orbit labels (2):** the Vercel orbit in the world card shows API, Command line and Connector with version numbers. Add one plain line under each label, for example: "Command line: runs commands on your computer."
- **Counts (2):** the world cards show 3.9M per week and 16.4K stars. Add a plain word beside each number, or move the numbers into the card details.
- **Talk to Solenix (2):** the /agents page has no Book a call. Add it in the page header, beside the Solenix platform link.

### 5b. The developer

```mermaid
journey
  title Developer on Agents Marketplace, today
  section Arrive
    Lands on Agents Marketplace from GitHub or docs: 4: Developer
    Sees live stars, forks and last update on the Vercel card: 5: Developer
    Sees Apache-2.0 and the repo link: 5: Developer
  section Inspect
    Opens the Skills piece and reads its 33 skill names: 4: Developer
    Opens The steps your AI follows, linked to SKILL.md: 4: Developer
    Follows a link to one skill, ai-sdk: 1: Developer
    Reads the ring of 33 unlabelled dots: 2: Developer
  section Set up
    Copies the one sentence: 5: Developer
    Runs npx skills add in a terminal: 4: Developer
    Checks the setup file on GitHub: 4: Developer
  section Next
    Suggests a world through the GitHub issue link: 4: Developer
    Reads the same card on a phone, full height: 4: Developer
```

Lowest steps to raise:
- **The ai-sdk link (1):** the URL `?world=vercel&piece=skills&part=ai-sdk` opens the Skills list. The ai-sdk part does not open. Make each part link open its own item, with its name and blurb.
- **The ring of 33 dots (2):** in the Skills view, the dots have no labels. Label each dot with its skill name, or remove the ring and keep the chips.

### 5c. The AI agent, reading the page or the files

```mermaid
journey
  title AI agent reading solenix.dev, today
  section Find the catalog
    Reads llms.txt and finds the Agents Marketplace list: 5: Agent
    Follows the link to worlds.json: 5: Agent
  section Read a world
    Reads the Vercel part with its one sentence and setup link: 5: Agent
    Reads the Skills piece with skill names and blurbs: 4: Agent
    Opens the ai-sdk part from the page: 1: Agent
    Reads a world sentence from the /agents HTML: 3: Agent
  section Act
    Runs the one sentence in a terminal: 4: Agent
    Reads the setup SKILL.md on GitHub: 4: Agent
    Follows the RSS feed of articles: 4: Agent
```

Lowest steps to raise:
- **The ai-sdk link (1):** an agent cannot address one skill. Give each part its own URL, and list that URL on its entry in worlds.json.
- **The sentence in HTML (3):** the Vercel sentence appears only after `?world=vercel` opens. Render the sentence in the card's first HTML, so an agent reads it without a click.

### Not yet checked

- The sign-in and "the AI proves it works" step has not been run, so its score is a guess.
- The sentence was not run in a terminal. The command matches llms.txt and worlds.json.
- The Copy for your AI click was not tested.


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
