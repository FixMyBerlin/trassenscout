<div align="center"><br><br>
  <h1 align="center">Trassenscout (Beta)</h1>
</div>

> Trassenscout (Beta) aids administrations in evaluating and developing cycle highways and other similar route-based infrastructure.
>
> Please contact hello@fixmycity.de to learn more.

---

## Architecture

This project is build with [BlitzJS](https://blitzjs.com/) a toolkit build upon [ReactJS](https://reactjs.org/). Data is stored in a PostgreSQL database using Docker.

## Development

For starting developing, the following steps could be helpful for getting started:

- Use or nvm to install Node.js: `nvm use`
- Install dependenices: `npm install`
- Start develop environment: `npm run dev` (start docker, start blitz)
- Run all checks: `npm run check` (check migrations, check typescript run linter, run prettier, run tests)
- Use `npm run build && npx serve dist` to test the build
- Husky: We run our checks on push. Use `git push --no-verify` to force-skip them.

There is a `.env.local` and a `.env.production` file, which provide the keys to some services.

**Blitz vs. NextJS**

- Blitz provides the basic file structure and conventions [(Docs)](https://blitzjs.com/docs/file-structure)
- BLitz provides the [Blitz CLI (Docs)](https://blitzjs.com/docs/cli-overview), especially the [generators (Docs)](https://blitzjs.com/docs/cli-generate)
- Blitz handles Authentication with [Blitz Auth (Docs)](https://blitzjs.com/docs/auth)
- Blitz handels the communication between server and client with [Blitz RPC (Docs)](https://blitzjs.com/docs/rpc-overview)
- Blitz enhances NextJS with [type save routes (Docs)](https://blitzjs.com/docs/cli-routes)
- Everything else is part of Next JS and documented in [the Next JS Docs](https://nextjs.org/docs/getting-started).
  > **Note** This project usees Next 12 (for now).

## Getting Started

1. Setup `.env.local`:<br />
   This will setup up the [Environment Variables](#environment-variables) for PostgreSQL.

   ```
   cp .env.local.example .env.local
   ```

1. Install Docker and open it once to finish the setup:

   ```
   brew install --cask docker
   ```

1. Start the PostgreSQL Server<br />
   This is done automatically with `npm run dev`.

   ```
   docker compose up -d
   ```

1. Seed your database:<br />
   Which will also apply migrations.

   ```
   npm run seed
   ```

1. Run your app in the development mode:

   ```
   npm run dev
   ```

1. Open [http://localhost:3000](http://localhost:3000).

## Tests

Runs your tests using Jest.

```
npm run test
```

Blitz comes with a test setup using [Vitest](https://vitest.dev/) and [react-testing-library](https://testing-library.com/).

## Working with data, database

Follow this steps to add a model with forms and pages:

1. Use `blitz g all calendarEntries title:string startAt:dateTime "locationName:string?" "locationUrl:string?" "description:string?" --dry-run` for scaffolding.

   - Run `--dry-run` first to check the folder names and file names.

1. Check [db/schema.prisma](./db/schema.prisma) if all was "translated".

1. Use `npm run migrate:create` (`blitz prisma migrate dev --create-only`) to create the migration but not run it direclty.

1. Double check the migration. For example, column renames are handled by deleting the column and adding a new one which we do not always want.

1. Use `npm run migrate` (`blitz prisma migrate dev`) to apply the migration.

1. Schema:

   - Follow the steps in `src/core/templates/page/__modelIdParam__/edit.tsx` to create a shared [Zod schema (Docs)](https://zod.dev/) and add it to the form for client side validations.
   - Update the zod schema to match the Prisma schema.
     - You can use `type UserType = z.infer<typeof UserSchema>` to create a TS schema from zod that can be compared to the prima schema (which are located in `node_modules/.prisma/client/index.d.ts`)
     - You can use https://github.com/CarterGrimmeisen/zod-prisma to generate a starting point for this based on the prisma schema. However, this package should only be used in a separate branch since it collides with blitz in some way.

1. Add seed data in [db/seeds.ts](./db/seeds.ts) – all models should have good seed data.
