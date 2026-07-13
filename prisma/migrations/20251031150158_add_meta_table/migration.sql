-- CreateTable
CREATE TABLE "_Meta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "_Meta_pkey" PRIMARY KEY ("key")
);

-- Insert seed data
INSERT INTO "_Meta" ("key", "value") VALUES ('ENV', 'TODO');
