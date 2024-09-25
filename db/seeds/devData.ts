/*
# TODO: Document why this exists and could be useful
source .env.local
pg_dump $DATABASE_URL --data-only --column-inserts -t 'public."SubsubsectionSpecial"' | grep 'INSERT INTO'
*/

const sql = `
INSERT INTO public."SubsubsectionSpecial" (id, "createdAt", "updatedAt", slug, title, "projectId") VALUES (1, '2023-12-20 19:31:21.496', '2023-12-20 19:31:21.496', 's1', 'Special 1', 1);
INSERT INTO public."SubsubsectionSpecial" (id, "createdAt", "updatedAt", slug, title, "projectId") VALUES (2, '2023-12-20 19:31:29.162', '2023-12-20 19:31:29.162', 's2', 'Special 22', 1);
INSERT INTO public."SubsubsectionSpecial" (id, "createdAt", "updatedAt", slug, title, "projectId") VALUES (3, '2023-12-20 19:31:36.93', '2023-12-20 19:31:36.93', 's3', 'Special 333', 1);
`

const seedDevData = async () => {
  // const prismaClient = new PrismaClient()
  // sql.split(';').forEach(statement => prismaClient.$executeRawUnsafe(statement))
}

export default seedDevData
