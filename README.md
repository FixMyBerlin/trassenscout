## Getting Started

1. Setup `.env.local`:
This will setup up the [Environment Variables](#environment-variables) for PostgreSQL.
```
cp .env.local.example .env.local
```

1. Install Docker and open it once to finish the setup:
```
brew install --cask tableplus
```

1. Start the PostgreSQL Server:
```
docker compose up -d
```

1. Apply Migrations:
```
blitz prisma migrate dev
```

1. Run your app in the development mode:
```
blitz dev
```

1. Open [http://localhost:3000](http://localhost:3000).

## <a id="environment-variables"></a>Environment Variables

Ensure the `.env.local` file has required environment variables or just copy .env.local.example:

```
DATABASE_URL=postgresql://postgres:password@localhost:6001/postgres
```

Ensure the `.env.test.local` file has required environment variables:

```
DATABASE_URL=postgresql://<YOUR_DB_USERNAME>@localhost:5432/rsv-builder_test
```

## Tests

Runs your tests using Jest.

```
yarn test
```

Blitz comes with a test setup using [Vitest](https://vitest.dev/) and [react-testing-library](https://testing-library.com/).

## Working with data, database

### "new schema" flow

1. Use `blitz g all calendarEntries title:string startAt:dateTime "locationName:string?" "locationUrl:string?" "description:string?" --dry-run` for scaffolding.
  - Run `--dry-run` first to check the folder names and file names.

1. Check [db/schema.prisma](./db/schema.prisma) if all was "translated".

1. Use `blitz prisma migrate dev --create-only` to create the migration but not run it direclty.

1. Double check the migration. For example, column renames are handled by deleting the column and adding a new one which we do not always want.

1. Use `blitz prisma migrate dev` to apply the migration.

1. Schema:
   - Follow the steps in `src/core/templates/page/__modelIdParam__/edit.tsx` to create a shared [Zod schema (Docs)](https://zod.dev/) and add it to the form for client side validations.
   - Update the zod schema to match the Prisma schema.
     - You can use `type UserType = z.infer<typeof UserSchema>` to create a TS schema from zod that can be compared to the prima schema (which are located in `node_modules/.prisma/client/index.d.ts`)
     - You can use https://github.com/CarterGrimmeisen/zod-prisma to generate a starting point for this based on the prisma schema. However, this package should only be used in a separate branch since it collides with blitz in some way.

1. Add seed data in [db/seeds.ts](./db/seeds.ts) – all models should have good seed data.

### Seeding

Use `npm run seed`. It will drop and migrate the db and apply the seeds afterwards.

## Commands

Blitz comes with a powerful CLI that is designed to make development easy and fast. You can install it with `npm i -g blitz`

```
  blitz [COMMAND]

  dev       Start a development server
  build     Create a production build
  start     Start a production server
  export    Export your Blitz app as a static application
  prisma    Run prisma commands
  generate  Generate new files for your Blitz project
  console   Run the Blitz console REPL
  install   Install a recipe
  help      Display help for blitz
  test      Run project tests
```

You can read more about it on the [CLI Overview](https://blitzjs.com/docs/cli-overview) documentation.

## What's included?

Here is the starting structure of your app.

```
rsv-builder
├── src/
│   ├── api/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── mutations/
│   │   │   ├── changePassword.ts
│   │   │   ├── forgotPassword.test.ts
│   │   │   ├── forgotPassword.ts
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   ├── resetPassword.test.ts
│   │   │   ├── resetPassword.ts
│   │   │   └── signup.ts
│   │   ├── pages/
│   │   │   ├── forgot-password.tsx
│   │   │   ├── login.tsx
│   │   │   ├── reset-password.tsx
│   │   │   └── signup.tsx
│   │   └── validations.ts
│   ├── core/
│   │   ├── components/
│   │   │   ├── Form.tsx
│   │   │   └── LabeledTextField.tsx
│   │   └── layouts/
│   │       └── Layout.tsx
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── 404.tsx
│   │   ├── index.test.tsx
│   │   └── index.tsx
│   └── users/
│       ├── hooks/
│       │   └── useCurrentUser.ts
│       └── queries/
│           └── getCurrentUser.ts
├── db/
│   ├── migrations/
│   ├── index.ts
│   ├── schema.prisma
│   └── seeds.ts
├── integrations/
├── mailers/
│   └── forgotPasswordMailer.ts
├── public/
│   ├── favicon.ico
│   └── logo.png
├── test/
│   ├── setup.ts
│   └── utils.tsx
├── .eslintrc.js
├── babel.config.js
├── blitz.config.ts
├── jest.config.ts
├── package.json
├── README.md
├── tsconfig.json
└── types.ts
```

These files are:

- The `app/` folder is a container for most of your project. This is where you’ll put any pages or API routes.

- `db/` is where your database configuration goes. If you’re writing models or checking migrations, this is where to go.

- `public/` is a folder where you will put any static assets. If you have images, files, or videos which you want to use in your app, this is where to put them.

- `integrations/` is a folder to put all third-party integrations like with Stripe, Sentry, etc.

- `test/` is a folder where you can put test utilities and integration tests.

- `package.json` contains information about your dependencies and devDependencies. If you’re using a tool like `npm` or `yarn`, you won’t have to worry about this much.

- `tsconfig.json` is our recommended setup for TypeScript.

- `.babel.config.js`, `.eslintrc.js`, `.env`, etc. ("dotfiles") are configuration files for various bits of JavaScript tooling.

- `blitz.config.ts` is for advanced custom configuration of Blitz. [Here you can learn how to use it](https://blitzjs.com/docs/blitz-config).

- `jest.config.js` contains config for Jest tests. You can [customize it if needed](https://jestjs.io/docs/en/configuration).

You can read more about it in the [File Structure](https://blitzjs.com/docs/file-structure) section of the documentation.

## Learn more

Read the [Blitz.js Documentation](https://blitzjs.com/docs/getting-started) to learn more.

The Blitz community is warm, safe, diverse, inclusive, and fun! Feel free to reach out to us in any of our communication channels.

- [Website](https://blitzjs.com)
- [Discord](https://blitzjs.com/discord)
- [Report an issue](https://github.com/blitz-js/blitz/issues/new/choose)
- [Forum discussions](https://github.com/blitz-js/blitz/discussions)
- [How to Contribute](https://blitzjs.com/docs/contributing)
- [Sponsor or donate](https://github.com/blitz-js/blitz#sponsors-and-donations)
