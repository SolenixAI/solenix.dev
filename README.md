# solenix.dev

Solenix is one tech expert for small businesses, based in St. John's, Newfoundland and Labrador. It puts one AI at the centre of the tools a business already uses, cuts the tools it does not need, teaches the team, and builds the website.

This repository is the Next.js 16 app that serves [solenix.dev](https://solenix.dev). Vercel hosts it.

## Set up and run it locally

Requires Node.js 24.12 or later.

```sh
npm install
npm run dev
```

`npm run dev` prints the address to open, usually http://localhost:3000.

To build for production, run `npm run build` (`next build`).

## Check your change

```sh
npm run check
```

`npm run check` runs `scripts/check.sh`, which checks the site against the rules in [DESIGN.md](DESIGN.md), [PRODUCT.md](PRODUCT.md) and [design/approved.md](design/approved.md). CI runs the same checks on every pull request.

Each commit runs the checks too. `npm install` points git at `.githooks`. The pre-commit hook needs [gitleaks](https://github.com/gitleaks/gitleaks), which scans for secrets. Install it first, for example with `brew install gitleaks` on macOS.

## Read these first

- [AGENTS.md](AGENTS.md): the rules for this repo. Read it before any change.
- [PRODUCT.md](PRODUCT.md): the one record of what Solenix is, for every person and agent who designs, builds or markets it. Read it before you write copy or plan a feature.
- [DESIGN.md](DESIGN.md): visual decisions and the voice. Read it before you change how a page looks or reads.

## Where things are

- The homepage is `app/(site)/page.tsx`. It renders `design/home.html`, the one source for its markup and CSS.
- `app/`: pages and route handlers (Next.js App Router).
- `design/`: the homepage source, design tokens and the approved phrases.
- `articles/`: one folder per article. See [articles/README.md](articles/README.md).
- `client/`: page scripts, compiled into the pages that use them.
- `components/` and `lib/`: React components and TypeScript modules.
- `scripts/`: build and check scripts.
- `.agents/skills/`: the agent skills this repo uses.

The Agents Marketplace catalog comes from [SolenixAI/agents-marketplace](https://github.com/SolenixAI/agents-marketplace), read through GitHub.

## License

The code is open source under the [Apache License 2.0](LICENSE). That license does not grant rights to the SolenixAI name or logo. Do not use them to suggest that SolenixAI made or endorses your project.

Contact: hello@solenix.dev

## Contributing

See the [contributing guide](https://github.com/SolenixAI/.github/blob/main/CONTRIBUTING.md). Report security problems privately: see the [security policy](https://github.com/SolenixAI/.github/blob/main/SECURITY.md).
