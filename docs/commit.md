# Commit Instruction Template (AI-Optimized)

Use this template to generate commit messages that are easy for AI to parse, narratively coherent across history, and token-efficient.

## Goal

Write one commit message for the current staged/working changes.
The message must explain progression from previous state to current state in a compact format.

## Output Format (required)

```
<type>: <subject>

What changed:
- ...

Why:
- ...

Validation:
- ...

Impact:
- ...
```

## Constraints

- Use one type: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
- Subject: imperative, specific, max 60 characters.
- Keep total body to max 8 bullets.
- Keep each bullet to one line.
- Avoid filler words and repeated phrasing.
- Mention only files/functions actually changed.
- Do not guess or invent modifications.

## Story Rule

- In `Why`, include one short progression statement:
  from previous behavior/state -> to new behavior/state.

## Verification Rule

- Base content only on verified diff.
- If no real changes exist, output exactly:

```
NOOP: no changes detected after verification.
```

## Project-Specific Guidance

- If UI/behavior changed, include concise mobile validation notes.
- If multiple architecture layers changed, state cross-layer impact in one bullet.
- Keep wording aligned with project domain terms (records, species, collection points, dashboard, export).

## Compression Heuristics

- Prefer high-information verbs: `adds`, `removes`, `guards`, `normalizes`, `deduplicates`.
- Merge related edits into one bullet when they share one intent.
- Avoid listing unchanged context or obvious implementation details.