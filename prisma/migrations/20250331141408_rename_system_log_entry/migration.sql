-- RenameEnum
ALTER TYPE "LogLevelEnum" RENAME TO "SystemLogLevelEnum";

-- ModifyEnum
DELETE FROM pg_enum WHERE enumlabel = 'WARN' AND enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'SystemLogLevelEnum'
);

-- RenameTable
ALTER TABLE "LogEntry" RENAME TO "SystemLogEntry";

-- AlterTable
ALTER TABLE "SystemLogEntry" RENAME CONSTRAINT "LogEntry_pkey" TO "SystemLogEntry_pkey";

-- RenameForeignKey
ALTER TABLE "SystemLogEntry" RENAME CONSTRAINT "LogEntry_projectId_fkey" TO "SystemLogEntry_projectId_fkey";

-- RenameForeignKey
ALTER TABLE "SystemLogEntry" RENAME CONSTRAINT "LogEntry_userId_fkey" TO "SystemLogEntry_userId_fkey";
