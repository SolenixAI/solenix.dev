# Solenix

The words solenix.dev uses for its domain: the Agents Marketplace the site reads, and the one 3D scene it shows. One context: the whole repo.

## Agents Marketplace

**Agents Marketplace**:
The public catalog of the toolkit and the worlds Solenix stands behind, kept in one GitHub repo.
_Avoid_: store, directory

**Catalog**:
The list of entries on one branch of the marketplace repo: the toolkit, then each world.
_Avoid_: index, registry, feed

**Entry**:
One item in the catalog: the toolkit, or a world.
_Avoid_: card

**Toolkit**:
The core set of tools every AI needs: the catalog's first entry, present when it lists at least one tool.
_Avoid_: core kit, base

**Tool**:
One item in the toolkit, installed from its own repo's skills.
_Avoid_: plugin, package

**World**:
One catalog entry that is a tool's whole ecosystem, with its maker at the centre. The homepage also uses the word for the five tools it shows round the business (lib/home/worlds.ts); those are tool ecosystems too, but not catalog entries.
_Avoid_: scene, space

**Maker**:
The company or person behind a world. It sits at the centre of the world's orbit.
_Avoid_: vendor, owner

**Orbit**:
A world as a system: its maker at the centre, and each piece around it, with facts read from that piece's own source.

**Piece**:
One body in an orbit. The kinds are: maker (the body at the centre), plugin (shown as "Add-on"), skills, connector (shown as "Account link"), CLI (shown as "Pro tools"), API (shown as "Direct access") and tool (an item of the toolkit).
_Avoid_: source, module

**Part**:
One thing inside a piece: a skill, an agent or a command, each described by its own file.
_Avoid_: item, component

**Fact**:
A value about a piece, read from its fact source and at most an hour old: stars, version, last update, a description. A failed read drops only the facts it feeds.
_Avoid_: stat, metric

**Fact source**:
The GitHub repo, npm package or MCP registry entry that a fact is read from.
_Avoid_: piece

## Site

**Article**:
A long-form page in the articles folder, with a title, a description and a date.
_Avoid_: post, blog post

**3D world**:
The one 3D scene that the site mounts once, in its layout. Pages that show it bind to it.
_Avoid_: world alone (a world is a catalog entry), scene, space
