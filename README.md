<div align="center"><br><br>
  <h1 align="center">Trassenscout (Beta)</h1>
</div>

> Trassenscout (Beta) aids administrations in evaluating and developing cycle highways and other similar route-based infrastructure.
>
> Please contact hello@fixmycity.de to learn more.

---

## Architecture

This project is built with [TanStack Start](https://tanstack.com/start), [React](https://react.dev/), [Vite](https://vite.dev/), and [Bun](https://bun.sh/). Data is stored in PostgreSQL via Prisma.

## Development

For starting developing, the following steps could be helpful for getting started:

- Use or nvm to install Node.js: `nvm use`
- Install dependencies: `bun install`
- Start the development environment: `bun run dev`
- Run all checks: `bun run check` (check migrations, check TypeScript, run linter, run formatter, run tests)
- Use `bun run build` to test the build
- Husky: We run our checks on push. Use `git push --no-verify` to force-skip them.

Local development uses a gitignored `.env` file (see [`.env.example`](.env.example)). Production servers get `.env` from the deploy workflow.

**TanStack Start**

- File routes live in `src/routes`.
- Shared UI lives in `src/components`.
- Server-only code lives in `src/server`.
- Authentication is handled by Better Auth.

## Getting Started

1. Setup `.env`:<br />
   This will set up environment variables for PostgreSQL and other services.

   ```
   cp .env.example .env
   ```

1. Install Docker and open it once to finish the setup:

   ```
   brew install --cask docker
   ```

1. Start the PostgreSQL Server<br />
   This is done automatically with `bun run dev`.

   ```
   docker compose up -d
   ```

1. Seed your database:<br />
   Which will also apply migrations.

   ```
   bun run seed
   ```

1. Run your app in the development mode:

   ```
   bun run dev
   ```

1. Open [http://localhost:3000](http://localhost:3000).

## Tests

Runs your tests using Jest.

```
bun run test
```

Blitz comes with a test setup using [Vitest](https://vitest.dev/) and [react-testing-library](https://testing-library.com/).

## Working with data, database

Follow these steps to add a model with forms and pages:

1. Add or update the Prisma model in [prisma/schema.prisma](./prisma/schema.prisma).

1. Check [prisma/schema.prisma](./prisma/schema.prisma) if all was "translated".

1. Use `bun run migrate-create` (`bun prisma migrate dev --create-only`) to create the migration but not run it directly.

1. Double check the migration. For example, column renames are handled by deleting the column and adding a new one which we do not always want.

1. Use `bun run migrate` (`bun prisma migrate dev`) to apply the migration.

1. Schema:
   - Add a shared [Zod schema (Docs)](https://zod.dev/) in `src/shared/<domain>/` and use it for client-side validations.
   - Update the Zod schema to match the Prisma schema.
     - You can use `type UserType = z.infer<typeof UserSchema>` to create a TS schema from Zod that can be compared to the prisma schema (which are located in `node_modules/.prisma/client/index.d.ts`)
     - You can use https://github.com/CarterGrimmeisen/zod-prisma to generate a starting point for this based on the prisma schema. Use it in a separate branch when experimenting with generated schemas.

1. Add seed data in [prisma/seed.ts](./prisma/seed.ts) and [prisma/seeds/](./prisma/seeds/) - all models should have good seed data.
