-- DropForeignKey
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_userId_fkey";

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
