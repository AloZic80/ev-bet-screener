# Las Karens on El Compa (and the INTERNETS research) · 2026-11-18

Ref: CC-2026-11-18-04 · El Capataz, Wed 2026-11-18 ~4:40 AM CT. Owner, 11/17: "El compa and my chat, looks like a early 2000's AOL chat ... charts ... upload ... download all types of files. Ask Karens to look into the INTERNETS."
Tested on a local copy (390 px light, 1280 px dark) with a faked AI answer. No files changed.

## Stars
Newcomer 2/5 · Phone-only 2/5 · Know-it-all 2/5 · Pro 2/5 ("it works, it looks like a 2003 IRC window").

## Complaints, worst first (the Pro agrees with all unless marked)
1. Raw text: tables, **bold**, `code` and bullets show as plain characters; numbers do not line up; no charts. (all four)
2. No upload, no download: no attach, drag-drop or paste; no save or export. The slip and screenshot readers exist elsewhere but El Compa cannot use them. (all four)
3. The input box is 140 px tall with no auto-grow: a fifth of the phone screen. (Phone, Newcomer)
4. The header's long tagline wraps and pushes Clear and × to a second row. (Phone, Newcomer)
5. "El Compa is thinking…" is tiny grey text, no animation. (Newcomer, Phone)
6. Flat old bubbles: tight 8 px spacing, no sections in long answers. (Know-it-all, Newcomer)
7. No streaming, no copy button, no retry. (Know-it-all, Pro)
8. Errors are a grey note with no Retry. (Newcomer, Pro)
9. On a computer the 400 px panel floats over the board; no resize or dock. (Know-it-all)
10. Clear has no confirm or undo; history is one day and 100 messages. (Pro)
11. No suggested prompts in the empty state. (Newcomer; Pro: newcomer only)
12. The cost footer is always on screen. (Phone; Pro: newcomer only)
13. Clear and × are under 44 px. (Phone; minor)

## What the code has now
compaSend reads out.reply (text) and out.toolCalls; compaRich escapes, links URLs, turns newlines into <br>. No markdown, tables, charts or files.

## The INTERNETS (one Sonnet researcher; Claude.ai, ChatGPT, Gemini, Perplexity)
Top patterns, ranked: (1) no bubble for answers, a full-width centred column, the user's message in a tinted right bubble; (2) inline chart cards drawn
from a small JSON spec in the answer, with Expand and Download PNG/SVG; (3) a + button, drag-drop, paste, file chips; (4) Stop while answering, smart
scroll; (5) Copy / Retry under each answer; (6) a small markdown renderer (escaped first); (7) tables that scroll sideways with Copy / Download CSV;
(8) starter prompts and follow-up chips; (9) images and PDFs sent to the AI as content blocks, CSV/text inline with a cap; (10) 44 px targets, 16 px
input, safe-area padding, role="log". All doable with no outside library. Source: support.claude.com upload help page (types and limits), plus design write-ups.
