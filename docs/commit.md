# Commit Instruction Template (AI-Optimized)

Use this template to generate commit messages that are easy for AI to parse, narratively coherent across history, and token-efficient.

## Goal

Write one commit message for the current staged/working changes.
The message must explain progression from previous state to current state in a compact format.

Before writing, decide whether the diff is one logical unit or multiple independent units.

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

If split is required, output this plan format instead of a single message:

```
Split required: yes

Commit 1
<type>: <subject>
What changed:
- ...
Why:
- ...
Validation:
- ...
Impact:
- ...

Commit 2
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

## Split Decision Rule

- Split into multiple commits when changes are independently understandable and could be reverted separately.
- Split when files belong to different concerns (for example: product behavior rules vs process/tooling guidance).
- Keep one commit when all edits are required to deliver one indivisible outcome.
- Prefer 2-3 commits maximum for a single work session unless clearly necessary.

Use this quick test:

1. Can each subset compile into a meaningful story on its own?
2. Would a reviewer benefit from reviewing subsets independently?
3. Could one subset be reverted without harming the other?

If at least two answers are yes, split the commit.

## Verification Rule

- Base content only on verified diff.
- If no real changes exist, output exactly:

```
NOOP: no changes detected after verification.
```

- If split is required, verify each file appears in exactly one planned commit.

## Project-Specific Guidance

- If UI/behavior changed, include concise mobile validation notes.
- If multiple architecture layers changed, state cross-layer impact in one bullet.
- Keep wording aligned with project domain terms (records, species, collection points, dashboard, export).

## Compression Heuristics

- Prefer high-information verbs: `adds`, `removes`, `guards`, `normalizes`, `deduplicates`.
- Merge related edits into one bullet when they share one intent.
- Avoid listing unchanged context or obvious implementation details.