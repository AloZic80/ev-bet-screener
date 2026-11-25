---
name: worker-ai-jobs
description: Use when adding or changing an AI job, its answer form (JSON schema), its prompt or El Compa's tools on the owner's Worker (prop-bet-api, src/ai.js JOBS, COMPA_TOOLS), or the app code that reads those answers (aiCall, Read slip, Bet log import, El Compa).
---

# Worker AI jobs

The Worker sends jobs to Anthropic with a strict answer form (`output_config.format` JSON schema; El Compa's tools use `strict: true`). The tests use a fake Worker and a fake Anthropic, so they cannot see Anthropic refuse a form. That is how v3.49 shipped a form Anthropic refused (owner, 11/23: "Anthropic did not accept this request"), fixed in v3.50.

## Limits Anthropic enforces (per request, all strict schemas together)
- At most 24 optional fields (a field not in `required`), 16 nullable or union fields (`anyOf`, type arrays), 20 strict tools.
- Large forms can still fail as "Schema is too complex for compilation" even inside those numbers: optional fields inside arrays of objects multiply the cost.
- House rule (tighter, tested in test/ai-test.mjs): at most 14 optional fields per job and at most 6 inside lists. v3.49's refused forms had 20 and 18; the test fails on that code.
- Not allowed: `minimum`/`maximum`, `minLength`, `oneOf`, recursive schemas, `additionalProperties` other than false.

## How we write forms (since v3.50)
- Every field required; the prompt says to write "" for text, 0 for a number, null only for a line or odds, and "none" for an enum that does not apply, and to name the field in "unclear".
- `tidy()` in src/ai.js removes those blanks (`blankOut` with the job's field list) so the app receives the same shape as before: a missing field means "not read". A new field goes in that list.
- Keep nullable fields to the few where 0 is a real value (a leg line of 0).

## Before merging a Worker change
1. `node --import ./test/cf-stub-loader.mjs test/ai-test.mjs` (and share-test, pinnapi-live-test) pass; the "limits" tests count optional and union fields for every job and for El Compa's strict tools together, against Anthropic's limits and the house rule.
2. Add a test that the job's blanks are removed and real values (including free:false and a 0 line) are kept.
3. Say plainly to the owner that the real Anthropic check happens on the first real use after deploy, and that a refusal now shows Anthropic's own reason (`detail`), so the first picture or question after the merge is the live test.

## App side
- Show the Worker's `detail` with any error, escaped and cut to 200 characters.
- Never send keys, the passphrase, notes or bet ids to a job; send only what it needs.
