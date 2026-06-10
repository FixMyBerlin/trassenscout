# Development worktree setup

Use a **Git worktree** when you want a second checkout of this repo (e.g. `tanstack-start-migration`) beside your day-to-day `develop` folder, each on its own branch, each in its own Cursor window.

Same pattern as [tilda-geo `worktree-cli` README](https://github.com/FixMyBerlin/tilda-geo/blob/main/app/scripts/worktree-cli/README.md); Docker naming follows [tilda-geo `COMPOSE_DEV_CONTAINER_PREFIX`](https://github.com/FixMyBerlin/tilda-geo/blob/main/.env.example).

## When to use this

- Keep `develop` (or `main`) running locally while you work on the migration branch.
- Avoid constantly stashing / switching branches in one folder.
- Give the migration branch its **own Postgres volume** and container names so it does not collide with the default `ts-db` stack.

## 1. Create the worktree (sibling folder)

Git worktrees must live **outside** the current working tree. Create a **sibling** directory next to your primary checkout (same parent as `trassenscout`).

From your **primary** checkout (any branch):

```bash
cd /Users/you/Development/FMC/trassenscout

# Replace branch and folder name as needed
git worktree add ../trassenscout-tanstack-start-migration tanstack-start-migration
```

Result:

```
FMC/
├── trassenscout/                          # primary — e.g. develop
└── trassenscout-tanstack-start-migration/ # worktree — migration branch
```

Both folders share one `.git` object store; only the checked-out branch and working tree differ.

**Open in Cursor:** `File → Open Folder` → the new sibling path (separate window from the primary repo).

**Useful later:**

```bash
git worktree list
git worktree remove ../trassenscout-tanstack-start-migration   # when finished
git worktree prune                                             # after manual folder delete
```

## 2. Set up `.env` in the worktree

`.env` is gitignored — a new worktree does **not** copy it automatically.

From the **primary** checkout (which already has a working `.env`):

```bash
TARGET="../trassenscout-tanstack-start-migration"

for f in .env .env.test; do
  [ -f "$f" ] && cp "$f" "$TARGET/$f" && echo "Copied $f"
done

# imap-listener has its own dev env file
[ -f imap-listener/.env ] && cp imap-listener/.env "$TARGET/imap-listener/.env" && echo "Copied imap-listener/.env"
```

If you have no `.env` yet: `cp .env.example .env` in the worktree and fill in values.

### Separate Docker container names (required)

The primary checkout uses default dev containers: `ts-db`, `ts-imap-listener`.

In the **worktree** `.env`, set a prefix so Compose does not clash with the develop stack (same idea as tilda-geo):

```bash
# worktree .env — pick a short, unique prefix (trailing underscore recommended)
COMPOSE_DEV_CONTAINER_PREFIX=migration_
```

That yields containers `migration_ts-db` and `migration_ts-imap-listener`. `docker-compose.override.yml` reads this variable; `bun run dev` / `scripts/predev/checkDocker.ts` resolve the same name via `COMPOSE_DEV_CONTAINER_PREFIX`.

Leave `COMPOSE_DEV_CONTAINER_PREFIX` **unset** in the primary `develop` checkout so it keeps the default `ts-db` names.

## 3. Install and run Docker from the worktree

All commands below run from the **worktree root**:

```bash
cd ../trassenscout-tanstack-start-migration

bun install
bun run seed    # migrations + seed (first time)
bun run dev     # starts prefixed Docker (db + imap-listener) then Vite on :4000
```

Compose loads `.env` from the worktree directory automatically. Volumes are also namespaced by project directory, so the worktree gets its own `ts-data` volume even with a different branch's migrations.

### Port and concurrency limits

| Resource                | Constraint                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **App** (`bun run dev`) | Port **4000** is fixed. Only **one** checkout should run the dev server at a time (auth/session issues otherwise).     |
| **Postgres host port**  | Both stacks map **5432:5432**. Do not run both DB containers simultaneously — stop the other stack first.              |
| **Container names**     | Prefix avoids global Docker name clashes; stop the stack you are not using: `docker compose stop` in the other folder. |

Typical flow:

1. **Develop window:** `docker compose stop` (or answer “no” when `postdev` asks to stop — leave develop DB up only if the worktree will not start its own).
2. **Migration window:** `bun run dev` (starts `migration_ts-db`, seeds/migrates against that volume).
3. When switching back, stop the migration stack and start develop's again.

Check what is running:

```bash
docker ps --filter name=ts-db
docker ps --filter name=migration_ts-db
```

## 4. Day-to-day Git in each window

Each worktree is a normal repo root for Git:

```bash
git pull    # updates this worktree's branch only
git push
git fetch   # shared remotes across all worktrees
```

One branch per worktree — Git will not let you check out the same branch in two paths.

## Quick reference

| Checkout | Path                                      | Branch                     | `COMPOSE_DEV_CONTAINER_PREFIX` | DB container      |
| -------- | ----------------------------------------- | -------------------------- | ------------------------------ | ----------------- |
| Primary  | `…/trassenscout`                          | `develop`                  | _(unset)_                      | `ts-db`           |
| Worktree | `…/trassenscout-tanstack-start-migration` | `tanstack-start-migration` | `migration_`                   | `migration_ts-db` |

## Related

- Migration index: [`README.md`](./README.md)
- tilda-geo worktree CLI: `../tilda-geo/app/scripts/worktree-cli/`
- Local env template: [`.env.example`](../.env.example)
