# treng

## Commits

One logical change per commit. Messages are in English.

Subject line follows [Conventional Commits](https://www.conventionalcommits.org):
`type(scope): description`, for example `feat(deck): add undo`.

- Type, one of:
  - `feat`: something new the user can see or do
  - `fix`: something that worked wrong now works right
  - `refactor`: the code changes, the behaviour does not
  - `perf`: the same behaviour, faster or lighter
  - `docs`: README, CLAUDE.md, comments
  - `style`: formatting only, no change in meaning
  - `test`: tests only
  - `build`: dependencies, Next.js, TypeScript and ESLint config, scripts
  - `ci`: CI pipelines
  - `chore`: anything else that does not touch the app (`.gitignore`,
    hooks)

  If a change fits two types, pick the one the user would notice:
  `feat` before `fix` before `refactor`.
- Scope is optional: the part of the app in lowercase, like `deck`,
  `session`, `account`, `store`, `words`
- `!` after the type or scope marks a breaking change, like saved data
  that no longer loads: `feat(store)!: ...`. Explain it in the body.
- The description is in the imperative mood, like a command: "add",
  "load", "rewrite", not "added", "adds" or "adding"
- It starts with a lowercase letter, unless the first word is a name
  like Next.js or README, and has no period at the end
- The whole subject is 50 characters or less if possible, 72 at most
- It says what changes for the user or the code, not which files were
  touched: `feat(session): shuffle new words by a saved seed`, not
  `chore: update store.ts`

Body (skip it only when the subject says everything):

- Separated from the subject by one blank line
- Lines wrapped at 72 characters (a long URL may stay on one line)
- Explains what changed and why, in plain words; mentions behaviour
  that changed on purpose, limits and known gaps
- Several independent changes go in a list with `- `; a wrapped list
  item continues with two spaces of indent
- No `Co-Authored-By: Claude` or "Generated with Claude Code" lines

Example:

```
feat(session): shuffle new words by a saved seed

Order new words within a level by a hash of a seed and the word id
instead of a fresh random shuffle each session. The seed is created on
first load and saved with the settings, so the order is the same in
every session. "New order" in settings picks a new seed.
```

The `commit-msg` hook in `.githooks/` checks the format. `npm install`
turns it on (`git config core.hooksPath .githooks`); merge, revert,
`fixup!` and `squash!` commits are not checked.
