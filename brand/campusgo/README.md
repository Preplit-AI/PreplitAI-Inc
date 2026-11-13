# CampusGo brand files

The brand book, with usage rules, the lines, live components and both themes, is the CampusGo design system:
https://claude.ai/artifact/38VRAL2mvhRveuBqtaraWT

The business overview is at https://claude.ai/artifact/Y6nvKCekeh22ig8NzwUwoV

Both are private until shared from their Share menu.

| Folder or file | What it holds |
| --- | --- |
| `logos/` | Lockup, stacked logo, wordmark and mark (a graduation cap on a G), for white, navy and blue grounds; one-ink marks; the app icon (`app-icon.svg`, a full square) |
| `juno/` | Juno the owl at its five stages (`juno-stage-1.svg` to `juno-stage-5.svg`) and in its six moods |
| `tokens.json` | Every colour (Day and Night), type style, spacing step, radius and shadow |
| `tokens.css` | The same tokens as CSS custom properties, with the `@font-face` rules for `fonts/` |
| `components.css` | Button, chip, arrival-path step, radar item, Juno's voice, opportunity card |
| `fonts/` | Lexend and Schibsted Grotesk (both SIL Open Font License) |
| `source/` | The scripts that draw Juno and the logo and define the tokens |

The master line is "Tell it once."

## Redrawing

- `source/logo.mjs` draws the mark, sets the wordmark as outlines and builds the lockups and the app icon. It needs
  `opentype.js` and the Lexend files from `@expo-google-fonts/lexend`.
- `source/owl.mjs` draws Juno (`owl({ stage, mood })`).
- `source/tokens.mjs` holds the tokens, compiles `tokens.css` and checks contrast (`node tokens.mjs`).

## Not done yet

- The app (`mobile/`) wears this identity as of 13 November: name, logo, icons, colours, Lexend, Day and Night. Its screens are still the earlier study-assistant ones.
- The website still says Preplit AI.
- PNG exports of the app icon for the stores.
- `brand/campusowl/` is the superseded identity, kept for reference.
