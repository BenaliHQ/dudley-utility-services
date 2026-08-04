# DUS Brand System — How to Use This With Claude

This folder is a complete, locked design system for **Dudley Utility Services**. Give it to Claude, ask for what you need in plain English, and Claude will produce finished, on-brand graphics and documents: social posts, LinkedIn covers, carousels, presentation decks, one-pagers, letterhead, and proposals.

You don't need design skills and you don't need to know HTML. You describe the content; the system handles how it looks.

## One-time setup (pick the one that matches how you use Claude)

### Option A — Claude.ai with Skills (best results)

1. Zip this folder if it isn't zipped already (`dus-brand.zip`).
2. In Claude.ai: **Settings → Capabilities → Skills → Upload skill** and upload the zip.
3. That's it. In any chat, ask for a DUS asset and Claude will use the skill automatically. You can also type `/dus-brand` to invoke it directly.

### Option B — A shared Claude Project (great for teams)

1. In Claude.ai, create a Project called **DUS Brand**.
2. Open `PROJECT-INSTRUCTIONS.md` in this folder, copy its contents into the Project's **Instructions** box.
3. Upload these files to the Project's knowledge: everything in `templates/`, plus `SKILL.md`, `dus-core.css`, `reference/voice.md`, and `reference/brand-rules.md`.
4. Invite the team to the Project. Every chat inside it is brand-aware.

### Option C — Claude Cowork / Claude Code

Point a session at this folder (or keep the folder inside the workspace Claude can see). Claude reads `SKILL.md` and the templates directly, and can also export PNGs and PDFs for you (it will run the export commands itself).

## Asking for things — examples that work well

- "Make a LinkedIn post announcing that Savannah Land joined as Land Director for Utilities, starting August 3."
- "I need a carousel: 5 things transmission PMs get wrong about easement timelines. Here are my 5 points: …"
- "Company page LinkedIn banner."
- "Personal LinkedIn cover for Brent."
- "A one-page service overview I can leave behind after the AEP meeting. Emphasize siting & routing."
- "Draft a proposal for [Client] for right-of-way acquisition on the [Project] corridor: 4 phases, here's the scope and pricing…"
- "Turn these bullet points into a 10-slide deck for Thursday's kickoff."

**Give real content.** The system never invents numbers or project facts. The only standing claims it uses are "45+ years of energy-land expertise" and "licensed in roughly 38 states." If you don't provide a stat, you'll get a visible `[placeholder]` instead of a made-up number. That's by design.

**It also won't name your clients.** Ask for a case study naming a utility and you'll get an anonymized version ("a Gulf Coast investor-owned utility"). Client confidentiality is built into the system, because publishing client details is exactly the judgment that disqualifies a vendor in this industry.

## Getting the finished file out

Claude will include the exact export step with each asset, but in short:

- **Graphics (posts, banners, slides):** save the HTML file, open it in Chrome, screenshot the graphic. For a pixel-perfect PNG, Claude will give you a one-line Terminal command you can paste.
- **Documents (one-pager, letterhead, proposal, decks):** open in Chrome → **Print → Save as PDF**, set margins to **None**, and turn **Background graphics ON** (this one matters — without it the teal backgrounds vanish).
- In **Cowork/Claude Code**, just ask Claude to "export this as PNG/PDF" and it will do it.

## What's in this folder

| File | What it is |
|---|---|
| `SKILL.md` | Claude's instruction manual (Claude reads it, you don't need to) |
| `index.html` | **The brand book — open this in a browser to see the whole system** |
| `templates/` | 9 locked templates Claude copies and fills in |
| `dus-core.css` | The design system source code |
| `reference/voice.md` | **How DUS talks: audience, claim, values, rules, examples** |
| `reference/brand-rules.md` | The distilled visual rules |
| `assets/` | Official DUS logo files |
| `PROJECT-INSTRUCTIONS.md` | Paste-in text for the Claude Project setup |

## Ground rules (for humans too)

- Colors are **DUS Teal `#015270`**, **Dudley Green `#41BE48`** (small doses), black-ish ink, gray, white. Nothing else.
- The typeface is **Lato**. The DUDLEY wordmark is artwork, never typed.
- No emoji in DUS materials. No hype words. Real numbers only.
- If Claude refuses to "make it pop" with a new color: that's the system working.

## If something looks off

- **Backgrounds print white** → you forgot "Background graphics" in the print dialog.
- **Wrong font showing** → no internet when the file was opened (Lato loads from Google Fonts); reopen while online, or it falls back to a close system font.
- **Text overflows the graphic** → the copy is too long for that layout; ask Claude to shorten it, don't shrink the type.
- **Claude went off-brand** → say "follow the DUS brand skill" — that re-anchors it to `SKILL.md`.

Questions or improvements: this system is maintained with the Benali team.
